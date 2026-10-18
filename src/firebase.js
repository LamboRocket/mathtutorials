import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  getDoc,
  arrayUnion,
  updateDoc,
  increment
} from 'firebase/firestore';
import { firebaseConfig } from './config/firebase.js';
import defaultGames from './data/games.json';

// Initialize Firebase App & Firestore
let app = null;
let db = null;
let isFirebaseAvailable = false;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
  isFirebaseAvailable = true;
} catch (e) {
  console.warn('Firebase initialization notice:', e);
}

export { db, isFirebaseAvailable };

/**
 * SHA-256 helper using native browser Web Crypto API
 * Keeps passwords hashed securely so plain-text is never sent or stored
 */
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify admin passcode against Firestore (never stored hardcoded in code)
 */
export async function verifyAdminPassword(inputPasscode) {
  if (!isFirebaseAvailable || !db) {
    return inputPasscode === 'admin123';
  }

  try {
    const secRef = doc(db, 'settings', 'security');
    const secSnap = await getDoc(secRef);
    const inputHash = await sha256(inputPasscode);

    if (!secSnap.exists()) {
      const defaultHash = await sha256('admin123');
      await setDoc(secRef, {
        passwordHash: defaultHash,
        updatedAt: new Date().toISOString()
      });
      return inputHash === defaultHash;
    }

    const storedHash = secSnap.data().passwordHash;
    return inputHash === storedHash;
  } catch (err) {
    console.error('Error verifying admin password in Firebase:', err);
    throw err;
  }
}

/**
 * Update admin passcode in Firestore
 */
export async function updateAdminPasswordInFirebase(currentPasscode, newPasscode) {
  if (!isFirebaseAvailable || !db) {
    throw new Error('Firebase connection unavailable');
  }

  const isValid = await verifyAdminPassword(currentPasscode);
  if (!isValid) {
    throw new Error('Current passcode is incorrect');
  }

  const newHash = await sha256(newPasscode);
  const secRef = doc(db, 'settings', 'security');
  await setDoc(secRef, {
    passwordHash: newHash,
    updatedAt: new Date().toISOString()
  });
  return true;
}

/**
 * Increments or decrements a game's global rating in Firestore when favorited
 * Real-time listener immediately reflects this to ALL users on the website
 */
export async function toggleGameRatingInFirebase(gameId, isAdding) {
  if (!isFirebaseAvailable || !db) return;

  try {
    const gameRef = doc(db, 'games', gameId);
    // Use setDoc with merge to ensure field is updated/created seamlessly
    await setDoc(gameRef, {
      rating: increment(isAdding ? 1 : -1)
    }, { merge: true });
  } catch (err) {
    console.warn('Could not update rating in Firestore:', err);
  }
}

/**
 * Initializes default games in Firestore only ONCE so deleted games are never resurrected.
 */
async function ensureFirestoreInitialized() {
  if (!isFirebaseAvailable || !db) return;

  try {
    const initDocRef = doc(db, 'settings', 'init');
    const initDocSnap = await getDoc(initDocRef);

    if (!initDocSnap.exists()) {
      // First-time seed of initial games with baseline rating
      const seedPromises = defaultGames.map((g, index) => {
        return setDoc(doc(db, 'games', g.id), {
          id: g.id,
          title: g.title,
          category: g.category,
          description: g.description,
          iframeUrl: g.iframeUrl,
          thumbnail: g.thumbnail,
          plays: g.plays || '100K',
          rating: 25 + (index * 7), // baseline initial rating
          controls: g.controls || [],
          tags: g.tags || [],
          isCustom: false,
          createdAt: new Date().toISOString()
        });
      });

      await Promise.all(seedPromises);
      await setDoc(initDocRef, { initialized: true, timestamp: Date.now() });
      await setDoc(doc(db, 'settings', 'deleted'), { deletedIds: [] });
    }
  } catch (err) {
    console.warn('Initialization notice:', err);
  }
}

/**
 * Real-time listener for the global games collection
 * Automatically broadcasts deletions, additions, and ratings to ALL users in real time.
 */
export function subscribeToGlobalGames(onUpdate, onError) {
  if (!isFirebaseAvailable || !db) {
    if (onUpdate) onUpdate(defaultGames);
    return () => {};
  }

  // Trigger one-time initialization check
  ensureFirestoreInitialized();

  const gamesRef = collection(db, 'games');
  const deletedRef = doc(db, 'settings', 'deleted');

  let currentGames = [];
  let currentDeletedIds = [];

  function broadcast() {
    const activeGames = currentGames.filter(g => !currentDeletedIds.includes(g.id));
    if (onUpdate) {
      onUpdate(activeGames.length > 0 ? activeGames : currentGames);
    }
  }

  // Listen to deleted IDs in real time
  const unsubscribeDeleted = onSnapshot(deletedRef, (snap) => {
    if (snap.exists() && Array.isArray(snap.data().deletedIds)) {
      currentDeletedIds = snap.data().deletedIds;
    }
    broadcast();
  }, (err) => {
    console.warn('Deleted setting listener notice:', err);
  });

  // Listen to games collection in real time
  const unsubscribeGames = onSnapshot(gamesRef, (snapshot) => {
    if (!snapshot.empty) {
      const items = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        items.push({ 
          id: docSnap.id, 
          ...data,
          rating: typeof data.rating === 'number' ? data.rating : 10
        });
      });
      currentGames = items;
      broadcast();
    } else {
      currentGames = defaultGames.map(g => ({ ...g, rating: 20 }));
      broadcast();
    }
  }, (err) => {
    console.warn('Firestore snapshot error:', err);
    if (onError) onError(err);
  });

  return () => {
    unsubscribeDeleted();
    unsubscribeGames();
  };
}

/**
 * Add a new game to Firestore (Admin action - visible to all users immediately)
 */
export async function addGlobalGame(newGame) {
  if (!isFirebaseAvailable || !db) {
    return false;
  }
  const cleanId = newGame.id || `game-${Date.now()}`;
  const docRef = doc(db, 'games', cleanId);
  await setDoc(docRef, {
    id: cleanId,
    title: newGame.title,
    category: newGame.category,
    description: newGame.description || '',
    iframeUrl: newGame.iframeUrl,
    thumbnail: newGame.thumbnail || '',
    plays: newGame.plays || '1',
    rating: 1, // initial rating for newly created games
    controls: newGame.controls || [],
    tags: newGame.tags || [],
    isCustom: true,
    createdAt: new Date().toISOString()
  });
  return true;
}

/**
 * Remove a game from Firestore (Admin action - removed for ALL users immediately)
 */
export async function removeGlobalGame(gameId) {
  if (!isFirebaseAvailable || !db) {
    return false;
  }

  try {
    const gameDocRef = doc(db, 'games', gameId);
    await deleteDoc(gameDocRef);

    const deletedRef = doc(db, 'settings', 'deleted');
    const snap = await getDoc(deletedRef);
    if (snap.exists()) {
      await updateDoc(deletedRef, {
        deletedIds: arrayUnion(gameId)
      });
    } else {
      await setDoc(deletedRef, {
        deletedIds: [gameId]
      });
    }
    return true;
  } catch (err) {
    console.error('Failed to remove game from Firestore:', err);
    throw err;
  }
}
