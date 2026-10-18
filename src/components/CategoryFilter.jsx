import React from 'react';
import { Star, ArrowUpDown } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Favorites',
  'Action',
  'Arcade',
  'Puzzle',
  'Retro',
  'Sports',
  'Casual',
];

export const CategoryFilter = ({
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  categoryCounts = {},
  favoritesCount = 0
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-zinc-800/80">
      
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {CATEGORIES.map((label) => {
          const isSelected = selectedCategory === label;
          const count = label === 'Favorites' ? favoritesCount : (categoryCounts[label] ?? 0);

          return (
            <button
              key={label}
              onClick={() => onSelectCategory(label)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800/60'
              }`}
            >
              {label === 'Favorites' && (
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              )}
              <span>{label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sort Selector */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-xs text-zinc-400">
        <ArrowUpDown className="w-3.5 h-3.5" />
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort games"
          className="bg-zinc-900 text-xs text-zinc-300 border border-zinc-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="rating">Top Rated (Most Starred)</option>
          <option value="popular">Most Played</option>
          <option value="title">A - Z</option>
        </select>
      </div>

    </div>
  );
};
