import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Shield,
  ShieldOff,
  Trophy,
  Zap,
  Sparkles,
  Flame,
  Palette,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/sound';
import { TouchControls } from '../controls/TouchControls';

interface Point {
  x: number;
  y: number;
}

type FoodType = 'regular' | 'golden' | 'ghost' | 'freeze' | 'turbo';

interface FoodItem extends Point {
  type: FoodType;
  spawnTime: number;
  duration?: number; // ms until expiry
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  life: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
}

const GRID_SIZE = 22;
const BASE_TICK_MS = 125;

type SnakeTheme = 'cyber' | 'matrix' | 'synthwave' | 'gameboy';

export const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ]);
  const [direction, setDirection] = useState<Point>({ x: 1, y: 0 });
  const nextDirRef = useRef<Point>({ x: 1, y: 0 });

  const [food, setFood] = useState<FoodItem>({
    x: 15,
    y: 10,
    type: 'regular',
    spawnTime: Date.now()
  });

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('retro_snake_highscore') || '0');
  });

  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'>('IDLE');
  const [wrapWalls, setWrapWalls] = useState<boolean>(true);
  const [theme, setTheme] = useState<SnakeTheme>('cyber');
  const [isSprinting, setIsSprinting] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());

  // Powerup active timers
  const [activeBuff, setActiveBuff] = useState<{
    type: FoodType;
    label: string;
    expiresAt: number;
  } | null>(null);

  // Stats
  const [comboCount, setComboCount] = useState<number>(0);
  const lastEatTimeRef = useRef<number>(0);
  const consecutiveEatsRef = useRef<number>(0);

  // Particles & Visual FX
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const screenShakeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Generate Food with Weighted Types
  const spawnFoodItem = useCallback((currentSnake: Point[]): FoodItem => {
    let newX = 0;
    let newY = 0;
    let collision = true;

    while (collision) {
      newX = Math.floor(Math.random() * GRID_SIZE);
      newY = Math.floor(Math.random() * GRID_SIZE);
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      collision = currentSnake.some(seg => seg.x === newX && seg.y === newY);
    }

    const rand = Math.random();
    let type: FoodType = 'regular';
    let duration: number | undefined;

    // 25% chance of Golden Sun Orb, 8% Ghost, 8% Freeze, 8% Turbo
    if (rand < 0.24) {
      type = 'golden';
      duration = 8000; // 8 seconds countdown
    } else if (rand < 0.32) {
      type = 'ghost';
      duration = 6500;
    } else if (rand < 0.40) {
      type = 'freeze';
      duration = 7000;
    } else if (rand < 0.48) {
      type = 'turbo';
      duration = 6500;
    }

    return {
      x: newX,
      y: newY,
      type,
      spawnTime: Date.now(),
      duration
    };
  }, []);

  const addFloatingText = (x: number, y: number, text: string, color: string) => {
    floatingTextsRef.current.push({
      id: Date.now() + Math.random(),
      x,
      y,
      text,
      color,
      alpha: 1
    });
  };

  const spawnBurst = (x: number, y: number, colors: string[], count = 16) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        size: Math.random() * 3 + 2,
        life: 0.94
      });
    }
  };

  const spawnTailTrail = (x: number, y: number, color: string) => {
    if (Math.random() < 0.5) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        color,
        alpha: 0.8,
        size: Math.random() * 2 + 1.5,
        life: 0.88
      });
    }
  };

  const resetGame = () => {
    const initSnake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    setSnake(initSnake);
    setDirection({ x: 1, y: 0 });
    nextDirRef.current = { x: 1, y: 0 };
    setFood(spawnFoodItem(initSnake));
    setScore(0);
    setComboCount(0);
    setActiveBuff(null);
    particlesRef.current = [];
    floatingTextsRef.current = [];
    screenShakeRef.current = 0;
    setGameState('PLAYING');
    sound.tick();
  };

  const handleDirectionChange = useCallback((newDir: Point) => {
    // Prevent 180 reverse
    if (newDir.x !== 0 && direction.x !== 0) return;
    if (newDir.y !== 0 && direction.y !== 0) return;
    nextDirRef.current = newDir;
    sound.tick();
  }, [direction]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        if (gameState === 'PLAYING') setGameState('PAUSED');
        else if (gameState === 'PAUSED') setGameState('PLAYING');
        else if (gameState === 'IDLE' || gameState === 'GAME_OVER') resetGame();
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        resetGame();
        return;
      }

      // Shift to sprint boost
      if (e.key === 'Shift') {
        setIsSprinting(true);
      }

      if (gameState !== 'PLAYING') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          handleDirectionChange({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          handleDirectionChange({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          handleDirectionChange({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleDirectionChange({ x: 1, y: 0 });
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsSprinting(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, handleDirectionChange]);

  // Speed Curve Math
  const computeTickInterval = useCallback(() => {
    // Base speed scales smoothly with length / score
    let base = BASE_TICK_MS - Math.min(65, Math.floor(snake.length * 1.5));

    // Active buffs
    if (activeBuff) {
      if (activeBuff.type === 'freeze') base = Math.floor(base * 1.6); // slow down
      if (activeBuff.type === 'turbo') base = Math.floor(base * 0.65); // speed up
    }

    if (isSprinting) {
      base = Math.max(38, Math.floor(base * 0.6));
    }

    return Math.max(42, base);
  }, [snake.length, activeBuff, isSprinting]);

  // Game Tick Engine
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const intervalMs = computeTickInterval();

    const timer = setInterval(() => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        const curDir = nextDirRef.current;
        setDirection(curDir);

        let nextX = head.x + curDir.x;
        let nextY = head.y + curDir.y;

        // Wrap vs Solid Walls
        if (wrapWalls) {
          if (nextX < 0) nextX = GRID_SIZE - 1;
          if (nextX >= GRID_SIZE) nextX = 0;
          if (nextY < 0) nextY = GRID_SIZE - 1;
          if (nextY >= GRID_SIZE) nextY = 0;
        } else {
          if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
            // Collision with wall
            setGameState('GAME_OVER');
            screenShakeRef.current = 12;
            sound.gameOver();
            return prevSnake;
          }
        }

        const newHead = { x: nextX, y: nextY };
        const hasGhostBuff = activeBuff?.type === 'ghost';

        // Self-collision check (bypassed if Ghost mode is active)
        if (
          !hasGhostBuff &&
          prevSnake.some((seg, idx) => idx !== prevSnake.length - 1 && seg.x === newHead.x && seg.y === newHead.y)
        ) {
          setGameState('GAME_OVER');
          screenShakeRef.current = 12;
          sound.gameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Tail trail emission
        const tail = prevSnake[prevSnake.length - 1];
        const trailColor =
          theme === 'cyber'
            ? '#06b6d4'
            : theme === 'matrix'
            ? '#22c55e'
            : theme === 'synthwave'
            ? '#ec4899'
            : '#84cc16';
        spawnTailTrail(tail.x * 20 + 10, tail.y * 20 + 10, trailColor);

        // Check Food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          const now = Date.now();
          const isCombo = now - lastEatTimeRef.current < 3500;
          const combo = isCombo ? consecutiveEatsRef.current + 1 : 1;
          consecutiveEatsRef.current = combo;
          lastEatTimeRef.current = now;
          setComboCount(combo);

          let basePoints = 10;
          let label = '+10';
          let burstColors = ['#10b981', '#34d399', '#6ee7b7'];

          if (food.type === 'golden') {
            basePoints = 30;
            label = '+30 GOLDEN!';
            burstColors = ['#fbbf24', '#fef08a', '#f59e0b', '#ffffff'];
            screenShakeRef.current = 6;
            confetti({ particleCount: 20, spread: 45 });
          } else if (food.type === 'ghost') {
            basePoints = 25;
            label = 'GHOST PHASE (6s)';
            burstColors = ['#c084fc', '#a855f7', '#e9d5ff'];
            setActiveBuff({ type: 'ghost', label: 'PHASING THROUGH WALLS & TAIL', expiresAt: now + 6000 });
          } else if (food.type === 'freeze') {
            basePoints = 20;
            label = 'SLO-MO ICE (7s)';
            burstColors = ['#38bdf8', '#0284c7', '#bae6fd'];
            setActiveBuff({ type: 'freeze', label: 'SLO-MO FREEZE ACTIVE', expiresAt: now + 7000 });
          } else if (food.type === 'turbo') {
            basePoints = 25;
            label = 'TURBO SURGE (6s)';
            burstColors = ['#f43f5e', '#fb7185', '#ffe4e6'];
            setActiveBuff({ type: 'turbo', label: 'HYPER TURBO DRIVE', expiresAt: now + 6000 });
          }

          const multiplier = combo > 1 ? combo : 1;
          const finalScoreInc = basePoints * multiplier;

          if (combo > 1) {
            label += ` (x${multiplier} COMBO!)`;
          }

          addFloatingText(food.x * 20 + 10, food.y * 20, label, burstColors[0]);
          spawnBurst(food.x * 20 + 10, food.y * 20 + 10, burstColors, food.type === 'golden' ? 22 : 14);

          setScore(s => {
            const next = s + finalScoreInc;
            if (next > highScore) {
              setHighScore(next);
              localStorage.setItem('retro_snake_highscore', String(next));
            }
            return next;
          });

          sound.eat();
          setFood(spawnFoodItem(newSnake));
        } else {
          // Remove tail segment
          newSnake.pop();
        }

        // Expire timed food
        if (food.duration && Date.now() - food.spawnTime > food.duration) {
          setFood(spawnFoodItem(newSnake));
        }

        // Check active buff expiry
        if (activeBuff && Date.now() > activeBuff.expiresAt) {
          setActiveBuff(null);
        }

        return newSnake;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [
    gameState,
    food,
    wrapWalls,
    activeBuff,
    highScore,
    theme,
    computeTickInterval,
    spawnFoodItem
  ]);

  // Main Canvas Rendering Loop (60 FPS with particle interpolation and scanlines)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = (time: number) => {
      const width = canvas.width;
      const height = canvas.height;
      const cellSize = width / GRID_SIZE;

      ctx.save();

      // Screen shake offset
      if (screenShakeRef.current > 0) {
        const shakeX = (Math.random() - 0.5) * screenShakeRef.current;
        const shakeY = (Math.random() - 0.5) * screenShakeRef.current;
        ctx.translate(shakeX, shakeY);
        screenShakeRef.current *= 0.88;
        if (screenShakeRef.current < 0.5) screenShakeRef.current = 0;
      }

      // Background styling per theme
      if (theme === 'cyber') {
        ctx.fillStyle = '#060a14';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = '#0d192e';
      } else if (theme === 'matrix') {
        ctx.fillStyle = '#030d06';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = '#082611';
      } else if (theme === 'synthwave') {
        ctx.fillStyle = '#11091f';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = '#271442';
      } else {
        // Game Boy
        ctx.fillStyle = '#8f9c2d';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = '#818e26';
      }

      // Grid lines
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(width, i * cellSize);
        ctx.stroke();
      }

      // Solid vs Wraparound Wall Perimeter
      if (!wrapWalls) {
        // Lethal high-voltage red border
        ctx.strokeStyle = '#ef4444';
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 3;
        ctx.strokeRect(1.5, 1.5, width - 3, height - 3);
        ctx.shadowBlur = 0;
      } else {
        // Portal neon boundary markers on corners
        ctx.strokeStyle = theme === 'matrix' ? '#10b981' : '#06b6d4';
        ctx.lineWidth = 1.5;
        const cornerLen = 14;
        // TL
        ctx.beginPath();
        ctx.moveTo(0, cornerLen); ctx.lineTo(0, 0); ctx.lineTo(cornerLen, 0); ctx.stroke();
        // TR
        ctx.beginPath();
        ctx.moveTo(width - cornerLen, 0); ctx.lineTo(width, 0); ctx.lineTo(width, cornerLen); ctx.stroke();
        // BL
        ctx.beginPath();
        ctx.moveTo(0, height - cornerLen); ctx.lineTo(0, height); ctx.lineTo(cornerLen, height); ctx.stroke();
        // BR
        ctx.beginPath();
        ctx.moveTo(width - cornerLen, height); ctx.lineTo(width, height); ctx.lineTo(width, height - cornerLen); ctx.stroke();
      }

      // Render Food Item
      const foodX = food.x * cellSize;
      const foodY = food.y * cellSize;
      const pulse = Math.sin(time / 160) * 2.5;

      if (food.type === 'golden') {
        // Golden Sun Orb with radial countdown ring
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(foodX + cellSize / 2, foodY + cellSize / 2, cellSize / 2.3 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Sparkle core
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(foodX + cellSize * 0.38, foodY + cellSize * 0.38, cellSize * 0.24, cellSize * 0.24);

        // Circular countdown progress ring
        if (food.duration) {
          const elapsed = Date.now() - food.spawnTime;
          const remainingFraction = Math.max(0, 1 - elapsed / food.duration);
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(
            foodX + cellSize / 2,
            foodY + cellSize / 2,
            cellSize * 0.65,
            -Math.PI / 2,
            -Math.PI / 2 + Math.PI * 2 * remainingFraction
          );
          ctx.stroke();
        }
      } else if (food.type === 'ghost') {
        // Phasing Violet Prism
        ctx.fillStyle = '#c084fc';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(foodX + cellSize / 2, foodY + cellSize / 2, cellSize / 2.5 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👻', foodX + cellSize / 2, foodY + cellSize / 2);
      } else if (food.type === 'freeze') {
        // Icy Snowflake Berry
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(foodX + cellSize / 2, foodY + cellSize / 2, cellSize / 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❄', foodX + cellSize / 2, foodY + cellSize / 2);
      } else if (food.type === 'turbo') {
        // Turbo Surge Lightning
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#e11d48';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(foodX + cellSize / 2, foodY + cellSize / 2, cellSize / 2.5 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', foodX + cellSize / 2, foodY + cellSize / 2);
      } else {
        // Regular Emerald Energy Pellet
        const foodColor =
          theme === 'gameboy'
            ? '#2d3810'
            : theme === 'synthwave'
            ? '#ec4899'
            : theme === 'matrix'
            ? '#22c55e'
            : '#10b981';

        ctx.fillStyle = foodColor;
        ctx.shadowColor = foodColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(foodX + cellSize / 2, foodY + cellSize / 2, cellSize / 2.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw Snake Body
      const isGhostActive = activeBuff?.type === 'ghost';
      const isTurboActive = activeBuff?.type === 'turbo' || isSprinting;

      snake.forEach((seg, index) => {
        const segX = seg.x * cellSize;
        const segY = seg.y * cellSize;

        if (index === 0) {
          // Head Styling
          let headColor = '#38bdf8';
          let headGlow = '#0284c7';

          if (theme === 'matrix') {
            headColor = '#4ade80';
            headGlow = '#16a34a';
          } else if (theme === 'synthwave') {
            headColor = '#f472b6';
            headGlow = '#db2777';
          } else if (theme === 'gameboy') {
            headColor = '#1f260b';
            headGlow = 'transparent';
          }

          if (isTurboActive) {
            headColor = '#fb7185';
            headGlow = '#e11d48';
          }

          ctx.fillStyle = headColor;
          if (headGlow !== 'transparent') {
            ctx.shadowColor = headGlow;
            ctx.shadowBlur = 12;
          }

          // Rounded head
          ctx.beginPath();
          ctx.roundRect(segX + 1.5, segY + 1.5, cellSize - 3, cellSize - 3, 6);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Snake Eyes facing current direction
          ctx.fillStyle = '#ffffff';
          const eyeSize = cellSize * 0.2;
          let eye1X = segX + cellSize * 0.25;
          let eye1Y = segY + cellSize * 0.25;
          let eye2X = segX + cellSize * 0.65;
          let eye2Y = segY + cellSize * 0.25;

          if (direction.y !== 0) {
            eye1X = segX + cellSize * 0.25;
            eye2X = segX + cellSize * 0.65;
            eye1Y = direction.y > 0 ? segY + cellSize * 0.6 : segY + cellSize * 0.2;
            eye2Y = eye1Y;
          } else if (direction.x !== 0) {
            eye1Y = segY + cellSize * 0.25;
            eye2Y = segY + cellSize * 0.65;
            eye1X = direction.x > 0 ? segX + cellSize * 0.6 : segX + cellSize * 0.2;
            eye2X = eye1X;
          }

          ctx.fillRect(eye1X, eye1Y, eyeSize, eyeSize);
          ctx.fillRect(eye2X, eye2Y, eyeSize, eyeSize);

          // Dark pupils
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(eye1X + 1, eye1Y + 1, eyeSize - 2, eyeSize - 2);
          ctx.fillRect(eye2X + 1, eye2Y + 1, eyeSize - 2, eyeSize - 2);
        } else {
          // Body Segments with smooth tapering & ghost translucency
          const factor = index / snake.length;
          let r = 14 + Math.floor(factor * 20);
          let g = 165 - Math.floor(factor * 60);
          let b = 233 - Math.floor(factor * 80);

          if (theme === 'matrix') {
            r = 20; g = 180 - Math.floor(factor * 80); b = 50;
          } else if (theme === 'synthwave') {
            r = 219 - Math.floor(factor * 70); g = 39; b = 119 + Math.floor(factor * 40);
          } else if (theme === 'gameboy') {
            r = 45; g = 56; b = 16;
          }

          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.globalAlpha = isGhostActive ? 0.45 : 1;

          ctx.beginPath();
          ctx.roundRect(segX + 2, segY + 2, cellSize - 4, cellSize - 4, 4);
          ctx.fill();

          // Core neon spine highlight line
          if (theme !== 'gameboy') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.fillRect(segX + cellSize * 0.38, segY + cellSize * 0.38, cellSize * 0.24, cellSize * 0.24);
          }

          ctx.globalAlpha = 1;
        }
      });

      // Update & Render Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha *= p.life;

        if (p.alpha < 0.05) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Update & Render Floating Score Texts
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        ft.y -= 1;
        ft.alpha -= 0.02;

        if (ft.alpha <= 0) {
          floatingTextsRef.current.splice(i, 1);
          continue;
        }

        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.alpha;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      if (isRunning) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [snake, food, direction, wrapWalls, theme, activeBuff, isSprinting]);

  const currentSpeedMult = ((BASE_TICK_MS / computeTickInterval())).toFixed(1);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 select-none font-sans-clean">
      {/* Top HUD */}
      <div className="flex flex-wrap items-center justify-between w-full max-w-[460px] mb-3 text-sm font-arcade">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-sans tracking-wide">SCORE</span>
            <span className="text-xl font-bold text-cyan-400 font-pixel">{score}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-sans tracking-wide flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400 inline" /> BEST
            </span>
            <span className="text-xl font-bold text-amber-400 font-pixel">{highScore}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-sans tracking-wide">LENGTH</span>
            <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{snake.length}</span>
          </div>
        </div>

        {/* Speedometer & Active Buff */}
        <div className="flex items-center gap-2">
          {/* Wall Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              setWrapWalls(!wrapWalls);
              sound.tick();
            }}
            title={wrapWalls ? 'Walls: Wraparound (Teleport across bounds)' : 'Walls: Solid (Lethal perimeter collision)'}
            className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
              wrapWalls
                ? 'bg-slate-800 border-slate-700 text-cyan-300'
                : 'bg-red-950/80 border-red-800 text-red-300'
            }`}
          >
            {wrapWalls ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
            <span className="font-mono text-[11px] font-bold">{wrapWalls ? 'WRAP' : 'SOLID'}</span>
          </button>

          {/* Theme Palette Switcher */}
          <button
            type="button"
            onClick={() => {
              const themes: SnakeTheme[] = ['cyber', 'matrix', 'synthwave', 'gameboy'];
              const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
              setTheme(themes[nextIdx]);
              sound.tick();
            }}
            title={`Current Theme: ${theme.toUpperCase()}`}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              const muted = sound.toggleMute();
              setIsMuted(muted);
            }}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Speedometer & Active Buff Banner */}
      <div className="flex items-center justify-between w-full max-w-[460px] mb-2 px-1 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">VELOCITY:</span>
          <span className="text-amber-400 font-bold">{currentSpeedMult}x</span>
          {isSprinting && (
            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/40 animate-pulse">
              SPRINTING
            </span>
          )}
        </div>

        {activeBuff ? (
          <span className="text-cyan-300 font-bold animate-pulse text-[11px]">
            ⚡ {activeBuff.label}
          </span>
        ) : comboCount > 1 ? (
          <span className="text-amber-400 font-bold text-[11px]">
            🔥 COMBO x{comboCount}!
          </span>
        ) : (
          <span className="text-slate-400 text-[11px]">Hold SHIFT to Sprint</span>
        )}
      </div>

      {/* Screen Frame */}
      <div className="relative border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-black crt-screen arcade-glow-cyan">
        <canvas
          ref={canvasRef}
          width={460}
          height={460}
          className="block w-full max-w-[460px] aspect-square"
        />

        {/* Overlay States */}
        {gameState === 'IDLE' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30">
            <h2 className="text-2xl font-bold text-cyan-400 font-pixel mb-2">NEON MATRIX SNAKE</h2>
            <p className="text-xs text-slate-300 max-w-xs mb-5 font-sans leading-relaxed">
              Navigate the neon matrix, collect power fruits, and maintain fluid momentum.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono text-left max-w-xs mb-5 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <div>🟢 Emerald: +10 pts</div>
              <div>⭐ Golden: +30 pts</div>
              <div>👻 Ghost: Pass walls/tail</div>
              <div>❄ Freeze: Slo-Mo speed</div>
            </div>

            <button
              type="button"
              onClick={resetGame}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-arcade tracking-wider rounded-lg shadow-lg active:scale-95 transition-transform flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> LAUNCH SNAKE
            </button>
            <div className="mt-3 text-[11px] text-slate-400 font-mono">
              Arrows / WASD · Shift to Sprint · Space to Pause
            </div>
          </div>
        )}

        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30">
            <h2 className="text-xl font-bold text-amber-400 font-pixel mb-4">GAME PAUSED</h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGameState('PLAYING')}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-sm flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> RESUME
              </button>
              <button
                type="button"
                onClick={resetGame}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-lg text-sm flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> RESTART
              </button>
            </div>
          </div>
        )}

        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-red-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in duration-200">
            <h2 className="text-2xl font-bold text-red-400 font-pixel mb-1">CRASH DETECTED</h2>
            <div className="my-3 space-y-1">
              <p className="text-xs text-slate-400 font-sans">FINAL SCORE</p>
              <p className="text-3xl font-bold text-white font-pixel">{score}</p>
              <p className="text-xs text-emerald-400 font-mono">FINAL LENGTH: {snake.length}</p>
              {score >= highScore && score > 0 && (
                <p className="text-xs text-amber-400 font-semibold mt-1">★ NEW PERSONAL BEST! ★</p>
              )}
            </div>
            <button
              type="button"
              onClick={resetGame}
              className="px-6 py-2.5 bg-red-500 hover:bg-red-400 text-white font-bold font-arcade tracking-wider rounded-lg shadow-lg active:scale-95 transition-transform flex items-center gap-2 text-xs"
            >
              <RotateCcw className="w-4 h-4" /> TRY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Sprint Trigger & Theme Bar */}
      <div className="flex items-center justify-between w-full max-w-[460px] mt-3">
        <button
          type="button"
          onMouseDown={() => setIsSprinting(true)}
          onMouseUp={() => setIsSprinting(false)}
          onTouchStart={() => setIsSprinting(true)}
          onTouchEnd={() => setIsSprinting(false)}
          className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-transform active:scale-95 flex items-center gap-1.5 ${
            isSprinting
              ? 'bg-rose-500 text-white'
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>HOLD TO SPRINT (BOOST)</span>
        </button>

        <div className="flex items-center gap-1">
          {(['cyber', 'matrix', 'synthwave', 'gameboy'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTheme(t);
                sound.tick();
              }}
              className={`px-2 py-1 text-[10px] font-mono uppercase rounded transition-colors ${
                theme === t
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Touch Controller */}
      <div className="w-full max-w-[460px] mt-4">
        <TouchControls
          onUp={() => handleDirectionChange({ x: 0, y: -1 })}
          onDown={() => handleDirectionChange({ x: 0, y: 1 })}
          onLeft={() => handleDirectionChange({ x: -1, y: 0 })}
          onRight={() => handleDirectionChange({ x: 1, y: 0 })}
          onActionA={() => {
            if (gameState === 'PLAYING') setGameState('PAUSED');
            else if (gameState === 'PAUSED') setGameState('PLAYING');
            else resetGame();
          }}
          onActionB={() => {
            setIsSprinting(prev => !prev);
          }}
          actionALabel={gameState === 'PLAYING' ? 'PAUSE' : 'START'}
          actionBLabel="BOOST"
        />
      </div>
    </div>
  );
};
