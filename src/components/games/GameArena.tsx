import React, { useState } from 'react';
import {
  Gamepad2,
  HelpCircle,
  Maximize2,
  Minimize2,
  ChevronLeft,
  Share2,
  Sparkles,
  Info
} from 'lucide-react';
import { GameId } from '../../types/game';
import { PLAYABLE_GAMES } from '../../data/playableGames';
import { SnakeGame } from './SnakeGame';
import { TetrisGame } from './TetrisGame';
import { BounceGame } from './BounceGame';
import { PlatformerGame } from './PlatformerGame';
import { SpaceDefenderGame } from './SpaceDefenderGame';
import { sound } from '../../utils/sound';

interface GameArenaProps {
  gameId: GameId;
  onSelectGame: (id: GameId) => void;
  onBackToHub: () => void;
  crtEffect: boolean;
}

export const GameArena: React.FC<GameArenaProps> = ({
  gameId,
  onSelectGame,
  onBackToHub,
  crtEffect
}) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [isTheater, setIsTheater] = useState(false);

  const currentGame = PLAYABLE_GAMES.find(g => g.id === gameId) || PLAYABLE_GAMES[0];

  const renderGameComponent = () => {
    switch (gameId) {
      case 'snake':
        return <SnakeGame />;
      case 'tetris':
        return <TetrisGame />;
      case 'bounce':
        return <BounceGame />;
      case 'platformer':
        return <PlatformerGame />;
      case 'space':
        return <SpaceDefenderGame />;
      default:
        return <SnakeGame />;
    }
  };

  return (
    <div className={`w-full max-w-6xl mx-auto space-y-4 ${isTheater ? 'fixed inset-0 z-50 bg-slate-950 p-4 overflow-y-auto max-w-none' : ''}`}>
      {/* Sub-header Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHub}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-arcade flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">ARCADE LOBBY</span>
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold font-arcade text-white tracking-wide">
              {currentGame.title}
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {currentGame.subtitle}
            </p>
          </div>
        </div>

        {/* Quick Game Switcher Icons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {PLAYABLE_GAMES.map(g => (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                onSelectGame(g.id);
                sound.tick();
              }}
              title={g.title}
              className={`px-2.5 py-1 text-xs font-arcade rounded-lg transition-colors ${
                g.id === gameId
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {g.id === 'snake' && '🐍 Snake'}
              {g.id === 'tetris' && '🧱 Tetris'}
              {g.id === 'bounce' && '🔴 Bounce'}
              {g.id === 'platformer' && '🍄 Mario'}
              {g.id === 'space' && '🚀 Space'}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              showInstructions
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden md:inline font-arcade text-[11px]">RULES</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTheater(!isTheater)}
            title={isTheater ? 'Exit Full view' : 'Expand Game View'}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
          >
            {isTheater ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Instructions Drawer */}
      {showInstructions && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-150">
          <div>
            <h4 className="text-xs font-bold font-arcade text-amber-400 mb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4" /> HOW TO PLAY & OBJECTIVES
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {currentGame.instructions.map((ins, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{ins}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold font-arcade text-cyan-400 mb-2 flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4" /> CONTROLS SCHEME
            </h4>
            <div className="space-y-1 text-xs text-slate-300 font-mono">
              {currentGame.controls.keyboard.map((ctrl, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-cyan-400">⌨</span>
                  <span>{ctrl}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1 text-slate-400">
                <span className="text-amber-400">📱</span>
                <span>{currentGame.controls.mobile}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Game Stage Render */}
      <div className={`w-full flex justify-center ${crtEffect ? 'crt-screen' : ''}`}>
        {renderGameComponent()}
      </div>
    </div>
  );
};
