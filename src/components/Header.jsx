import React, { useRef, useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  Lock, 
  LogOut, 
  X, 
  Glasses, 
  Sparkles,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';

const CLOAK_PRESETS = [
  {
    name: 'Google Classroom',
    title: 'Classes',
    icon: 'https://ssl.gstatic.com/classroom/favicon.png'
  },
  {
    name: 'Google Docs',
    title: 'Math Notes - Google Docs',
    icon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico'
  },
  {
    name: 'Canvas LMS',
    title: 'Dashboard - Canvas',
    icon: 'https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico'
  }
];

export const Header = ({
  searchQuery,
  setSearchQuery,
  isAdmin,
  onOpenAddModal,
  onOpenAdminLogin,
  onAdminLogout,
  onTriggerStealth
}) => {
  const searchInputRef = useRef(null);
  const [showCloakMenu, setShowCloakMenu] = useState(false);
  const [isCloaked, setIsCloaked] = useState(false);
  const cloakRef = useRef(null);

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

  // Close cloak menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (cloakRef.current && !cloakRef.current.contains(e.target)) {
        setShowCloakMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const applyCloak = (preset) => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    if (preset) {
      document.title = preset.title;
      link.href = preset.icon;
      setIsCloaked(true);
    } else {
      document.title = 'Sam Elite - Interactive Tools & Learning Hub';
      link.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'><polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'/></svg>";
      setIsCloaked(false);
    }
    setShowCloakMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo - Sam Elite */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-600/30">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-black text-lg tracking-tight text-white">
            SAM <span className="text-indigo-400">ELITE</span>
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
              placeholder="Search simulations & activities... ('/')"
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

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          
          {/* Anti-School Filter Tab Cloak */}
          <div className="relative" ref={cloakRef}>
            <button
              onClick={() => setShowCloakMenu(!showCloakMenu)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isCloaked 
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300' 
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800'
              }`}
              title="Disguise browser tab (Bypasses school monitoring and teacher screens)"
            >
              <Glasses className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{isCloaked ? 'Cloaked' : 'Disguise Tab'}</span>
            </button>

            {showCloakMenu && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 font-bold text-zinc-400 border-b border-zinc-800 mb-1">
                  School Camouflage
                </div>
                {CLOAK_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => applyCloak(p)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-zinc-200 hover:bg-zinc-800 transition-colors"
                  >
                    <img src={p.icon} alt="" className="w-3.5 h-3.5 object-contain" />
                    <span>{p.name}</span>
                  </button>
                ))}
                {isCloaked && (
                  <button
                    onClick={() => applyCloak(null)}
                    className="w-full mt-1 pt-1 border-t border-zinc-800 px-2.5 py-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg text-left font-medium"
                  >
                    Reset Tab Title
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Stealth Study Key Button (Press ESC) */}
          <button
            onClick={onTriggerStealth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition-all"
            title="Instant Study Screen (Press ESC)"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Study Mode</span>
          </button>

          {/* Admin Controls */}
          {isAdmin ? (
            <>
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
                title="Add a new activity"
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
              title="Admin login"
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
