import React from 'react';
import { Sparkles, Play, Star, Flame, Trophy } from 'lucide-react';

/**
 * Calculates current ISO week number so the Game of the Week updates automatically every Monday
 */
export function getWeekNumber(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export const GameOfTheWeek = ({
  games,
  onSelectGame,
  isFavorite,
  onToggleFavorite
}) => {
  if (!games || games.length === 0) return null;

  const currentWeek = getWeekNumber();
  // Deterministic weekly rotation using the current week number
  const gameIndex = currentWeek % games.length;
  const weeklyGame = games[gameIndex] || games[0];

  return (
    <div className="relative mb-8 rounded-3xl overflow-hidden border border-indigo-900/40 bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950/40 shadow-2xl">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 items-center relative z-10">
        
        {/* Left Content Area */}
        <div className="lg:col-span-7 p-6 sm:p-8">
          
          {/* Badge Row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 text-xs font-black tracking-wide uppercase px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 shadow-md shadow-amber-500/20">
              <Trophy className="w-3.5 h-3.5" />
              <span>GAME OF THE WEEK</span>
            </span>

            <span className="text-xs font-semibold text-zinc-400 bg-zinc-900/80 border border-zinc-800 px-2.5 py-0.5 rounded-full">
              Week #{currentWeek} &bull; Updates Weekly
            </span>

            <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{weeklyGame.rating || 0} Ratings</span>
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2.5">
            {weeklyGame.title}
          </h2>

          {/* Description */}
          <p className="text-sm text-zinc-300 leading-relaxed max-w-xl mb-6 line-clamp-2">
            {weeklyGame.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectGame(weeklyGame)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play Now</span>
            </button>

            <button
              onClick={(e) => onToggleFavorite(e, weeklyGame.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                isFavorite
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{isFavorite ? 'Upvoted' : 'Upvote / Star'}</span>
            </button>
          </div>
        </div>

        {/* Right Thumbnail Visual */}
        <div 
          onClick={() => onSelectGame(weeklyGame)}
          className="lg:col-span-5 relative h-56 sm:h-72 lg:h-full min-h-[240px] overflow-hidden cursor-pointer group"
        >
          <img
            src={weeklyGame.thumbnail}
            alt={weeklyGame.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent" />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/50">
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
