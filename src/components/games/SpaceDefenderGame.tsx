import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Shield, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/sound';
import { TouchControls } from '../controls/TouchControls';

interface Alien {
  id: number;
  x: number;
  y: number;
  row: number;
  col: number;
  alive: boolean;
  score: number;
  color: string;
}

interface BunkerBlock {
  x: number;
  y: number;
  hp: number;
}

interface Projectile {
  x: number;
  y: number;
  vy: number;
  isAlien: boolean;
}

interface UFO {
  x: number;
  y: number;
  vx: number;
  active: boolean;
  score: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
}

const CANVAS_W = 500;
const CANVAS_H = 460;
const CANNON_W = 30;
const CANNON_H = 16;

export const SpaceDefenderGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY'>('IDLE');
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [wave, setWave] = useState<number>(1);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('retro_space_highscore') || '0');
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());

  // Mutable Game State
  const cannonRef = useRef({
    x: CANVAS_W / 2 - CANNON_W / 2,
    y: CANVAS_H - 35,
    w: CANNON_W,
    h: CANNON_H,
    speed: 5
  });

  const aliensRef = useRef<Alien[]>([]);
  const alienDirRef = useRef<number>(1);
  const alienSpeedRef = useRef<number>(0.8);
  const alienStepTimerRef = useRef<number>(0);

  const bunkersRef = useRef<BunkerBlock[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const ufoRef = useRef<UFO>({ x: -60, y: 35, vx: 2, active: false, score: 200 });
  const particlesRef = useRef<Particle[]>([]);

  const keysRef = useRef<{ left: boolean; right: boolean; fire: boolean }>({
    left: false,
    right: false,
    fire: false
  });

  const canFireRef = useRef<boolean>(true);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Fleet & Bunkers
  const initFleet = useCallback((waveNum: number) => {
    const aliens: Alien[] = [];
    const rows = 5;
    const cols = 10;
    const startY = 60 + Math.min(waveNum * 12, 60);

    const rowColors = ['#f43f5e', '#fb923c', '#eab308', '#22c55e', '#06b6d4'];
    const rowScores = [40, 30, 20, 10, 10];

    let id = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        aliens.push({
          id: id++,
          x: 40 + c * 38,
          y: startY + r * 28,
          row: r,
          col: c,
          alive: true,
          score: rowScores[r],
          color: rowColors[r]
        });
      }
    }

    aliensRef.current = aliens;
    alienDirRef.current = 1;
    alienSpeedRef.current = 0.8 + waveNum * 0.2;

    // 4 Defensive Bunkers
    const bunkerBlocks: BunkerBlock[] = [];
    const bunkerOffsets = [60, 170, 280, 390];
    bunkerOffsets.forEach(bx => {
      for (let by = 0; by < 3; by++) {
        for (let bcol = 0; bcol < 4; bcol++) {
          // Arch notch cutout
          if (by === 2 && (bcol === 1 || bcol === 2)) continue;
          bunkerBlocks.push({
            x: bx + bcol * 10,
            y: CANVAS_H - 95 + by * 8,
            hp: 3
          });
        }
      }
    });

    bunkersRef.current = bunkerBlocks;
    projectilesRef.current = [];
    particlesRef.current = [];
    ufoRef.current = { x: -60, y: 35, vx: 2.2, active: false, score: 200 };
  }, []);

  const resetGame = () => {
    cannonRef.current.x = CANVAS_W / 2 - CANNON_W / 2;
    setScore(0);
    setLives(3);
    setWave(1);
    initFleet(1);
    setGameState('PLAYING');
    sound.tick();
  };

  const fireLaser = useCallback(() => {
    if (!canFireRef.current || gameState !== 'PLAYING') return;

    // Check existing player laser count (max 2 active)
    const activePlayerLasers = projectilesRef.current.filter(p => !p.isAlien).length;
    if (activePlayerLasers >= 2) return;

    projectilesRef.current.push({
      x: cannonRef.current.x + cannonRef.current.w / 2,
      y: cannonRef.current.y - 4,
      vy: -7,
      isAlien: false
    });

    sound.laser();
    canFireRef.current = false;
    setTimeout(() => {
      canFireRef.current = true;
    }, 200);
  }, [gameState]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'p' || e.key === 'P') {
        if (gameState === 'PLAYING') setGameState('PAUSED');
        else if (gameState === 'PAUSED') setGameState('PLAYING');
        return;
      }

      if (gameState !== 'PLAYING') {
        if (e.key === ' ' || e.key === 'Enter') resetGame();
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
      }
      if (e.key === ' ') {
        fireLaser();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, fireLaser]);

  // Main 60FPS Space Defender Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let isRunning = true;

    const gameLoop = () => {
      const cannon = cannonRef.current;
      const aliens = aliensRef.current;
      const projectiles = projectilesRef.current;
      const bunkers = bunkersRef.current;
      const ufo = ufoRef.current;

      // 1. Move Cannon
      if (keysRef.current.left) {
        cannon.x = Math.max(10, cannon.x - cannon.speed);
      }
      if (keysRef.current.right) {
        cannon.x = Math.min(CANVAS_W - cannon.w - 10, cannon.x + cannon.speed);
      }

      // 2. March Aliens
      const livingAliens = aliens.filter(a => a.alive);

      // Speed increases as fewer aliens remain
      const fleetSpeed = alienSpeedRef.current * (1 + (50 - livingAliens.length) * 0.04);
      let hitEdge = false;

      for (const a of livingAliens) {
        a.x += fleetSpeed * alienDirRef.current;
        if (a.x < 15 || a.x > CANVAS_W - 35) {
          hitEdge = true;
        }
      }

      if (hitEdge) {
        alienDirRef.current = -alienDirRef.current;
        for (const a of livingAliens) {
          a.y += 14;
          // Alien breach ground check
          if (a.y >= cannon.y - 10) {
            setGameState('GAME_OVER');
            sound.gameOver();
          }
        }
      }

      // Alien drop bomb randomly
      if (Math.random() < 0.035 && livingAliens.length > 0) {
        const shooter = livingAliens[Math.floor(Math.random() * livingAliens.length)];
        projectiles.push({
          x: shooter.x + 10,
          y: shooter.y + 14,
          vy: 3.5,
          isAlien: true
        });
      }

      // 3. UFO Cruise
      if (!ufo.active && Math.random() < 0.002) {
        ufo.active = true;
        ufo.x = -40;
      }
      if (ufo.active) {
        ufo.x += ufo.vx;
        if (ufo.x > CANVAS_W + 50) {
          ufo.active = false;
        }
      }

      // 4. Update Projectiles
      for (let pIdx = projectiles.length - 1; pIdx >= 0; pIdx--) {
        const p = projectiles[pIdx];
        p.y += p.vy;

        // Out of bounds
        if (p.y < 0 || p.y > CANVAS_H) {
          projectiles.splice(pIdx, 1);
          continue;
        }

        // Test Bunker collision
        let hitBunker = false;
        for (let bIdx = bunkers.length - 1; bIdx >= 0; bIdx--) {
          const b = bunkers[bIdx];
          if (p.x >= b.x && p.x <= b.x + 10 && p.y >= b.y && p.y <= b.y + 8) {
            b.hp--;
            if (b.hp <= 0) {
              bunkers.splice(bIdx, 1);
            }
            projectiles.splice(pIdx, 1);
            hitBunker = true;
            sound.bounce();
            break;
          }
        }
        if (hitBunker) continue;

        // Player laser hitting Alien
        if (!p.isAlien) {
          let hitAlien = false;
          for (const a of livingAliens) {
            if (p.x >= a.x && p.x <= a.x + 22 && p.y >= a.y && p.y <= a.y + 18) {
              a.alive = false;
              projectiles.splice(pIdx, 1);
              hitAlien = true;
              sound.explosion();

              // Explosion particles
              for (let i = 0; i < 7; i++) {
                particlesRef.current.push({
                  x: a.x + 11,
                  y: a.y + 9,
                  vx: (Math.random() - 0.5) * 3,
                  vy: (Math.random() - 0.5) * 3,
                  color: a.color,
                  alpha: 1
                });
              }

              setScore(s => {
                const nextScore = s + a.score;
                if (nextScore > highScore) {
                  setHighScore(nextScore);
                  localStorage.setItem('retro_space_highscore', String(nextScore));
                }
                return nextScore;
              });
              break;
            }
          }
          if (hitAlien) continue;

          // Check UFO hit
          if (ufo.active && p.x >= ufo.x && p.x <= ufo.x + 36 && p.y >= ufo.y && p.y <= ufo.y + 16) {
            ufo.active = false;
            projectiles.splice(pIdx, 1);
            sound.powerup();
            setScore(s => s + ufo.score);
            continue;
          }
        } else {
          // Alien bomb hitting Cannon
          if (
            p.x >= cannon.x &&
            p.x <= cannon.x + cannon.w &&
            p.y >= cannon.y &&
            p.y <= cannon.y + cannon.h
          ) {
            projectiles.splice(pIdx, 1);
            sound.explosion();

            setLives(l => {
              const nextLives = l - 1;
              if (nextLives <= 0) {
                setGameState('GAME_OVER');
                sound.gameOver();
              } else {
                cannon.x = CANVAS_W / 2 - CANNON_W / 2;
              }
              return nextLives;
            });
          }
        }
      }

      // 5. Check Wave Clear
      if (livingAliens.length === 0) {
        sound.victory();
        confetti({ particleCount: 50, spread: 60 });
        setWave(w => {
          const nextWave = w + 1;
          initFleet(nextWave);
          return nextWave;
        });
      }

      // 6. Draw onto Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#060a12';
          ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

          // Stars background
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          for (let s = 0; s < 25; s++) {
            const sx = (s * 87) % CANVAS_W;
            const sy = (s * 43) % CANVAS_H;
            ctx.fillRect(sx, sy, 1.5, 1.5);
          }

          // Draw UFO
          if (ufo.active) {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.ellipse(ufo.x + 18, ufo.y + 8, 18, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            // UFO Dome
            ctx.fillStyle = '#67e8f9';
            ctx.beginPath();
            ctx.arc(ufo.x + 18, ufo.y + 6, 8, Math.PI, 0);
            ctx.fill();
          }

          // Draw Aliens
          livingAliens.forEach(a => {
            ctx.fillStyle = a.color;
            ctx.fillRect(a.x + 4, a.y + 2, 14, 12);
            // Antennas / Tentacles
            ctx.fillRect(a.x + 2, a.y, 4, 3);
            ctx.fillRect(a.x + 16, a.y, 4, 3);
            ctx.fillRect(a.x + 1, a.y + 12, 4, 4);
            ctx.fillRect(a.x + 17, a.y + 12, 4, 4);
            // Eyes
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(a.x + 6, a.y + 5, 3, 3);
            ctx.fillRect(a.x + 13, a.y + 5, 3, 3);
          });

          // Draw Bunkers
          bunkers.forEach(b => {
            ctx.fillStyle = b.hp === 3 ? '#22c55e' : b.hp === 2 ? '#86efac' : '#bbf7d0';
            ctx.fillRect(b.x, b.y, 9, 7);
          });

          // Draw Projectiles
          projectiles.forEach(p => {
            if (p.isAlien) {
              ctx.fillStyle = '#ef4444';
              ctx.fillRect(p.x - 1.5, p.y - 4, 3, 8);
            } else {
              ctx.fillStyle = '#38bdf8';
              ctx.shadowColor = '#0ea5e9';
              ctx.shadowBlur = 6;
              ctx.fillRect(p.x - 1.5, p.y - 5, 3, 9);
              ctx.shadowBlur = 0;
            }
          });

          // Draw Cannon Tank
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(cannon.x + 2, cannon.y + 6, cannon.w - 4, cannon.h - 6);
          // Turret nozzle
          ctx.fillRect(cannon.x + cannon.w / 2 - 2, cannon.y, 4, 8);

          // Particles
          for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const pt = particlesRef.current[i];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.alpha *= 0.92;
            if (pt.alpha < 0.05) {
              particlesRef.current.splice(i, 1);
              continue;
            }
            ctx.fillStyle = pt.color;
            ctx.globalAlpha = pt.alpha;
            ctx.fillRect(pt.x, pt.y, 3, 3);
            ctx.globalAlpha = 1;
          }
        }
      }

      if (isRunning) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, highScore, initFleet]);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
      {/* Top HUD */}
      <div className="flex items-center justify-between w-full max-w-[500px] mb-3 font-arcade">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-sans tracking-wide">SCORE</span>
            <span className="text-xl font-bold text-emerald-400 font-pixel">{score}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-sans tracking-wide">WAVE</span>
            <span className="text-xl font-bold text-amber-400 font-pixel">{wave}</span>
          </div>
        </div>

        {/* Lives & Audio */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg">
            {Array.from({ length: 3 }).map((_, i) => (
              <Shield
                key={i}
                className={`w-4 h-4 ${
                  i < lives ? 'text-emerald-400 fill-current' : 'text-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              const muted = sound.toggleMute();
              setIsMuted(muted);
            }}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Screen Frame */}
      <div className="relative border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-black crt-screen arcade-glow-cyan">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="block w-full max-w-[500px]"
        />

        {/* Overlays */}
        {gameState === 'IDLE' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30">
            <h2 className="text-2xl font-bold text-emerald-400 font-pixel mb-2">COSMIC SHIELD DEFENDER</h2>
            <p className="text-xs text-slate-300 max-w-sm mb-6 font-sans">
              Defend Earth from marching alien fleets. Take shelter behind bunkers and shoot down the mystery UFO!
            </p>
            <button
              type="button"
              onClick={resetGame}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-arcade tracking-wider rounded-lg shadow-lg active:scale-95 transition-transform flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> DEFEND EARTH
            </button>
            <div className="mt-4 text-[11px] text-slate-400 font-mono">
              Left / Right Arrows or A/D to steer · Space to Fire
            </div>
          </div>
        )}

        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30">
            <h2 className="text-xl font-bold text-amber-400 font-pixel mb-4">DEFENSE ON HOLD</h2>
            <button
              type="button"
              onClick={() => setGameState('PLAYING')}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-sm flex items-center gap-2 mb-2"
            >
              <Play className="w-4 h-4 fill-current" /> RESUME
            </button>
            <button
              type="button"
              onClick={resetGame}
              className="px-4 py-1.5 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700"
            >
              RESTART
            </button>
          </div>
        )}

        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-red-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in duration-200">
            <h2 className="text-2xl font-bold text-red-400 font-pixel mb-1">INVASION SUCCEEDED</h2>
            <div className="my-4 space-y-1">
              <p className="text-xs text-slate-400 font-sans">FINAL SCORE</p>
              <p className="text-3xl font-bold text-white font-pixel">{score}</p>
              <p className="text-xs text-emerald-400 font-mono">WAVES SURVIVED: {wave}</p>
            </div>
            <button
              type="button"
              onClick={resetGame}
              className="px-6 py-2.5 bg-red-500 hover:bg-red-400 text-white font-bold font-arcade tracking-wider rounded-lg shadow-lg active:scale-95 transition-transform flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> RETRY MISSION
            </button>
          </div>
        )}
      </div>

      {/* Mobile Touch Controller */}
      <div className="w-full max-w-[500px] mt-4">
        <TouchControls
          onLeft={() => {
            cannonRef.current.x = Math.max(10, cannonRef.current.x - 24);
          }}
          onRight={() => {
            cannonRef.current.x = Math.min(CANVAS_W - cannonRef.current.w - 10, cannonRef.current.x + 24);
          }}
          onActionA={fireLaser}
          actionALabel="FIRE"
        />
      </div>
    </div>
  );
};
