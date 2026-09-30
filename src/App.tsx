/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameId } from './types/game';
import { Navbar } from './components/layout/Navbar';
import { ArcadeLobby } from './components/layout/ArcadeLobby';
import { GameArena } from './components/games/GameArena';
import { GameIdeaVault } from './components/ideas/GameIdeaVault';
import { sound } from './utils/sound';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'arcade' | 'ideas' | GameId>('snake');
  const [activeGameId, setActiveGameId] = useState<GameId>('snake');
  const [crtEffect, setCrtEffect] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());

  const handleSelectGame = (id: GameId) => {
    setActiveGameId(id);
    setCurrentTab(id);
  };

  const handleToggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleToggleCrt = () => {
    setCrtEffect(prev => !prev);
    sound.tick();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Header Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={tab => {
          if (['snake', 'tetris', 'bounce', 'platformer', 'space'].includes(tab)) {
            setActiveGameId(tab as GameId);
          }
          setCurrentTab(tab);
        }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        crtEffect={crtEffect}
        onToggleCrt={handleToggleCrt}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full py-4 sm:py-6">
        {currentTab === 'arcade' && (
          <ArcadeLobby
            onSelectGame={handleSelectGame}
            onOpenIdeas={() => setCurrentTab('ideas')}
          />
        )}

        {currentTab === 'ideas' && (
          <GameIdeaVault
            onSelectPlayableGame={id => handleSelectGame(id)}
          />
        )}

        {['snake', 'tetris', 'bounce', 'platformer', 'space'].includes(currentTab) && (
          <GameArena
            gameId={activeGameId}
            onSelectGame={id => handleSelectGame(id)}
            onBackToHub={() => setCurrentTab('arcade')}
            crtEffect={crtEffect}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[10px] text-amber-400">RETROFORGE</span>
            <span aria-hidden="true">·</span>
            <span>Classic Browser Games & AI Studio Blueprints</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              type="button"
              onClick={() => setCurrentTab('arcade')}
              className="hover:text-white transition-colors"
            >
              Playable Arcade
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setCurrentTab('ideas')}
              className="hover:text-white transition-colors"
            >
              18+ Game Ideas & Prompts
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
