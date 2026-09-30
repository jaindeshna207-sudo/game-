import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Search,
  Filter,
  Flame,
  Clock,
  Code,
  Layers,
  ChevronRight,
  Gamepad2,
  Shuffle
} from 'lucide-react';
import { CLASSIC_GAME_IDEAS } from '../../data/gameIdeas';
import { GameIdea, GameCategory } from '../../types/game';
import { sound } from '../../utils/sound';

interface GameIdeaVaultProps {
  onSelectPlayableGame?: (gameId: 'snake' | 'tetris' | 'bounce' | 'platformer' | 'space') => void;
}

export const GameIdeaVault: React.FC<GameIdeaVaultProps> = ({ onSelectPlayableGame }) => {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIdea, setSelectedIdea] = useState<GameIdea | null>(CLASSIC_GAME_IDEAS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Interactive Hybrid Game Mixer State
  const [mixerA, setMixerA] = useState<string>('Snake (Growing Tail & Grid)');
  const [mixerB, setMixerB] = useState<string>('Breakout (Bouncing Ball & Bricks)');
  const [customHybridPrompt, setCustomHybridPrompt] = useState<string | null>(null);
  const [customHybridTitle, setCustomHybridTitle] = useState<string | null>(null);

  const categories: { key: GameCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All Classics (18)' },
    { key: 'arcade', label: 'Arcade Reflex' },
    { key: 'physics', label: 'Physics & Bounce' },
    { key: 'puzzle', label: 'Puzzle & Grid' },
    { key: 'platform', label: 'Platform & Run' },
    { key: 'topdown', label: 'Top-Down Tactical' }
  ];

  const filteredIdeas = useMemo(() => {
    return CLASSIC_GAME_IDEAS.filter(idea => {
      const matchesCategory = selectedCategory === 'all' || idea.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        idea.title.toLowerCase().includes(q) ||
        idea.classicInspiration.toLowerCase().includes(q) ||
        idea.theTwist.toLowerCase().includes(q) ||
        idea.keyMechanics.some(m => m.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopyPrompt = (id: string, promptText: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    sound.coin();
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const generateHybridGame = () => {
    sound.powerup();
    const title = `${mixerA.split(' ')[0]}-${mixerB.split(' ')[0]} Fusion`;
    setCustomHybridTitle(title);

    const generatedPrompt = `Create an innovative hybrid 2D browser game combining "${mixerA}" with "${mixerB}" in React with TypeScript and HTML5 Canvas.
Game Concept:
- Core Objective: Combine the mechanics of ${mixerA.split(' ')[0]} and ${mixerB.split(' ')[0]} into a cohesive, fast-paced arcade loop.
- Mechanics Fusion:
  1. The core navigation / player control is inspired by ${mixerA}.
  2. The environmental obstacle / scoring mechanic is driven by ${mixerB}.
- Visual Polish: Retro neon arcade styling with crisp CRT glow, sound effects via Web Audio API, and high score tracking with localStorage.
- Controls: Responsive keyboard controls (Arrow Keys / WASD, Space) plus virtual on-screen buttons for touchscreens.`;

    setCustomHybridPrompt(generatedPrompt);
  };

  const getPlayableId = (ideaId: string): ('snake' | 'tetris' | 'bounce' | 'platformer' | 'space') | null => {
    if (ideaId === 'snake-classic') return 'snake';
    if (ideaId === 'tetris-stack') return 'tetris';
    if (ideaId === 'bounce-breakout') return 'bounce';
    if (ideaId === 'mini-mario-runner') return 'platformer';
    if (ideaId === 'space-invaders') return 'space';
    return null;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 p-4 font-sans-clean">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold font-arcade tracking-wide text-white">
          CLASSICAL MINI GAME BLUEPRINT VAULT
        </h2>
        <p className="text-sm text-slate-300">
          Explore curated retro mechanics, physics recipes, and 1-click Google AI Studio prompts to build and customize your own browser games.
        </p>
      </div>

      {/* Hybrid Idea Mixer Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="font-arcade text-lg font-bold text-amber-400">
            CLASSIC MECHANIC MIXER & PROMPT GENERATOR
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Want a truly fresh idea? Mix any two legendary classical mechanics to craft a brand new game concept for Google AI Studio!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">BASE MECHANIC A</label>
            <select
              value={mixerA}
              onChange={e => setMixerA(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500"
            >
              <option value="Snake (Growing Tail & Grid)">Snake (Growing Tail & Grid)</option>
              <option value="Tetris (Falling Polyominoes & Line Clears)">Tetris (Falling Polyominoes & Line Clears)</option>
              <option value="Breakout (Bouncing Ball & Brick Shatter)">Breakout (Bouncing Ball & Brick Shatter)</option>
              <option value="Platformer (Mario Running & Stomping)">Platformer (Mario Running & Stomping)</option>
              <option value="Space Invaders (Descending Alien Waves)">Space Invaders (Descending Alien Waves)</option>
              <option value="Pac-Man (Maze Waypoints & Chasing Ghosts)">Pac-Man (Maze Waypoints & Chasing Ghosts)</option>
              <option value="Asteroids (Zero-G Inertia & Splitting)">Asteroids (Zero-G Inertia & Splitting)</option>
              <option value="Sokoban (Box Pushing & Grid Logic)">Sokoban (Box Pushing & Grid Logic)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">BASE MECHANIC B</label>
            <select
              value={mixerB}
              onChange={e => setMixerB(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500"
            >
              <option value="Breakout (Bouncing Ball & Bricks)">Breakout (Bouncing Ball & Bricks)</option>
              <option value="Tetris (Line Clears & Stacking)">Tetris (Line Clears & Stacking)</option>
              <option value="Platformer (Mario Running & Gravity Jumps)">Platformer (Mario Running & Gravity Jumps)</option>
              <option value="Snake (Continuous Movement & Self-Collision)">Snake (Continuous Movement & Self-Collision)</option>
              <option value="Minesweeper (Hidden Danger Deduction)">Minesweeper (Hidden Danger Deduction)</option>
              <option value="Lunar Lander (Gravity Vector Thrust)">Lunar Lander (Gravity Vector Thrust)</option>
              <option value="Battle Tanks (Destructible Maze Walls)">Battle Tanks (Destructible Maze Walls)</option>
              <option value="Flappy Bird (One-Tap Vertical Impulse)">Flappy Bird (One-Tap Vertical Impulse)</option>
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={generateHybridGame}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-arcade rounded-lg text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Shuffle className="w-4 h-4" /> FUSE INTO AI STUDIO PROMPT
            </button>
          </div>
        </div>

        {/* Generated Hybrid Preview */}
        {customHybridPrompt && (
          <div className="mt-4 p-4 bg-slate-950 border border-amber-500/40 rounded-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold font-arcade text-amber-300">
                ✨ HYBRID CONCEPT: {customHybridTitle}
              </span>
              <button
                type="button"
                onClick={() => handleCopyPrompt('hybrid', customHybridPrompt)}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                {copiedId === 'hybrid' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Prompt for AI Studio
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap bg-slate-900 p-3 rounded-lg border border-slate-800 overflow-x-auto max-h-48">
              {customHybridPrompt}
            </pre>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat.key}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.key);
                sound.tick();
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat.key
                  ? 'bg-amber-500 text-black font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search mechanics, games, math..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600"
          />
        </div>
      </div>

      {/* Main Split View: Left List, Right Blueprint Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Game Cards Grid (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredIdeas.map(idea => {
            const isSelected = selectedIdea?.id === idea.id;
            const playableId = getPlayableId(idea.id);

            return (
              <div
                key={idea.id}
                onClick={() => {
                  setSelectedIdea(idea);
                  sound.tick();
                }}
                className={`cursor-pointer p-4 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                {/* Header text with unboxed metadata */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>{idea.classicInspiration}</span>
                  <span className="font-mono text-amber-400/90">{idea.complexity}</span>
                </div>

                <h4 className="text-base font-bold font-arcade text-white tracking-wide mb-1">
                  {idea.title}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {idea.tagline}
                </p>

                {/* Footer with actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" /> {idea.estimatedDevTime}
                  </span>

                  <div className="flex items-center gap-2">
                    {playableId && onSelectPlayableGame && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onSelectPlayableGame(playableId);
                        }}
                        className="text-[11px] font-arcade font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/60"
                      >
                        <Gamepad2 className="w-3 h-3" /> Play Now
                      </button>
                    )}
                    <span className="text-slate-400 group-hover:text-white">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Detailed Blueprint & AI Studio Prompt Inspector (5 Cols) */}
        <div className="lg:col-span-5 sticky top-4">
          {selectedIdea ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
              {/* Header */}
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Inspiration: {selectedIdea.classicInspiration}</span>
                  <span className="font-mono text-amber-400 font-semibold">{selectedIdea.complexity}</span>
                </div>
                <h3 className="text-xl font-bold font-arcade text-white">
                  {selectedIdea.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {selectedIdea.tagline}
                </p>
              </div>

              {/* Core Loop & Twist */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-mono text-[11px] text-slate-400 block font-semibold">CORE GAMEPLAY LOOP</span>
                  <p className="text-slate-200 mt-0.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                    {selectedIdea.coreLoop}
                  </p>
                </div>

                <div>
                  <span className="font-mono text-[11px] text-amber-400/90 block font-semibold">THE HOOK & RETRO TWIST</span>
                  <p className="text-slate-200 mt-0.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                    {selectedIdea.theTwist}
                  </p>
                </div>
              </div>

              {/* Key Math & Physics Mechanics */}
              <div>
                <span className="font-mono text-[11px] text-slate-400 block font-semibold mb-1.5">
                  KEY CODE & PHYSICS MECHANICS
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedIdea.keyMechanics.map((mech, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-slate-800/80 text-cyan-300 font-mono px-2 py-0.5 rounded border border-slate-700/60"
                    >
                      {mech}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Studio Copyable Prompt Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                    <Code className="w-3.5 h-3.5 text-amber-400" /> GOOGLE AI STUDIO PROMPT
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(selectedIdea.id, selectedIdea.aiStudioPrompt)}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] font-mono rounded flex items-center gap-1 active:scale-95 transition-transform"
                  >
                    {copiedId === selectedIdea.id ? (
                      <>
                        <Check className="w-3 h-3 text-slate-950" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy Prompt
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap bg-slate-950 p-3 rounded-lg border border-slate-800 max-h-56 overflow-y-auto leading-relaxed">
                    {selectedIdea.aiStudioPrompt}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                {getPlayableId(selectedIdea.id) && onSelectPlayableGame && (
                  <button
                    type="button"
                    onClick={() => {
                      const pid = getPlayableId(selectedIdea.id);
                      if (pid) onSelectPlayableGame(pid);
                    }}
                    className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-arcade text-xs rounded-lg flex items-center justify-center gap-2 shadow active:scale-95 transition-transform"
                  >
                    <Gamepad2 className="w-4 h-4" /> PLAY THIS GAME NOW
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
              Select a game idea to view its technical blueprint and prompt.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
