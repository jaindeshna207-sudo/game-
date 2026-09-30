import React from 'react';
import { Gamepad2, Lightbulb, Volume2, VolumeX, Sparkles, Monitor } from 'lucide-react';
import { GameId } from '../../types/game';
import { sound } from '../../utils/sound';

interface NavbarProps {
  currentTab: 'arcade' | 'ideas' | GameId;
  onTabChange: (tab: 'arcade' | 'ideas' | GameId) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  crtEffect: boolean;
  onToggleCrt: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  isMuted,
  onToggleMute,
  crtEffect,
  onToggleCrt
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Zone 1: Brand */}
        <button
          type="button"
          onClick={() => {
            onTabChange('arcade');
            sound.tick();
          }}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-pixel text-xs sm:text-sm text-white font-bold tracking-wider block">
              RETRO<span className="text-amber-400">FORGE</span>
            </span>
            <span className="text-[10px] text-slate-400 font-sans tracking-wide block">
              Classic Browser Arcade & Ideas
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Natural text with active indicators) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              onTabChange('arcade');
              sound.tick();
            }}
            className={`px-3 py-1.5 text-xs font-arcade tracking-wider font-semibold rounded-lg transition-colors ${
              currentTab === 'arcade' ||
              ['snake', 'tetris', 'bounce', 'platformer', 'space'].includes(currentTab)
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            PLAYABLE GAMES
          </button>

          <button
            type="button"
            onClick={() => {
              onTabChange('ideas');
              sound.tick();
            }}
            className={`px-3 py-1.5 text-xs font-arcade tracking-wider font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              currentTab === 'ideas'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            IDEA VAULT & PROMPTS
          </button>
        </nav>

        {/* Zone 3: Settings & Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Ideas Tab button */}
          <button
            type="button"
            onClick={() => {
              onTabChange(currentTab === 'ideas' ? 'arcade' : 'ideas');
              sound.tick();
            }}
            className="md:hidden px-2.5 py-1.5 text-xs font-arcade bg-slate-900 border border-slate-800 rounded-lg text-amber-400"
          >
            {currentTab === 'ideas' ? 'Games' : 'Ideas Vault'}
          </button>

          {/* CRT scanline toggle */}
          <button
            type="button"
            onClick={onToggleCrt}
            title={crtEffect ? 'Turn off CRT Scanlines' : 'Turn on CRT Scanlines'}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              crtEffect
                ? 'bg-slate-800 border-slate-700 text-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline font-mono text-[10px]">CRT</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white active:scale-95 transition-transform"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
