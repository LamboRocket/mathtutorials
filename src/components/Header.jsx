import React, { useRef, useEffect } from 'react';
import { Gamepad2, Search, Plus, Lock, Unlock, X, LogOut } from 'lucide-react';

export const Header = ({
  searchQuery,
  setSearchQuery,
  isAdmin,
  onOpenAddModal,
  onOpenAdminLogin,
  onAdminLogout
}) => {
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">
            Arcade<span className="text-indigo-400">Portal</span>
          </span>
        </div>

        {/* Clean Centered Search Bar */}
        <div className="flex-1 max-w-md relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games... (Press '/')"
              className="w-full bg-zinc-900/90 text-sm text-zinc-200 placeholder-zinc-500 rounded-xl pl-9 pr-9 py-2 border border-zinc-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-zinc-400 hover:text-white"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Admin Controls */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
                title="Add a new game"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Game</span>
              </button>

              <button
                onClick={onAdminLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-zinc-800 text-xs font-medium transition-colors"
                title="Exit admin mode"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs font-medium transition-colors"
              title="Admin login to add games"
            >
              <Lock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Admin</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
