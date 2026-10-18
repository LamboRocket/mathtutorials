/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import initialGamesData from './data/games.json';
import { 
  subscribeToGlobalGames, 
  addGlobalGame, 
  removeGlobalGame, 
  toggleGameRatingInFirebase,
  isFirebaseAvailable 
} from './firebase.js';
import { Header } from './components/Header.jsx';
import { CategoryFilter } from './components/CategoryFilter.jsx';
import { GameCard } from './components/GameCard.jsx';
import { GamePlayer } from './components/GamePlayer.jsx';
import { AddGameModal } from './components/AddGameModal.jsx';
import { AdminLoginModal } from './components/AdminLoginModal.jsx';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.jsx';
import { GameOfTheWeek } from './components/GameOfTheWeek.jsx';
import { StealthStudyScreen } from './components/StealthStudyScreen.jsx';
import { Gamepad2, Play, Clock, Cloud, Sparkles } from 'lucide-react';

export default function App() {
  const [games, setGames] = useState(initialGamesData);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating'); // Default to top rated / starred!
  const [favorites, setFavorites] = useState([]);
  const [recentGameIds, setRecentGameIds] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [isStealthMode, setIsStealthMode] = useState(false);

  // 1. Real-time Firebase Sync & Fallback
  useEffect(() => {
    // Listen to live Firestore changes across all users
    const unsubscribe = subscribeToGlobalGames(
      (liveGames) => {
        if (liveGames && liveGames.length > 0) {
          setGames(liveGames);
          setIsCloudSynced(true);
        }
      },
      async (err) => {
        console.warn('Fallback to local catalog:', err);
        try {
          const baseUrl = import.meta.env.BASE_URL || './';
          const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
          const res = await fetch(`${normalizedBase}games.json`);
          if (res.ok) {
            const data = await res.json();
            setGames(data);
          } else {
            setGames(initialGamesData);
          }
        } catch {
          setGames(initialGamesData);
        }
      }
    );

    // Admin session state
    const savedAdmin = sessionStorage.getItem('arcadeportal_is_admin');
    if (savedAdmin === 'true') {
      setIsAdmin(true);
    }

    // Load favorites
    const savedFavs = localStorage.getItem('arcadeportal_favorites');
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    }

    // Load recent games
    const savedRecent = localStorage.getItem('arcadeportal_recent');
    if (savedRecent) {
      try { setRecentGameIds(JSON.parse(savedRecent)); } catch (e) {}
    }

    // Emergency Panic / Stealth hotkey (ESC or ~)
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedGame) {
          setSelectedGame(null);
        } else {
          setIsStealthMode(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedGame]);

  // 2. Admin Authentication
  const handleAdminLogin = () => {
    setIsAdmin(true);
    sessionStorage.setItem('arcadeportal_is_admin', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('arcadeportal_is_admin');
  };

  // 3. Select game to play
  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setRecentGameIds(prev => {
      const filtered = prev.filter(id => id !== game.id);
      const next = [game.id, ...filtered].slice(0, 8);
      localStorage.setItem('arcadeportal_recent', JSON.stringify(next));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Toggle Favorite (Ups rating in Firebase for all users to see)
  const toggleFavorite = (e, gameId) => {
    e.stopPropagation();
    const isAdding = !favorites.includes(gameId);

    // 1. Update user's local favorites
    setFavorites(prev => {
      const next = isAdding ? [...prev, gameId] : prev.filter(id => id !== gameId);
      localStorage.setItem('arcadeportal_favorites', JSON.stringify(next));
      return next;
    });

    // 2. Optimistic local rating update
    setGames(prev => prev.map(g => {
      if (g.id === gameId) {
        const currentRating = typeof g.rating === 'number' ? g.rating : 10;
        return { ...g, rating: Math.max(0, currentRating + (isAdding ? 1 : -1)) };
      }
      return g;
    }));

    // 3. Increment/Decrement rating in Firebase Firestore (broadcasts to all users)
    toggleGameRatingInFirebase(gameId, isAdding);
  };

  // 5. Add Game (Admin only - updates Firestore for everyone)
  const handleAddGame = async (newGame) => {
    // Optimistic local update
    setGames(prev => [newGame, ...prev]);

    // Save custom games in local storage as backup
    const savedCustom = localStorage.getItem('arcadeportal_custom_games');
    const customGames = savedCustom ? JSON.parse(savedCustom) : [];
    localStorage.setItem('arcadeportal_custom_games', JSON.stringify([newGame, ...customGames]));

    // Sync to Firebase Firestore globally
    try {
      await addGlobalGame(newGame);
    } catch (err) {
      console.warn('Error syncing game to Firestore:', err);
    }

    handleSelectGame(newGame);
  };

  // 6. Delete Game (Admin only - removes from Firestore for everyone)
  const handleDeleteGame = async (gameId) => {
    // 1. Optimistic local removal
    setGames(prev => prev.filter(g => g.id !== gameId));

    // 2. Update backup local storage
    const savedCustom = localStorage.getItem('arcadeportal_custom_games');
    if (savedCustom) {
      const customGames = JSON.parse(savedCustom).filter(g => g.id !== gameId);
      localStorage.setItem('arcadeportal_custom_games', JSON.stringify(customGames));
    }

    // 3. Sync deletion to Firebase Firestore globally
    try {
      await removeGlobalGame(gameId);
    } catch (err) {
      console.error('Error deleting game from Firestore:', err);
    }

    if (selectedGame?.id === gameId) {
      setSelectedGame(null);
    }
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: games.length };
    games.forEach(g => {
      counts[g.category] = (counts[g.category] || 0) + 1;
    });
    return counts;
  }, [games]);

  // Filtered & sorted games (with live Firebase ratings)
  const filteredGames = useMemo(() => {
    return games
      .filter(game => {
        if (selectedCategory === 'Favorites') {
          if (!favorites.includes(game.id)) return false;
        } else if (selectedCategory !== 'All') {
          if (game.category !== selectedCategory) return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = game.title.toLowerCase().includes(q);
          const matchCategory = game.category.toLowerCase().includes(q);
          const matchDesc = game.description?.toLowerCase().includes(q);
          if (!matchTitle && !matchCategory && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        const parsePlays = (p) => {
          if (!p) return 0;
          const num = parseFloat(p);
          if (typeof p === 'string' && p.includes('K')) return num * 1000;
          if (typeof p === 'string' && p.includes('M')) return num * 1000000;
          return num || 0;
        };
        return parsePlays(b.plays) - parsePlays(a.plays);
      });
  }, [games, selectedCategory, searchQuery, sortBy, favorites]);

  // Recently played list
  const recentGames = useMemo(() => {
    return recentGameIds
      .map(id => games.find(g => g.id === id))
      .filter(Boolean);
  }, [recentGameIds, games]);

  // If in Emergency Stealth / Study Mode, show Calculus & Physics guide
  if (isStealthMode) {
    return <StealthStudyScreen onExit={() => setIsStealthMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#090b10] text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Clean Navbar */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAdmin={isAdmin}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenAdminLogin={() => setIsAdminModalOpen(true)}
        onAdminLogout={handleAdminLogout}
        onTriggerStealth={() => setIsStealthMode(true)}
      />

      <main className="flex-1 pb-16">
        {selectedGame ? (
          <GamePlayer
            game={selectedGame}
            isFavorite={favorites.includes(selectedGame.id)}
            onToggleFavorite={toggleFavorite}
            onBack={() => setSelectedGame(null)}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            
            {/* Game of the Week Banner (Updates Weekly!) */}
            {!searchQuery && selectedCategory === 'All' && (
              <GameOfTheWeek
                games={games}
                onSelectGame={handleSelectGame}
                isFavorite={favorites.includes(games[0]?.id)}
                onToggleFavorite={toggleFavorite}
              />
            )}

            {/* Jump Back In (Recently Played) */}
            {!searchQuery && selectedCategory === 'All' && recentGames.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Jump Back In
                  </h2>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                  {recentGames.map(game => (
                    <div
                      key={game.id}
                      onClick={() => handleSelectGame(game)}
                      className="group flex items-center gap-3 bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-2.5 pr-4 shrink-0 cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        className="w-11 h-11 rounded-lg object-cover bg-zinc-950"
                      />
                      <div>
                        <div className="font-bold text-xs text-white group-hover:text-indigo-400 transition-colors">
                          {game.title}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {game.category}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clean Category Filters */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
              categoryCounts={categoryCounts}
              favoritesCount={favorites.length}
            />

            {/* Games Grid */}
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isFavorite={favorites.includes(game.id)}
                    onToggleFavorite={toggleFavorite}
                    onSelectGame={handleSelectGame}
                    isAdmin={isAdmin}
                    onDeleteGame={(targetGame) => setGameToDelete(targetGame)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center rounded-2xl border border-dashed border-zinc-800/80 bg-zinc-950/30">
                <Gamepad2 className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                <h3 className="font-bold text-base text-white mb-1">
                  No activities found
                </h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  {searchQuery ? `No results for "${searchQuery}"` : "No items available in this category."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}

          </div>
        )}
      </main>

      {/* Clean Footer - Sam Elite */}
      <footer className="border-t border-zinc-800/60 bg-zinc-950 py-5 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>Sam Elite &bull; Interactive Tools & Learning Hub</span>
            {isCloudSynced && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                <Cloud className="w-3 h-3" />
                <span>Live Cloud Sync</span>
              </span>
            )}
          </div>
          <span>{games.length} Activities Available</span>
        </div>
      </footer>

      {/* Admin Passcode Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={handleAdminLogin}
      />

      {/* Add Game Modal (Only accessible by admin) */}
      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGame={handleAddGame}
      />

      {/* Delete Confirmation Modal (Replaces blocked window.confirm) */}
      <DeleteConfirmModal
        isOpen={Boolean(gameToDelete)}
        game={gameToDelete}
        onClose={() => setGameToDelete(null)}
        onConfirm={handleDeleteGame}
      />

    </div>
  );
}
