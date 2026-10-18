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
  updateDoc
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
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
 * Initializes default games in Firestore only ONCE so deleted games are never resurrected.
 */
async function ensureFirestoreInitialized() {
  if (!isFirebaseAvailable || !db) return;

  try {
    const initDocRef = doc(db, 'settings', 'init');
    const initDocSnap = await getDoc(initDocRef);

    if (!initDocSnap.exists()) {
      // First-time seed of initial games
      const seedPromises = defaultGames.map(g => {
        return setDoc(doc(db, 'games', g.id), {
          id: g.id,
          title: g.title,
          category: g.category,
          description: g.description,
          iframeUrl: g.iframeUrl,
          thumbnail: g.thumbnail,
          plays: g.plays || '100K',
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
 * Automatically broadcasts deletions and additions to ALL users in real time.
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
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      currentGames = items;
      broadcast();
    } else {
      // If collection is still empty right before seed completes, pass defaultGames
      currentGames = defaultGames;
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
    // 1. Delete document from games collection
    const gameDocRef = doc(db, 'games', gameId);
    await deleteDoc(gameDocRef);

    // 2. Add to global deleted list so it stays deleted across all clients
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
