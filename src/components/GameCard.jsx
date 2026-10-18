import React from 'react';
import { Star, Play, Gamepad2, Trash2, Flame } from 'lucide-react';

export const GameCard = ({
  game,
  isFavorite,
  onToggleFavorite,
  onSelectGame,
  isAdmin,
  onDeleteGame
}) => {
  return (
    <div
      onClick={() => onSelectGame(game)}
      className="group relative bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        <img
          src={game.thumbnail}
          alt={game.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        
        {/* Fallback pattern */}
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 -z-10">
          <Gamepad2 className="w-10 h-10 text-zinc-800" />
        </div>

        {/* Category Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-zinc-950/80 backdrop-blur-sm text-zinc-300 border border-zinc-800">
            {game.category}
          </span>
        </div>

        {/* Top-Right Action: Favorite/Upvote and Admin Delete */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteGame(game);
              }}
              title="Delete game from portal for all users"
              className="w-7 h-7 rounded-full flex items-center justify-center bg-rose-950/90 hover:bg-rose-800 text-rose-300 hover:text-white border border-rose-800 transition-colors shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={(e) => onToggleFavorite(e, game.id)}
            title={isFavorite ? 'Remove star (decrements rating in Firebase)' : 'Star this game (increments rating in Firebase)'}
            className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
              isFavorite
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'bg-zinc-950/80 hover:bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-zinc-950' : ''}`} />
          </button>
        </div>

        {/* Play Icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Live Firebase Rating Badge */}
        <div className="absolute bottom-2 right-2.5 flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-zinc-950/85 backdrop-blur-sm px-2 py-0.5 rounded-md border border-zinc-800">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{game.rating || 0}</span>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-zinc-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
            {game.title}
          </h3>
          <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {game.description}
          </p>
        </div>
      </div>
    </div>
  );
};
