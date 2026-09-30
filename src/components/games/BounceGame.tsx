import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Heart, Trophy, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/sound';

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Brick {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  hits: number;
  maxHits: number;
  color: string;
  points: number;
  unbreakable?: boolean;
}

interface Powerup {
  id: number;
  x: number;
  y: number;
  vy: number;
  type: 'wide' | 'multiball' | 'laser' | 'slow';
  color: string;
  icon: string;
}

interface Laser {
  x: number;
  y: number;
  vy: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
}

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 500;
const DEFAULT_PADDLE_WIDTH = 84;
const PADDLE_HEIGHT = 12;

export const BounceGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY'>('IDLE');
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [level, setLevel] = useState<number>(1);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('retro_bounce_highscore') || '0');
  });

  const [activePowerup, setActivePowerup] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());

  // Game internal mutable state refs for 60fps canvas loop
  const paddleRef = useRef({
    x: CANVAS_WIDTH / 2 - DEFAULT_PADDLE_WIDTH / 2,
    y: CANVAS_HEIGHT - 35,
    w: DEFAULT_PADDLE_WIDTH,
    h: PADDLE_HEIGHT,
    speed: 7
  });

  const ballsRef = useRef<Ball[]>([]);
  const bricksRef = useRef<Brick[]>([]);
  const powerupsRef = useRef<Powerup[]>([]);
  const lasersRef = useRef<Laser[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const laserAmmoRef = useRef<number>(0);
  const keysRef = useRef<{ left: boolean; right: boolean; space: boolean }>({
    left: false,
    right: false,
    space: false
  });

  const animationFrameRef = useRef<number | null>(null);

  // Build brick stage layouts
  const buildBricks = useCallback((lvl: number): Brick[] => {
    const list: Brick[] = [];
    const rows = 5 + Math.min(lvl, 3);
    const cols = 8;
    const brickW = 50;
    const brickH = 16;
    const padding = 6;
    const offsetX = (CANVAS_WIDTH - (cols * (brickW + padding) - padding)) / 2;
    const offsetY = 50;

    const rowColors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#c084fc', '#e879f9'];

    let id = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Special patterns per level
        if (lvl === 2 && (r + c) % 2 === 1) continue; // Checkerboard
        if (lvl === 3 && (c === 0 || c === cols - 1) && r > 2) continue; // Archway

        const hits = r === 0 && lvl > 1 ? 2 : 1;
        const color = rowColors[r % rowColors.length];

        list.push({
          id: id++,
          x: offsetX + c * (brickW + padding),
          y: offsetY + r * (brickH + padding),
          w: brickW,
          h: brickH,
          hits,
          maxHits: hits,
          color,
          points: hits * 20
        });
      }
    }
    return list;
  }, []);

  const resetBallAndPaddle = () => {
    paddleRef.current.x = CANVAS_WIDTH / 2 - paddleRef.current.w / 2;
    ballsRef.current = [
      {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - 55,
        vx: (Math.random() > 0.5 ? 1 : -1) * 3.5,
        vy: -4,
        radius: 6
      }
    ];
  };

  const startLevel = useCallback((lvl: number) => {
    bricksRef.current = buildBricks(lvl);
    powerupsRef.current = [];
    lasersRef.current = [];
    particlesRef.current = [];
    laserAmmoRef.current = 0;
    setActivePowerup(null);
    paddleRef.current.w = DEFAULT_PADDLE_WIDTH;
    resetBallAndPaddle();
    setLevel(lvl);
  }, [buildBricks]);

  const resetGame = () => {
    setScore(0);
    setLives(3);
    startLevel(1);
    setGameState('PLAYING');
    sound.tick();
  };

  // Shatter particle burst
  const createBrickBurst = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color,
        alpha: 1
      });
    }
  };

  // Keyboard listeners
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

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
      }
      if (e.key === ' ') {
        keysRef.current.space = true;
        // Fire laser if ammo
        if (laserAmmoRef.current > 0 && gameState === 'PLAYING') {
          lasersRef.current.push(
            { x: paddleRef.current.x + 8, y: paddleRef.current.y - 6, vy: -7 },
            { x: paddleRef.current.x + paddleRef.current.w - 8, y: paddleRef.current.y - 6, vy: -7 }
          );
          laserAmmoRef.current--;
          sound.laser();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      }
      if (e.key === ' ') {
        keysRef.current.space = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Mouse & Touch steering
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'PLAYING') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const clientX = (e.clientX - rect.left) * scaleX;
    paddleRef.current.x = Math.max(0, Math.min(CANVAS_WIDTH - paddleRef.current.w, clientX - paddleRef.current.w / 2));
  };

  const handlePointerDown = () => {
    if (gameState === 'IDLE' || gameState === 'GAME_OVER' || gameState === 'VICTORY') {
      resetGame();
      return;
    }
    // Fire laser on click if available
    if (laserAmmoRef.current > 0 && gameState === 'PLAYING') {
      lasersRef.current.push(
        { x: paddleRef.current.x + 8, y: paddleRef.current.y - 6, vy: -7 },
        { x: paddleRef.current.x + paddleRef.current.w - 8, y: paddleRef.current.y - 6, vy: -7 }
      );
      laserAmmoRef.current--;
      sound.laser();
    }
  };

  // Main 60FPS Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let isRunning = true;

    const gameLoop = () => {
      const paddle = paddleRef.current;
      const balls = ballsRef.current;
      const bricks = bricksRef.current;
      const powerups = powerupsRef.current;
      const lasers = lasersRef.current;

      // 1. Move Paddle with keyboard
      if (keysRef.current.left) {
        paddle.x = Math.max(0, paddle.x - paddle.speed);
      }
      if (keysRef.current.right) {
        paddle.x = Math.min(CANVAS_WIDTH - paddle.w, paddle.x + paddle.speed);
      }

      // 2. Move Lasers & test collisions with bricks
      for (let l = lasers.length - 1; l >= 0; l--) {
        const laser = lasers[l];
        laser.y += laser.vy;

        if (laser.y < 0) {
          lasers.splice(l, 1);
          continue;
        }

        // Test brick hit
        for (let b = bricks.length - 1; b >= 0; b--) {
          const brk = bricks[b];
          if (
            laser.x >= brk.x &&
            laser.x <= brk.x + brk.w &&
            laser.y >= brk.y &&
            laser.y <= brk.y + brk.h
          ) {
            lasers.splice(l, 1);
            brk.hits--;
            sound.brickHit(brk.hits);
            createBrickBurst(laser.x, laser.y, brk.color);

            if (brk.hits <= 0) {
              setScore(s => s + brk.points);
              bricks.splice(b, 1);
            }
            break;
          }
        }
      }

      // 3. Move Powerups & catch by paddle
      for (let p = powerups.length - 1; p >= 0; p--) {
        const pwr = powerups[p];
        pwr.y += pwr.vy;

        if (pwr.y > CANVAS_HEIGHT) {
          powerups.splice(p, 1);
          continue;
        }

        // Catch with paddle
        if (
          pwr.y + 10 >= paddle.y &&
          pwr.y <= paddle.y + paddle.h &&
          pwr.x >= paddle.x &&
          pwr.x <= paddle.x + paddle.w
        ) {
          powerups.splice(p, 1);
          sound.powerup();

          // Apply powerup
          if (pwr.type === 'wide') {
            paddle.w = DEFAULT_PADDLE_WIDTH * 1.5;
            setActivePowerup('WIDE PADDLE (12s)');
            setTimeout(() => {
              paddle.w = DEFAULT_PADDLE_WIDTH;
              setActivePowerup(null);
            }, 12000);
          } else if (pwr.type === 'multiball') {
            if (balls.length > 0) {
              const b = balls[0];
              balls.push(
                { x: b.x, y: b.y, vx: -b.vx, vy: b.vy, radius: b.radius },
                { x: b.x, y: b.y, vx: b.vx * 1.2, vy: -Math.abs(b.vy), radius: b.radius }
              );
              setActivePowerup('MULTI-BALL ACTIVATED');
            }
          } else if (pwr.type === 'laser') {
            laserAmmoRef.current = 10;
            setActivePowerup('LASER CANNON (10 shots - SPACE)');
          } else if (pwr.type === 'slow') {
            balls.forEach(b => {
              b.vx *= 0.75;
              b.vy *= 0.75;
            });
            setActivePowerup('SLOW BALL');
          }
        }
      }

      // 4. Move Balls & Bounce
      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        b.x += b.vx;
        b.y += b.vy;

        // Wall collisions
        if (b.x - b.radius <= 0) {
          b.x = b.radius;
          b.vx = Math.abs(b.vx);
          sound.bounce();
        } else if (b.x + b.radius >= CANVAS_WIDTH) {
          b.x = CANVAS_WIDTH - b.radius;
          b.vx = -Math.abs(b.vx);
          sound.bounce();
        }

        if (b.y - b.radius <= 0) {
          b.y = b.radius;
          b.vy = Math.abs(b.vy);
          sound.bounce();
        }

        // Paddle collision with angle deflection math
        if (
          b.y + b.radius >= paddle.y &&
          b.y - b.radius <= paddle.y + paddle.h &&
          b.x >= paddle.x &&
          b.x <= paddle.x + paddle.w
        ) {
          b.y = paddle.y - b.radius;
          // Calculate hit position from center of paddle: -1 (left edge) to 1 (right edge)
          const hitPos = (b.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
          const maxAngle = (60 * Math.PI) / 180;
          const bounceAngle = hitPos * maxAngle;
          const currentSpeed = Math.min(8.5, Math.hypot(b.vx, b.vy) * 1.02);

          b.vx = currentSpeed * Math.sin(bounceAngle);
          b.vy = -currentSpeed * Math.cos(bounceAngle);

          sound.bounce(true);
        }

        // Brick collisions (AABB with circle)
        for (let j = bricks.length - 1; j >= 0; j--) {
          const brk = bricks[j];
          if (
            b.x + b.radius >= brk.x &&
            b.x - b.radius <= brk.x + brk.w &&
            b.y + b.radius >= brk.y &&
            b.y - b.radius <= brk.y + brk.h
          ) {
            // Determine bounce axis
            const overlapLeft = b.x + b.radius - brk.x;
            const overlapRight = brk.x + brk.w - (b.x - b.radius);
            const overlapTop = b.y + b.radius - brk.y;
            const overlapBottom = brk.y + brk.h - (b.y - b.radius);

            const minOverlapX = Math.min(overlapLeft, overlapRight);
            const minOverlapY = Math.min(overlapTop, overlapBottom);

            if (minOverlapX < minOverlapY) {
              b.vx = -b.vx;
            } else {
              b.vy = -b.vy;
            }

            brk.hits--;
            sound.brickHit(brk.hits);
            createBrickBurst(b.x, b.y, brk.color);

            if (brk.hits <= 0) {
              setScore(s => {
                const nextScore = s + brk.points;
                if (nextScore > highScore) {
                  setHighScore(nextScore);
                  localStorage.setItem('retro_bounce_highscore', String(nextScore));
                }
                return nextScore;
              });

              // Chance to spawn powerup
              if (Math.random() < 0.28) {
                const pTypes: ('wide' | 'multiball' | 'laser' | 'slow')[] = ['wide', 'multiball', 'laser', 'slow'];
                const pType = pTypes[Math.floor(Math.random() * pTypes.length)];
                const pColors = { wide: '#38bdf8', multiball: '#fbbf24', laser: '#f43f5e', slow: '#a855f7' };
                const pIcons = { wide: 'W', multiball: 'M', laser: 'L', slow: 'S' };

                powerups.push({
                  id: Date.now() + Math.random(),
                  x: brk.x + brk.w / 2,
                  y: brk.y + brk.h / 2,
                  vy: 2.2,
                  type: pType,
                  color: pColors[pType],
                  icon: pIcons[pType]
                });
              }

              bricks.splice(j, 1);
            }
            break;
          }
        }

        // Ball fell out of bounds bottom
        if (b.y - b.radius > CANVAS_HEIGHT) {
          balls.splice(i, 1);
        }
      }

      // Check life lost
      if (balls.length === 0) {
        setLives(l => {
          const nextLives = l - 1;
          if (nextLives <= 0) {
            setGameState('GAME_OVER');
            sound.gameOver();
          } else {
            resetBallAndPaddle();
            setActivePowerup(null);
            sound.bounce();
          }
          return nextLives;
        });
      }

      // Check level clear
      if (bricks.length === 0) {
        if (level < 3) {
          sound.victory();
          confetti({ particleCount: 40, spread: 50 });
          startLevel(level + 1);
        } else {
          setGameState('VICTORY');
          sound.victory();
          confetti({ particleCount: 100, spread: 80 });
        }
      }

      // 5. Render onto Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Clear
          ctx.fillStyle = '#060a12';
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

          // Bricks
          bricks.forEach(brk => {
            ctx.fillStyle = brk.color;
            ctx.fillRect(brk.x, brk.y, brk.w, brk.h);
            // 3D Bevel highlight
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.fillRect(brk.x, brk.y, brk.w, 3);
            if (brk.hits > 1) {
              // Draw armor crack line
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(brk.x + 8, brk.y + 4);
              ctx.lineTo(brk.x + brk.w - 8, brk.y + brk.h - 4);
              ctx.stroke();
            }
          });

          // Paddle
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#0284c7';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 5);
          ctx.fill();
          ctx.shadowBlur = 0;
          // Paddle top sheen
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.fillRect(paddle.x + 4, paddle.y + 1, paddle.w - 8, 3);

          // Balls
          balls.forEach(b => {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          });

          // Lasers
          lasers.forEach(lz => {
            ctx.fillStyle = '#f43f5e';
            ctx.shadowColor = '#e11d48';
            ctx.shadowBlur = 8;
            ctx.fillRect(lz.x - 2, lz.y, 4, 10);
            ctx.shadowBlur = 0;
          });

          // Powerups
          powerups.forEach(pwr => {
            ctx.fillStyle = pwr.color;
            ctx.beginPath();
            ctx.roundRect(pwr.x - 10, pwr.y - 6, 20, 14, 4);
            ctx.fill();
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(pwr.icon, pwr.x, pwr.y + 1);
          });

          // Particles
          for (let pi = particlesRef.current.length - 1; pi >= 0; pi--) {
            const pt = particlesRef.current[pi];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.alpha *= 0.93;
            if (pt.alpha < 0.05) {
              particlesRef.current.splice(pi, 1);
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
  }, [gameState, level, highScore, startLevel]);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
      {/* Top HUD */}
      <div className="flex items-center justify-between w-full max-w-[480px] mb-3 font-arcade">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-sans tracking-wide">SCORE</span>
            <span className="text-xl font-bold text-rose-400 font-pixel">{score}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-sans tracking-wide">STAGE</span>
            <span className="text-xl font-bold text-amber-400 font-pixel">{level}/3</span>
          </div>
        </div>

        {/* Lives Counter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${
                  i < lives ? 'text-rose-500 fill-current' : 'text-slate-700'
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

      {/* Active Powerup Banner */}
      {activePowerup && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1 bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs font-mono rounded-md animate-pulse">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>{activePowerup}</span>
        </div>
      )}

      {/* Main Canvas */}
      <div className="relative border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-black crt-screen arcade-glow-amber">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          className="block cursor-crosshair touch-none w-full max-w-[480px]"
        />

        {/* Overlays */}
        {gameState === 'IDLE' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30">
            <h2 className="text-2xl font-bold text-rose-400 font-pixel mb-2">BOUNCE BRICK SHATTER</h2>
            <p className="text-xs text-slate-300 max-w-xs mb-6 font-sans">
              Deflect the energy sphere to shatter crystalline bricks. Collect multiball, lasers, and wide paddles!
            </p>
            <button
              type="button"
              onClick={resetGame}
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold font-arcade tracking-wider rounded-lg shadow-lg active:scale-95 transition-transform flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> LAUNCH BALL
            </button>
            <div className="mt-4 text-[11px] text-slate-400 font-mono">
              Mouse / Touch Drag or Left / Right Arrows
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
            <h2 className="text-2xl font-bold text-red-400 font-pixel mb-1">ALL BALLS LOST</h2>
            <div className="my-4 space-y-1">
              <p className="text-xs text-slate-400 font-sans">FINAL SCORE</p>
              <p className="text-3xl font-bold text-white font-pixel">{score}</p>
            </div>
            <button
              type="button"
              onClick={resetGame}
              className="px-6 py-2.5 bg-red-500 hover:bg-red-400 text-white font-bold font-arcade tracking-wider rounded-lg shadow-lg active:scale-95 transition-transform flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> PLAY AGAIN
            </button>
          </div>
        )}

        {gameState === 'VICTORY' && (
          <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in duration-200">
            <h2 className="text-2xl font-bold text-emerald-400 font-pixel mb-1">ALL STAGES CLEARED!</h2>
            <div className="my-4 space-y-1">
              <p className="text-xs text-slate-400 font-sans">CHAMPION SCORE</p>
              <p className="text-3xl font-bold text-white font-pixel">{score}</p>
              <p className="text-xs text-amber-300 font-semibold">ARCADE MASTER</p>
            </div>
            <button
              type="button"
              onClick={resetGame}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-arcade tracking-wider rounded-lg shadow-lg active:scale-95 transition-transform flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Control instructions */}
      <div className="flex items-center justify-between w-full max-w-[480px] mt-3 text-xs text-slate-400 font-mono">
        <span>Controls: Mouse Drag / Arrow Keys</span>
        <span>Space: Fire Lasers</span>
      </div>
    </div>
  );
};
