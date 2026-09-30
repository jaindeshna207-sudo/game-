import React from 'react';
import { Play, Sparkles, Lightbulb, Gamepad2, Trophy, ArrowRight, ShieldCheck } from 'lucide-react';
import { PLAYABLE_GAMES, arcadeHeroImg } from '../../data/playableGames';
import { GameId } from '../../types/game';
import { sound } from '../../utils/sound';

interface ArcadeLobbyProps {
  onSelectGame: (id: GameId) => void;
  onOpenIdeas: () => void;
}

export const ArcadeLobby: React.FC<ArcadeLobbyProps> = ({ onSelectGame, onOpenIdeas }) => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 px-4 py-6 font-sans-clean">
      {/* Hero Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="relative h-72 sm:h-96 w-full">
          <img
            src={arcadeHeroImg}
            alt="Classic Retro Arcade Lounge"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

          {/* Hero Content */}
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end max-w-3xl">
            {/* Unboxed metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-amber-400 font-mono mb-2">
              <span>5 PLAYABLE RETRO CLASSICS</span>
              <span aria-hidden="true">·</span>
              <span>18 BLUEPRINT IDEAS</span>
              <span aria-hidden="true">·</span>
              <span>100% BROWSER CANVAS</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-arcade text-white tracking-wide leading-tight mb-3">
              CLASSIC MINI ARCADE & GAME ARCHITECT
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mb-6">
              Play legendary browser classics directly in your browser: Snake, Tetris, Bounce Ball, Mini Mario Platformer, and Space Defender. Explore mechanics, physics recipes, and prompt templates to build your own in Google AI Studio.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onSelectGame('snake');
                  sound.tick();
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-arcade tracking-wider rounded-xl shadow-lg active:scale-95 transition-transform flex items-center gap-2 text-xs sm:text-sm"
              >
                <Play className="w-4 h-4 fill-current" /> PLAY CLASSIC SNAKE
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenIdeas();
                  sound.tick();
                }}
                className="px-5 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold font-arcade tracking-wider rounded-xl active:scale-95 transition-transform flex items-center gap-2 text-xs sm:text-sm"
              >
                <Lightbulb className="w-4 h-4 text-amber-400" /> EXPLORE 18+ GAME IDEAS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Playable Games Grid Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-arcade tracking-wide text-white">
              PLAYABLE RETRO CLASSICS
            </h2>
            <p className="text-xs text-slate-400">
              Immediate 60FPS browser execution with Web Audio synthesizer sound effects and touch controllers.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Select any title to launch instantly
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLAYABLE_GAMES.map(game => (
            <div
              key={game.id}
              onClick={() => {
                onSelectGame(game.id);
                sound.tick();
              }}
              className="group cursor-pointer bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/80 hover:shadow-xl transition-all flex flex-col"
            >
              {/* Cover Image */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                <img
                  src={game.coverImage}
                  alt={game.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-700/80 text-[10px] font-mono uppercase text-amber-400">
                  {game.category}
                </div>

                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="px-3 py-1 bg-amber-500 text-slate-950 font-bold font-arcade text-xs rounded-lg flex items-center gap-1 shadow">
                    <Play className="w-3.5 h-3.5 fill-current" /> PLAY
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-bold font-arcade text-white group-hover:text-amber-400 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {game.subtitle}
                  </p>
                </div>

                {/* Features chips */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                  {game.features.slice(0, 3).map((f, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-950 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-800"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onSelectGame(game.id);
                    sound.tick();
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-arcade font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> LAUNCH GAME
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ideas Vault Spotlight Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>MORE IDEAS IN THIS SEGMENT</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-arcade text-white">
            18+ CLASSICAL GAME BLUEPRINTS & AI STUDIO PROMPTS
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Want to build Pac-Maze, Asteroids Inertia, Sokoban Box Pusher, Minesweeper, Lunar Lander, Frogger, Battle City, or 2048? Inspect game loops, physics math, and copy turnkey prompts for Google AI Studio.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            onOpenIdeas();
            sound.tick();
          }}
          className="whitespace-nowrap px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-arcade tracking-wider rounded-xl shadow-lg active:scale-95 transition-transform flex items-center gap-2 text-xs sm:text-sm"
        >
          VIEW IDEA BLUEPRINTS <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
