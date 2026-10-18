import React from 'react';
import { BookOpen, ArrowLeft, CheckCircle2, GraduationCap } from 'lucide-react';

export const StealthStudyScreen = ({ onExit }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#0c0f17] text-zinc-200 font-sans p-6 overflow-y-auto selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">AP Calculus & Physics Mechanics - Reference Guide</h1>
            <p className="text-[11px] text-zinc-400">Term 2 Exam Review &bull; Chapter 4: Derivatives & Kinematics</p>
          </div>
        </div>

        <button
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors"
          title="Return to Sam Elite (Press ESC)"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Study Mode (ESC)</span>
        </button>
      </div>

      {/* Educational Study Sheet Content */}
      <div className="max-w-4xl mx-auto space-y-6 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <h2 className="font-bold text-indigo-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Standard Differentiation Rules</span>
            </h2>
            <ul className="space-y-2 text-xs text-zinc-300 font-mono">
              <li className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
                <b>Power Rule:</b> d/dx [x^n] = n &times; x^(n-1)
              </li>
              <li className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
                <b>Product Rule:</b> d/dx [u &times; v] = u'v + uv'
              </li>
              <li className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
                <b>Quotient Rule:</b> d/dx [u / v] = (u'v - uv') / v^2
              </li>
              <li className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
                <b>Chain Rule:</b> d/dx [f(g(x))] = f'(g(x)) &times; g'(x)
              </li>
            </ul>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <h2 className="font-bold text-emerald-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Kinematics & Motion Equations</span>
            </h2>
            <ul className="space-y-2 text-xs text-zinc-300 font-mono">
              <li className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
                <b>Velocity:</b> v(t) = v₀ + a &times; t
              </li>
              <li className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
                <b>Position:</b> x(t) = x₀ + v₀t + &frac12; a &times; t^2
              </li>
              <li className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
                <b>Time-Independent:</b> v^2 = v₀^2 + 2a(x - x₀)
              </li>
              <li className="p-2 rounded bg-zinc-950/70 border border-zinc-800/80">
                <b>Kinetic Energy:</b> KE = &frac12; m &times; v^2
              </li>
            </ul>
          </div>

        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
          <h2 className="font-bold text-amber-400 text-xs uppercase tracking-wider mb-2">
            Practice Problems Checklist
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-zinc-300">
            <div className="flex items-center gap-2 p-2 rounded bg-zinc-950/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Problem Set 4.1 Completed</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-zinc-950/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Limit Theorems Verified</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-zinc-950/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Vectors & Scalars Review</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
