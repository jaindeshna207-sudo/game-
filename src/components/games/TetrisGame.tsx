import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Trophy, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/sound';
import { TouchControls } from '../controls/TouchControls';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20;

type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

interface TetrominoDef {
  shape: number[][];
  color: string;
}

const TETROMINOES: Record<TetrominoType, TetrominoDef> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#06b6d4' // cyan
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#3b82f6' // blue
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#f97316' // orange
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#eab308' // yellow
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: '#22c55e' // green
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#a855f7' // purple
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: '#ef4444' // red
  }
};

const TETROMINO_KEYS: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

const createEmptyBoard = (): (string | null)[][] =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

export const TetrisGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const holdCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [board, setBoard] = useState<(string | null)[][]>(createEmptyBoard);
  const [currentPiece, setCurrentPiece] = useState<{
    type: TetrominoType;
    shape: number[][];
    color: string;
    x: number;
    y: number;
  } | null>(null);

  const [nextPieceType, setNextPieceType] = useState<TetrominoType>('T');
  const [holdPieceType, setHoldPieceType] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState<boolean>(true);

  const [score, setScore] = useState<number>(0);
  const [lines, setLines] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('retro_tetris_highscore') || '0');
  });

  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'>('IDLE');
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());

  // Generate random piece
  const getRandomPieceType = (): TetrominoType => {
    return TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
  };

  // Collision detection
  const checkCollision = useCallback(
    (shape: number[][], offsetX: number, offsetY: number, currentBoard: (string | null)[][]): boolean => {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] !== 0) {
            const newX = offsetX + c;
            const newY = offsetY + r;

            // Boundaries
            if (newX < 0 || newX >= COLS || newY >= ROWS) {
              return true;
            }

            // Existing blocks
            if (newY >= 0 && currentBoard[newY][newX] !== null) {
              return true;
            }
          }
        }
      }
      return false;
    },
    []
  );

  // Spawn new piece
  const spawnPiece = useCallback(
    (typeToSpawn?: TetrominoType) => {
      const type = typeToSpawn || nextPieceType;
      const def = TETROMINOES[type];
      const nextType = getRandomPieceType();
      setNextPieceType(nextType);

      const startX = Math.floor(COLS / 2) - Math.floor(def.shape[0].length / 2);
      const startY = 0;

      // Check immediate game over
      if (checkCollision(def.shape, startX, startY, board)) {
        setGameState('GAME_OVER');
        sound.gameOver();
        return;
      }

      setCurrentPiece({
        type,
        shape: def.shape,
        color: def.color,
        x: startX,
        y: startY
      });
      setCanHold(true);
    },
    [nextPieceType, board, checkCollision]
  );

  // Rotate piece matrix CW
  const rotateMatrix = (matrix: number[][]): number[][] => {
    const N = matrix.length;
    const result: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        result[j][N - 1 - i] = matrix[i][j];
      }
    }
    return result;
  };

  // Rotate handler
  const handleRotate = useCallback(() => {
    if (!currentPiece || gameState !== 'PLAYING') return;
    const rotated = rotateMatrix(currentPiece.shape);

    // Standard wall kicks: try center, then kick left 1, kick right 1
    const kicks = [0, -1, 1, -2, 2];
    for (const offset of kicks) {
      if (!checkCollision(rotated, currentPiece.x + offset, currentPiece.y, board)) {
        setCurrentPiece(prev =>
          prev ? { ...prev, shape: rotated, x: prev.x + offset } : null
        );
        sound.rotate();
        return;
      }
    }
  }, [currentPiece, gameState, board, checkCollision]);

  // Move horizontally
  const handleMove = useCallback(
    (dir: number) => {
      if (!currentPiece || gameState !== 'PLAYING') return;
      if (!checkCollision(currentPiece.shape, currentPiece.x + dir, currentPiece.y, board)) {
        setCurrentPiece(prev => (prev ? { ...prev, x: prev.x + dir } : null));
        sound.tick();
      }
    },
    [currentPiece, gameState, board, checkCollision]
  );

  // Lock piece into board and clear lines
  const lockPiece = useCallback(() => {
    if (!currentPiece) return;

    sound.drop();
    const newBoard = board.map(row => [...row]);
    const { shape, color, x, y } = currentPiece;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const boardY = y + r;
          const boardX = x + c;
          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
            newBoard[boardY][boardX] = color;
          }
        }
      }
    }

    // Line clear checks
    let clearedCount = 0;
    const filteredBoard: (string | null)[][] = [];

    for (let r = 0; r < ROWS; r++) {
      const isFull = newBoard[r].every(cell => cell !== null);
      if (isFull) {
        clearedCount++;
      } else {
        filteredBoard.push(newBoard[r]);
      }
    }

    // Prepend new empty rows
    while (filteredBoard.length < ROWS) {
      filteredBoard.unshift(Array(COLS).fill(null));
    }

    setBoard(filteredBoard);

    if (clearedCount > 0) {
      sound.lineClear(clearedCount);
      const pointsMap = [0, 100, 300, 500, 800];
      const earned = (pointsMap[clearedCount] || 100) * level;

      setScore(s => {
        const nextScore = s + earned;
        if (nextScore > highScore) {
          setHighScore(nextScore);
          localStorage.setItem('retro_tetris_highscore', String(nextScore));
        }
        return nextScore;
      });

      setLines(l => {
        const totalLines = l + clearedCount;
        setLevel(Math.floor(totalLines / 10) + 1);
        return totalLines;
      });

      if (clearedCount >= 4) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    }

    spawnPiece();
  }, [currentPiece, board, level, highScore, spawnPiece]);

  // Drop down 1 unit
  const handleDrop = useCallback(() => {
    if (!currentPiece || gameState !== 'PLAYING') return;

    if (!checkCollision(currentPiece.shape, currentPiece.x, currentPiece.y + 1, board)) {
      setCurrentPiece(prev => (prev ? { ...prev, y: prev.y + 1 } : null));
    } else {
      lockPiece();
    }
  }, [currentPiece, gameState, board, checkCollision, lockPiece]);

  // Hard drop (instantly lock at lowest possible position)
  const handleHardDrop = useCallback(() => {
    if (!currentPiece || gameState !== 'PLAYING') return;
    let dropY = currentPiece.y;
    while (!checkCollision(currentPiece.shape, currentPiece.x, dropY + 1, board)) {
      dropY++;
    }
    setCurrentPiece(prev => (prev ? { ...prev, y: dropY } : null));
    setTimeout(() => {
      lockPiece();
    }, 10);
  }, [currentPiece, gameState, board, checkCollision, lockPiece]);

  // Hold feature
  const handleHold = useCallback(() => {
    if (!currentPiece || !canHold || gameState !== 'PLAYING') return;

    const currentType = currentPiece.type;
    sound.rotate();

    if (holdPieceType === null) {
      setHoldPieceType(currentType);
      spawnPiece();
    } else {
      setHoldPieceType(currentType);
      const def = TETROMINOES[holdPieceType];
      const startX = Math.floor(COLS / 2) - Math.floor(def.shape[0].length / 2);
      setCurrentPiece({
        type: holdPieceType,
        shape: def.shape,
        color: def.color,
        x: startX,
        y: 0
      });
    }
    setCanHold(false);
  }, [currentPiece, canHold, gameState, holdPieceType, spawnPiece]);

  // Reset / Start
  const resetGame = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setLines(0);
    setLevel(1);
    setHoldPieceType(null);
    setCanHold(true);
    setNextPieceType(getRandomPieceType());
    setGameState('PLAYING');
    sound.tick();
  };

  // Trigger initial piece spawn on state switch to PLAYING
  useEffect(() => {
    if (gameState === 'PLAYING' && !currentPiece) {
      const firstType = getRandomPieceType();
      const def = TETROMINOES[firstType];
      const startX = Math.floor(COLS / 2) - Math.floor(def.shape[0].length / 2);
      setCurrentPiece({
        type: firstType,
        shape: def.shape,
        color: def.color,
        x: startX,
        y: 0
      });
      setNextPieceType(getRandomPieceType());
    }
  }, [gameState, currentPiece]);

  // Drop timer based on level
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const speed = Math.max(120, 800 - (level - 1) * 70);
    const interval = setInterval(() => {
      handleDrop();
    }, speed);

    return () => clearInterval(interval);
  }, [gameState, level, handleDrop]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
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

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          handleMove(-1);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleMove(1);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          handleRotate();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          handleDrop();
          break;
        case ' ':
          handleHardDrop();
          break;
        case 'c':
        case 'C':
          handleHold();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleMove, handleRotate, handleDrop, handleHardDrop, handleHold]);

  // Compute ghost piece position
  const getGhostY = (): number => {
    if (!currentPiece) return 0;
    let ghostY = currentPiece.y;
    while (!checkCollision(currentPiece.shape, currentPiece.x, ghostY + 1, board)) {
      ghostY++;
    }
    return ghostY;
  };

  // Render main canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear board
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid lines
    ctx.strokeStyle = '#101726';
    ctx.lineWidth = 1;
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * BLOCK_SIZE, 0);
      ctx.lineTo(c * BLOCK_SIZE, canvas.height);
      ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * BLOCK_SIZE);
      ctx.lineTo(canvas.width, r * BLOCK_SIZE);
      ctx.stroke();
    }

    // Render placed blocks
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const color = board[r][c];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(c * BLOCK_SIZE + 1, r * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
          // Highlight edge
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect(c * BLOCK_SIZE + 1, r * BLOCK_SIZE + 1, BLOCK_SIZE - 2, 3);
        }
      }
    }

    if (currentPiece) {
      const ghostY = getGhostY();

      // Render Ghost piece
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c] !== 0) {
            const bx = (currentPiece.x + c) * BLOCK_SIZE;
            const by = (ghostY + r) * BLOCK_SIZE;
            ctx.fillRect(bx + 1, by + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
            ctx.strokeRect(bx + 1, by + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
          }
        }
      }

      // Render Active piece
      ctx.fillStyle = currentPiece.color;
      ctx.shadowColor = currentPiece.color;
      ctx.shadowBlur = 6;
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c] !== 0) {
            const bx = (currentPiece.x + c) * BLOCK_SIZE;
            const by = (currentPiece.y + r) * BLOCK_SIZE;
            ctx.fillRect(bx + 1, by + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(bx + 1, by + 1, BLOCK_SIZE - 2, 3);
            ctx.fillStyle = currentPiece.color;
          }
        }
      }
      ctx.shadowBlur = 0;
    }
  }, [board, currentPiece]);

  // Mini preview renderer helper
  const drawMiniPiece = (
    canvas: HTMLCanvasElement | null,
    type: TetrominoType | null
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!type) return;
    const def = TETROMINOES[type];
    const miniSize = 14;
    const shape = def.shape;
    const startX = (canvas.width - shape[0].length * miniSize) / 2;
    const startY = (canvas.height - shape.length * miniSize) / 2;

    ctx.fillStyle = def.color;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          ctx.fillRect(
            startX + c * miniSize + 1,
            startY + r * miniSize + 1,
            miniSize - 2,
            miniSize - 2
          );
        }
      }
    }
  };

  useEffect(() => {
    drawMiniPiece(nextCanvasRef.current, nextPieceType);
  }, [nextPieceType]);

  useEffect(() => {
    drawMiniPiece(holdCanvasRef.current, holdPieceType);
  }, [holdPieceType]);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
      {/* Top HUD */}
      <div className="flex items-center justify-between w-full max-w-[400px] mb-3 font-arcade">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-sans tracking-wide">SCORE</span>
            <span className="text-xl font-bold text-amber-400 font-pixel">{score}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-sans tracking-wide">LEVEL</span>
            <span className="text-xl font-bold text-cyan-400 font-pixel">{level}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-[11px] text-slate-400 font-sans tracking-wide flex items-center justify-end gap-1">
              <Trophy className="w-3 h-3 text-amber-400 inline" /> BEST
            </span>
            <span className="text-sm font-bold text-amber-300 font-pixel">{highScore}</span>
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

      {/* Main Game Stage Area with Side Panels */}
      <div className="flex items-start justify-center gap-4 w-full max-w-[440px]">
        {/* Left Side: Hold Box */}
        <div className="flex flex-col items-center gap-2">
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold mb-1">HOLD</span>
            <canvas ref={holdCanvasRef} width={64} height={64} className="rounded bg-slate-950 border border-slate-800" />
            <button
              type="button"
              onClick={handleHold}
              disabled={!canHold || gameState !== 'PLAYING'}
              className="mt-2 px-2.5 py-1 text-[10px] font-mono font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 border border-slate-700 rounded transition-colors"
            >
              [C] HOLD
            </button>
          </div>

          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-center w-full">
            <span className="text-[10px] text-slate-400 font-mono block">LINES</span>
            <span className="text-base font-bold font-pixel text-emerald-400">{lines}</span>
          </div>
        </div>

        {/* Center: Main Tetris Matrix */}
        <div className="relative border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-black crt-screen arcade-glow-amber">
          <canvas
            ref={canvasRef}
            width={COLS * BLOCK_SIZE}
            height={ROWS * BLOCK_SIZE}
            className="block"
          />

          {/* Overlays */}
          {gameState === 'IDLE' && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-30">
              <h2 className="text-xl font-bold text-amber-400 font-pixel mb-2">TETRIS STACK</h2>
              <p className="text-xs text-slate-300 max-w-[180px] mb-5 font-sans">
                Rotate, align, and drop tetromino blocks to clear lines!
              </p>
              <button
                type="button"
                onClick={resetGame}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-arcade tracking-wider rounded-lg shadow-lg active:scale-95 transition-transform flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> PLAY NOW
              </button>
              <div className="mt-4 text-[10px] text-slate-400 font-mono">
                ↑ Rotate · Space Hard Drop
              </div>
            </div>
          )}

          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-30">
              <h2 className="text-lg font-bold text-amber-400 font-pixel mb-4">PAUSED</h2>
              <button
                type="button"
                onClick={() => setGameState('PLAYING')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-xs flex items-center gap-2 mb-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> RESUME
              </button>
              <button
                type="button"
                onClick={resetGame}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700"
              >
                RESTART
              </button>
            </div>
          )}

          {gameState === 'GAME_OVER' && (
            <div className="absolute inset-0 bg-red-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-30 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-red-400 font-pixel mb-2">MATRIX FULL</h2>
              <div className="my-2 space-y-1">
                <p className="text-[10px] text-slate-400 font-sans">FINAL SCORE</p>
                <p className="text-2xl font-bold text-white font-pixel">{score}</p>
                <p className="text-xs text-emerald-400 font-mono">LINES: {lines}</p>
              </div>
              <button
                type="button"
                onClick={resetGame}
                className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-bold font-arcade tracking-wider rounded-lg shadow-lg active:scale-95 transition-transform flex items-center gap-1.5 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" /> TRY AGAIN
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Next Piece */}
        <div className="flex flex-col items-center gap-2">
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold mb-1">NEXT</span>
            <canvas ref={nextCanvasRef} width={64} height={64} className="rounded bg-slate-950 border border-slate-800" />
          </div>

          <button
            type="button"
            onClick={handleHardDrop}
            disabled={gameState !== 'PLAYING'}
            className="w-full py-2 text-[10px] font-mono font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg active:scale-95 transition-transform"
          >
            HARD DROP
          </button>
        </div>
      </div>

      {/* Mobile Touch Controller */}
      <div className="w-full max-w-[400px] mt-4">
        <TouchControls
          onUp={handleRotate}
          onDown={handleDrop}
          onLeft={() => handleMove(-1)}
          onRight={() => handleMove(1)}
          onActionA={handleRotate}
          onActionB={handleHardDrop}
          actionALabel="ROTATE"
          actionBLabel="DROP"
        />
      </div>
    </div>
  );
};
