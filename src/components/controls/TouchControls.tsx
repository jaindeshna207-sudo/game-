import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw, Play } from 'lucide-react';

interface TouchControlsProps {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onActionA?: () => void;
  onActionB?: () => void;
  actionALabel?: string;
  actionBLabel?: string;
  className?: string;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onUp,
  onDown,
  onLeft,
  onRight,
  onActionA,
  onActionB,
  actionALabel = 'ACTION',
  actionBLabel = 'DROP',
  className = '',
}) => {
  return (
    <div className={`select-none flex items-center justify-between gap-4 p-3 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-sm ${className}`}>
      {/* Directional Pad */}
      <div className="grid grid-cols-3 gap-1.5 w-36 h-36 p-1">
        <div />
        <button
          type="button"
          onClick={onUp}
          aria-label="Up"
          className="flex items-center justify-center bg-slate-800 active:bg-amber-500 active:text-black text-slate-200 border border-slate-700 rounded-lg h-10 shadow-sm active:scale-95 transition-transform"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />

        <button
          type="button"
          onClick={onLeft}
          aria-label="Left"
          className="flex items-center justify-center bg-slate-800 active:bg-amber-500 active:text-black text-slate-200 border border-slate-700 rounded-lg h-10 shadow-sm active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-700" />
        </div>
        <button
          type="button"
          onClick={onRight}
          aria-label="Right"
          className="flex items-center justify-center bg-slate-800 active:bg-amber-500 active:text-black text-slate-200 border border-slate-700 rounded-lg h-10 shadow-sm active:scale-95 transition-transform"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div />
        <button
          type="button"
          onClick={onDown}
          aria-label="Down"
          className="flex items-center justify-center bg-slate-800 active:bg-amber-500 active:text-black text-slate-200 border border-slate-700 rounded-lg h-10 shadow-sm active:scale-95 transition-transform"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <div />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        {onActionB && (
          <button
            type="button"
            onClick={onActionB}
            className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-slate-800 active:bg-cyan-500 active:text-black text-slate-200 border border-slate-700 shadow active:scale-95 transition-transform"
          >
            <Play className="w-5 h-5 fill-current" />
            <span className="text-[10px] font-mono tracking-wider font-semibold mt-0.5">{actionBLabel}</span>
          </button>
        )}

        {onActionA && (
          <button
            type="button"
            onClick={onActionA}
            className="flex flex-col items-center justify-center w-18 h-18 rounded-full bg-amber-500/20 active:bg-amber-500 active:text-black text-amber-300 border border-amber-500/50 shadow active:scale-95 transition-transform"
          >
            <RotateCw className="w-6 h-6" />
            <span className="text-[11px] font-mono tracking-wider font-bold mt-0.5">{actionALabel}</span>
          </button>
        )}
      </div>
    </div>
  );
};
