import React, { useState } from 'react';
import { X, Plus, AlertCircle, ShieldCheck, Image as ImageIcon } from 'lucide-react';

const THUMBNAIL_PRESETS = [
  { name: 'Neon Arcade', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Cyber Grid', url: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=600&q=80' },
  { name: 'Retro Puzzle', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80' },
  { name: 'Space Galaxy', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80' },
  { name: 'Classic Blocks', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80' },
  { name: 'Pixel Arena', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80' }
];

export const AddGameModal = ({
  isOpen,
  onClose,
  onAddGame
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Arcade');
  const [iframeUrl, setIframeUrl] = useState('');
  const [description, setDescription] = useState('');
  const [controls, setControls] = useState('Arrow Keys: Move, Space: Action');
  const [thumbnail, setThumbnail] = useState(THUMBNAIL_PRESETS[0].url);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a game title.');
      return;
    }
    if (!iframeUrl.trim()) {
      setError('Please provide an iframe URL.');
      return;
    }

    let cleanUrl = iframeUrl.trim();
    if (cleanUrl.includes('<iframe')) {
      const match = cleanUrl.match(/src=["'](.*?)["']/);
      if (match && match[1]) {
        cleanUrl = match[1];
      }
    }

    const newGame = {
      id: `game-${Date.now()}`,
      title: title.trim(),
      category: category,
      plays: '1',
      tags: ['Custom', category.toLowerCase()],
      description: description.trim() || 'Custom iframe game.',
      iframeUrl: cleanUrl,
      controls: controls.split(',').map(s => s.trim()).filter(Boolean),
      thumbnail: thumbnail.trim() || THUMBNAIL_PRESETS[0].url,
      isCustom: true
    };

    onAddGame(newGame);
    setTitle('');
    setIframeUrl('');
    setDescription('');
    setThumbnail(THUMBNAIL_PRESETS[0].url);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400 border border-indigo-800/60">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add Game (Admin)</h2>
              <p className="text-[11px] text-zinc-400">Add an iframe game and customize thumbnail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="my-3 p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Game Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Retro Bowl, 1v1 LOL"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Action">Action</option>
                <option value="Arcade">Arcade</option>
                <option value="Puzzle">Puzzle</option>
                <option value="Retro">Retro</option>
                <option value="Sports">Sports</option>
                <option value="Casual">Casual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Iframe URL or Embed Code *
            </label>
            <input
              type="text"
              value={iframeUrl}
              onChange={(e) => setIframeUrl(e.target.value)}
              placeholder="https://... or <iframe src='...'>"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              required
            />
          </div>

          {/* Thumbnail Selection & Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Thumbnail Cover Image</span>
              </label>
              <span className="text-[11px] text-zinc-500">URL or select preset below</span>
            </div>

            <div className="flex gap-3 items-center">
              <input
                type="url"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="Enter image URL (https://...)"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs"
              />
              <div className="w-14 h-10 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 shrink-0">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.opacity = '0.3'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700 text-[10px]">None</div>
                )}
              </div>
            </div>

            {/* Thumbnail Quick Presets */}
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[10px] text-zinc-500 shrink-0">Presets:</span>
              {THUMBNAIL_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setThumbnail(preset.url)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors shrink-0 ${
                    thumbnail === preset.url
                      ? 'bg-indigo-950 border-indigo-600 text-indigo-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Controls (comma-separated)
            </label>
            <input
              type="text"
              value={controls}
              onChange={(e) => setControls(e.target.value)}
              placeholder="Arrow Keys: Move, Space: Jump"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of the game..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-xs resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
            >
              Add Game
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
