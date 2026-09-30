import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Heart, Trophy, Flag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/sound';
import { TouchControls } from '../controls/TouchControls';

interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'ground' | 'brick' | 'question' | 'pipe';
  bumpOffset?: number;
  collected?: boolean;
}

interface Coin {
  x: number;
  y: number;
  collected: boolean;
}

interface Enemy {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  alive: boolean;
  squashed?: boolean;
  squashTimer?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
}

const VIEW_W = 540;
const VIEW_H = 340;
const LEVEL_LENGTH = 2400;
const GRAVITY = 0.55;

export const PlatformerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY'>('IDLE');
  const [score, setScore] = useState<number>(0);
  const [coinsCount, setCoinsCount] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('retro_mario_highscore') || '0');
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());

  // Mutable game physics entities
  const playerRef = useRef({
    x: 60,
    y: 200,
    w: 22,
    h: 30,
    vx: 0,
    vy: 0,
    isGrounded: false,
    facingRight: true,
    invincibleTimer: 0
  });

  const cameraXRef = useRef<number>(0);
  const blocksRef = useRef<Block[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const flagRef = useRef({ x: 2200, y: 120, h: 160 });

  const keysRef = useRef<{ left: boolean; right: boolean; jump: boolean }>({
    left: false,
    right: false,
    jump: false
  });

  const animationFrameRef = useRef<number | null>(null);

  // Build Level Layout
  const generateLevel = useCallback(() => {
    const blocks: Block[] = [];
    const coins: Coin[] = [];
    const enemies: Enemy[] = [];

    // Continuous ground with a few pits
    let curX = 0;
    while (curX < LEVEL_LENGTH) {
      if (curX > 400 && curX < 480) {
        // Pitfall 1
        curX += 80;
        continue;
      }
      if (curX > 1100 && curX < 1200) {
        // Pitfall 2
        curX += 100;
        continue;
      }
      if (curX > 1650 && curX < 1740) {
        // Pitfall 3
        curX += 90;
        continue;
      }

      blocks.push({
        x: curX,
        y: 280,
        w: 60,
        h: 60,
        type: 'ground'
      });
      curX += 60;
    }

    // Pipes
    const pipePositions = [320, 780, 1380, 1850];
    pipePositions.forEach(px => {
      blocks.push({
        x: px,
        y: 220,
        w: 42,
        h: 60,
        type: 'pipe'
      });
    });

    // Elevated Brick & Question Block clusters
    const clusters = [
      { startX: 180, y: 190, items: ['brick', 'question', 'brick', 'question', 'brick'] },
      { startX: 560, y: 180, items: ['question', 'brick', 'question'] },
      { startX: 890, y: 160, items: ['brick', 'question', 'question', 'brick'] },
      { startX: 1460, y: 170, items: ['brick', 'question', 'brick'] },
      { startX: 1950, y: 200, items: ['brick', 'brick', 'brick', 'brick'] }
    ];

    clusters.forEach(c => {
      c.items.forEach((item, idx) => {
        blocks.push({
          x: c.startX + idx * 30,
          y: c.y,
          w: 28,
          h: 28,
          type: item as 'brick' | 'question',
          bumpOffset: 0,
          collected: false
        });
      });
    });

    // Floating Coins
    const coinSpawns = [
      { x: 220, y: 130 },
      { x: 250, y: 130 },
      { x: 280, y: 130 },
      { x: 600, y: 120 },
      { x: 920, y: 100 },
      { x: 950, y: 100 },
      { x: 1280, y: 210 },
      { x: 1310, y: 210 },
      { x: 1500, y: 110 },
      { x: 2000, y: 140 }
    ];
    coinSpawns.forEach(cp => {
      coins.push({ x: cp.x, y: cp.y, collected: false });
    });

    // Enemies (Goomba style)
    const enemySpawns = [420, 680, 980, 1260, 1580, 1780];
    enemySpawns.forEach(ex => {
      enemies.push({
        x: ex,
        y: 254,
        w: 26,
        h: 26,
        vx: -1.2,
        alive: true
      });
    });

    blocksRef.current = blocks;
    coinsRef.current = coins;
    enemiesRef.current = enemies;
    particlesRef.current = [];
  }, []);

  const resetGame = () => {
    playerRef.current = {
      x: 60,
      y: 200,
      w: 22,
      h: 30,
      vx: 0,
      vy: 0,
      isGrounded: false,
      facingRight: true,
      invincibleTimer: 0
    };
    cameraXRef.current = 0;
    setScore(0);
    setCoinsCount(0);
    setLives(3);
    generateLevel();
    setGameState('PLAYING');
    sound.tick();
  };

  const jump = useCallback(() => {
    const p = playerRef.current;
    if (p.isGrounded) {
      p.vy = -12.5;
      p.isGrounded = false;
      sound.jump();
    }
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'p' || e.key === 'P') {
        if (gameState === 'PLAYING') setGameState('PAUSED');
        else if (gameState === 'PAUSED') setGameState('PLAYING');
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        resetGame();
        return;
      }

      if (gameState !== 'PLAYING') return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        keysRef.current.jump = true;
        jump();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        keysRef.current.jump = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, jump]);

  // Main 60FPS platformer physics loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let isRunning = true;

    const gameLoop = () => {
      const p = playerRef.current;
      const blocks = blocksRef.current;
      const coins = coinsRef.current;
      const enemies = enemiesRef.current;

      // 1. Horizontal movement input & acceleration
      const acc = 0.8;
      const friction = 0.82;
      const maxSpeed = 5;

      if (keysRef.current.left) {
        p.vx -= acc;
        p.facingRight = false;
      } else if (keysRef.current.right) {
        p.vx += acc;
        p.facingRight = true;
      } else {
        p.vx *= friction;
      }

      p.vx = Math.max(-maxSpeed, Math.min(maxSpeed, p.vx));
      if (Math.abs(p.vx) < 0.05) p.vx = 0;

      // Move horizontal & resolve collisions
      p.x += p.vx;
      for (const b of blocks) {
        if (
          p.x < b.x + b.w &&
          p.x + p.w > b.x &&
          p.y < b.y + b.h &&
          p.y + p.h > b.y
        ) {
          if (p.vx > 0) {
            p.x = b.x - p.w;
            p.vx = 0;
          } else if (p.vx < 0) {
            p.x = b.x + b.w;
            p.vx = 0;
          }
        }
      }

      // 2. Vertical movement & gravity
      p.vy += GRAVITY;
      p.y += p.vy;
      p.isGrounded = false;

      // Collision checks with blocks (Ground / Platform / Bump bottom)
      for (const b of blocks) {
        if (
          p.x < b.x + b.w &&
          p.x + p.w > b.x &&
          p.y < b.y + b.h &&
          p.y + p.h > b.y
        ) {
          if (p.vy > 0) {
            // Landing on top of block
            p.y = b.y - p.h;
            p.vy = 0;
            p.isGrounded = true;
          } else if (p.vy < 0) {
            // Head-butt bottom of block
            p.y = b.y + b.h;
            p.vy = 0;

            // Bump animation & collect coin from ? block
            if (b.type === 'question' && !b.collected) {
              b.collected = true;
              b.bumpOffset = -8;
              sound.coin();
              setCoinsCount(c => c + 1);
              setScore(s => s + 200);

              // Particle coin burst
              for (let i = 0; i < 6; i++) {
                particlesRef.current.push({
                  x: b.x + b.w / 2,
                  y: b.y,
                  vx: (Math.random() - 0.5) * 3,
                  vy: -Math.random() * 4 - 2,
                  color: '#fbbf24',
                  alpha: 1
                });
              }
            } else if (b.type === 'brick') {
              sound.bounce();
              b.bumpOffset = -5;
            }
          }
        }

        // Decay bump offset back to 0
        if (b.bumpOffset && b.bumpOffset < 0) {
          b.bumpOffset += 0.8;
          if (b.bumpOffset > 0) b.bumpOffset = 0;
        }
      }

      // Pitfall check (fell off bottom)
      if (p.y > VIEW_H + 50) {
        setLives(l => {
          const nextL = l - 1;
          if (nextL <= 0) {
            setGameState('GAME_OVER');
            sound.gameOver();
          } else {
            p.x = Math.max(60, p.x - 200);
            p.y = 100;
            p.vy = 0;
            p.vx = 0;
            sound.bounce();
          }
          return nextL;
        });
      }

      // 3. Collect Floating Coins
      for (const c of coins) {
        if (!c.collected) {
          const dx = p.x + p.w / 2 - c.x;
          const dy = p.y + p.h / 2 - c.y;
          if (Math.hypot(dx, dy) < 22) {
            c.collected = true;
            sound.coin();
            setCoinsCount(cnt => cnt + 1);
            setScore(s => s + 100);
          }
        }
      }

      // 4. Update Enemies & check stomping / damage
      for (const e of enemies) {
        if (!e.alive) continue;

        if (e.squashed) {
          e.squashTimer = (e.squashTimer || 0) + 1;
          if (e.squashTimer > 25) e.alive = false;
          continue;
        }

        e.x += e.vx;

        // Reverse at patrol bounds or walls
        if (e.x < 100 || e.x > LEVEL_LENGTH - 100) {
          e.vx = -e.vx;
        }

        // Collision with player
        if (
          p.x < e.x + e.w &&
          p.x + p.w > e.x &&
          p.y < e.y + e.h &&
          p.y + p.h > e.y
        ) {
          // If falling onto enemy from above -> stomp!
          if (p.vy > 1 && p.y + p.h - p.vy <= e.y + 12) {
            e.squashed = true;
            p.vy = -9; // bounce impulse
            sound.brickHit(2);
            setScore(s => s + 200);

            // Stomp particle burst
            for (let i = 0; i < 8; i++) {
              particlesRef.current.push({
                x: e.x + e.w / 2,
                y: e.y + e.h / 2,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: '#b45309',
                alpha: 1
              });
            }
          } else if (p.invincibleTimer <= 0) {
            // Take damage
            p.invincibleTimer = 60; // 1 second invulnerability
            setLives(l => {
              const nextL = l - 1;
              if (nextL <= 0) {
                setGameState('GAME_OVER');
                sound.gameOver();
              } else {
                p.vy = -6;
                p.vx = p.facingRight ? -4 : 4;
                sound.bounce();
              }
              return nextL;
            });
          }
        }
      }

      if (p.invincibleTimer > 0) {
        p.invincibleTimer--;
      }

      // 5. Check Goal Flag
      if (p.x >= flagRef.current.x) {
        setGameState('VICTORY');
        sound.victory();
        confetti({ particleCount: 100, spread: 80 });
      }

      // 6. Smooth Camera Scroll following player
      const targetCamX = p.x - VIEW_W / 3;
      cameraXRef.current = Math.max(0, Math.min(LEVEL_LENGTH - VIEW_W, targetCamX));

      // 7. Render onto Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const camX = cameraXRef.current;

          // Sky gradient
          const skyGradient = ctx.createLinearGradient(0, 0, 0, VIEW_H);
          skyGradient.addColorStop(0, '#0284c7');
          skyGradient.addColorStop(1, '#bae6fd');
          ctx.fillStyle = skyGradient;
          ctx.fillRect(0, 0, VIEW_W, VIEW_H);

          // Background pixel clouds with parallax
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          const cloudOffsets = [100, 450, 850, 1300, 1800];
          cloudOffsets.forEach(cx => {
            const rx = cx - camX * 0.3;
            if (rx > -100 && rx < VIEW_W + 100) {
              ctx.beginPath();
              ctx.arc(rx, 60, 24, 0, Math.PI * 2);
              ctx.arc(rx + 24, 52, 28, 0, Math.PI * 2);
              ctx.arc(rx + 48, 60, 22, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // Draw Blocks
          blocks.forEach(b => {
            const rx = b.x - camX;
            if (rx + b.w < 0 || rx > VIEW_W) return;
            const ry = b.y + (b.bumpOffset || 0);

            if (b.type === 'ground') {
              ctx.fillStyle = '#16a34a'; // grass top
              ctx.fillRect(rx, ry, b.w, 8);
              ctx.fillStyle = '#78350f'; // dirt body
              ctx.fillRect(rx, ry + 8, b.w, b.h - 8);
            } else if (b.type === 'pipe') {
              ctx.fillStyle = '#22c55e';
              ctx.fillRect(rx, ry, b.w, b.h);
              // Pipe lip
              ctx.fillStyle = '#15803d';
              ctx.fillRect(rx - 3, ry, b.w + 6, 12);
            } else if (b.type === 'question') {
              ctx.fillStyle = b.collected ? '#78716c' : '#f59e0b';
              ctx.fillRect(rx, ry, b.w, b.h);
              ctx.strokeStyle = '#451a03';
              ctx.strokeRect(rx, ry, b.w, b.h);
              if (!b.collected) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 14px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('?', rx + b.w / 2, ry + b.h / 2);
              }
            } else if (b.type === 'brick') {
              ctx.fillStyle = '#b45309';
              ctx.fillRect(rx, ry, b.w, b.h);
              ctx.strokeStyle = '#451a03';
              ctx.strokeRect(rx, ry, b.w, b.h);
            }
          });

          // Draw Coins
          coins.forEach(c => {
            if (c.collected) return;
            const rx = c.x - camX;
            if (rx < -20 || rx > VIEW_W + 20) return;
            ctx.fillStyle = '#fbbf24';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(rx, c.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(rx - 2, c.y - 4, 3, 8);
          });

          // Draw Goal Flag
          const flagX = flagRef.current.x - camX;
          if (flagX > -50 && flagX < VIEW_W + 50) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(flagX, flagRef.current.y, 6, flagRef.current.h);
            // Flag banner
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(flagX + 6, flagRef.current.y + 10);
            ctx.lineTo(flagX + 46, flagRef.current.y + 25);
            ctx.lineTo(flagX + 6, flagRef.current.y + 40);
            ctx.fill();
            // Golden finial ball
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(flagX + 3, flagRef.current.y, 8, 0, Math.PI * 2);
            ctx.fill();
          }

          // Draw Enemies
          enemies.forEach(e => {
            if (!e.alive) return;
            const rx = e.x - camX;
            if (rx < -50 || rx > VIEW_W + 50) return;

            if (e.squashed) {
              ctx.fillStyle = '#b45309';
              ctx.fillRect(rx, e.y + 16, e.w, 10);
            } else {
              ctx.fillStyle = '#b45309';
              ctx.beginPath();
              ctx.arc(rx + e.w / 2, e.y + 12, e.w / 2, Math.PI, 0);
              ctx.fillRect(rx, e.y + 12, e.w, 14);
              ctx.fill();
              // White eyes
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(rx + 4, e.y + 10, 5, 6);
              ctx.fillRect(rx + 16, e.y + 10, 5, 6);
              ctx.fillStyle = '#000000';
              ctx.fillRect(rx + 5, e.y + 12, 3, 3);
              ctx.fillRect(rx + 17, e.y + 12, 3, 3);
            }
          });

          // Draw Player
          const px = p.x - camX;
          // Blink if invincible
          if (p.invincibleTimer % 4 < 2) {
            ctx.fillStyle = '#ef4444'; // Red cap/shirt
            ctx.fillRect(px, p.y + 2, p.w, 14);
            // Overalls
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(px + 2, p.y + 16, p.w - 4, 14);
            // Face
            ctx.fillStyle = '#fde047';
            const faceX = p.facingRight ? px + 8 : px + 2;
            ctx.fillRect(faceX, p.y + 6, 12, 8);
            // Mustache / Eye
            ctx.fillStyle = '#1e1b4b';
            const eyeX = p.facingRight ? px + 14 : px + 4;
            ctx.fillRect(eyeX, p.y + 8, 3, 3);
          }

          // Particles
          for (let i = particlesRef.current.length - 1; i >= 0; i--) {
            const pt = particlesRef.current[i];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.alpha *= 0.94;
            if (pt.alpha < 0.05) {
              particlesRef.current.splice(i, 1);
              continue;
            }
            ctx.fillStyle = pt.color;
            ctx.globalAlpha = pt.alpha;
            ctx.fillRect(pt.x - camX, pt.y, 4, 4);
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
  }, [gameState]);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
      {/* Top HUD */}
      <div className="flex items-center justify-between w-full max-w-[540px] mb-3 font-arcade">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-sans tracking-wide">SCORE</span>
            <span className="text-xl font-bold text-amber-400 font-pixel">{score}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-sans tracking-wide">COINS</span>
            <span className="text-xl font-bold text-yellow-300 font-pixel">🪙 {coinsCount}</span>
          </div>
        </div>

        {/* Lives & Audio */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${
                  i < lives ? 'text-red-500 fill-current' : 'text-slate-700'
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
      <div className="relative border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-black crt-screen arcade-glow-emerald">
        <canvas
          ref={canvasRef}
          width={VIEW_W}
          height={VIEW_H}
          className="block w-full max-w-[540px]"
        />

        {/* Overlays */}
        {gameState === 'IDLE' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30">
            <h2 className="text-2xl font-bold text-amber-400 font-pixel mb-2">PIXEL KINGDOM JUMPER</h2>
            <p className="text-xs text-slate-300 max-w-sm mb-6 font-sans">
              Run, jump on enemies, bump ? blocks for coins, and make it to the castle flagpole!
            </p>
            <button
              type="button"
              onClick={resetGame}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-arcade tracking-wider rounded-lg shadow-lg active:scale-95 transition-transform flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> START QUEST
            </button>
            <div className="mt-4 text-[11px] text-slate-400 font-mono">
              A / D or Arrow Keys to Run · Space / W to Jump
            </div>
          </div>
        )}

        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30">
            <h2 className="text-xl font-bold text-amber-400 font-pixel mb-4">PAUSED</h2>
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
            <h2 className="text-2xl font-bold text-red-400 font-pixel mb-1">HERO DEFEATED</h2>
            <div className="my-4 space-y-1">
              <p className="text-xs text-slate-400 font-sans">SCORE REACHED</p>
              <p className="text-3xl font-bold text-white font-pixel">{score}</p>
              <p className="text-xs text-amber-400 font-mono">COINS: {coinsCount}</p>
            </div>
            <button
              type="button"
              onClick={resetGame}
              className="px-6 py-2.5 bg-red-500 hover:bg-red-400 text-white font-bold font-arcade tracking-wider rounded-lg shadow-lg active:scale-95 transition-transform flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> RETRY
            </button>
          </div>
        )}

        {gameState === 'VICTORY' && (
          <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in duration-200">
            <h2 className="text-2xl font-bold text-amber-400 font-pixel mb-1">FLAG REACHED!</h2>
            <p className="text-sm text-emerald-300 font-semibold mb-3">STAGE CLEAR</p>
            <div className="my-2 space-y-1">
              <p className="text-xs text-slate-400 font-sans">TOTAL SCORE</p>
              <p className="text-3xl font-bold text-white font-pixel">{score + 1000}</p>
            </div>
            <button
              type="button"
              onClick={resetGame}
              className="mt-3 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-arcade tracking-wider rounded-lg shadow-lg active:scale-95 transition-transform flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Mobile Touch Controller */}
      <div className="w-full max-w-[540px] mt-4">
        <TouchControls
          onUp={jump}
          onLeft={() => {
            playerRef.current.vx = -4.5;
            playerRef.current.facingRight = false;
          }}
          onRight={() => {
            playerRef.current.vx = 4.5;
            playerRef.current.facingRight = true;
          }}
          onActionA={jump}
          actionALabel="JUMP"
        />
      </div>
    </div>
  );
};
