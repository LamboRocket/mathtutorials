import React from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

export const DeleteConfirmModal = ({
  isOpen,
  game,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !game) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-950 flex items-center justify-center text-rose-400 border border-rose-800/60">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">Delete Game</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800 mb-3">
            <img
              src={game.thumbnail}
              alt={game.title}
              className="w-12 h-12 rounded-lg object-cover bg-zinc-900"
              onError={(e) => { e.target.style.opacity = '0.3'; }}
            />
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-white truncate">{game.title}</h3>
              <p className="text-xs text-zinc-400">{game.category}</p>
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Are you sure you want to remove <b className="text-zinc-200">"{game.title}"</b>? This will permanently remove the game from ArcadePortal for <b className="text-rose-400">all visitors and users</b>.
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-zinc-800 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(game.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete for Everyone</span>
          </button>
        </div>

      </div>
    </div>
  );
};
