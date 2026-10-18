import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Star, 
  Keyboard
} from 'lucide-react';
import { resolveGameUrl } from '../utils/url.js';

export const GamePlayer = ({
  game,
  isFavorite,
  onToggleFavorite,
  onBack
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const playerContainerRef = useRef(null);

  const handleReload = () => {
    setIframeKey(prev => prev + 1);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 animate-in fade-in duration-150">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Hub</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Favorite / Upvote with Live Firebase Rating */}
          <button
            onClick={(e) => onToggleFavorite(e, game.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isFavorite
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800'
            }`}
            title={isFavorite ? 'Remove star' : 'Star this activity (ups rating in Firebase)'}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{isFavorite ? 'Starred' : 'Star'}</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-md bg-zinc-800/80 text-amber-400 text-[10px] font-bold">
              {game.rating || 0}
            </span>
          </button>

          {/* Restart */}
          <button
            onClick={handleReload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-all"
            title="Reload activity"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restart</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Main Player Container */}
      <div
        ref={playerContainerRef}
        className={`relative rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl ${
          isFullscreen ? '!max-w-none !h-screen !rounded-none !border-none' : ''
        }`}
      >
        <div
          className={`relative w-full bg-zinc-950 flex items-center justify-center ${
            isFullscreen ? 'h-screen' : 'aspect-video min-h-[480px] max-h-[700px]'
          }`}
        >
          <iframe
            key={iframeKey}
            src={resolveGameUrl(game.iframeUrl)}
            title={game.title}
            className="w-full h-full border-0 select-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms allow-popups"
          />
        </div>

        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-900 text-white backdrop-blur-sm border border-zinc-700 shadow-lg"
            title="Exit Fullscreen"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Clean Activity Info & Controls Guide */}
      <div className="mt-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-950 text-indigo-400 border border-indigo-800/50">
                {game.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{game.rating || 0} Global Stars</span>
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-white">
              {game.title}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="md:col-span-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Overview
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {game.description}
            </p>
          </div>

          {game.controls && game.controls.length > 0 && (
            <div className="bg-zinc-950/60 border border-zinc-800/50 rounded-xl p-3.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
                Controls
              </h2>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {game.controls.map((ctrl, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold">&bull;</span>
                    <span>{ctrl}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
