import React, { useState, useEffect, useCallback, useRef } from 'react';
import TetrisScene from './components/TetrisScene';
import GameUI from './components/GameUI';
import MobileControls from './components/MobileControls';
import {
  Cell,
  Tetromino,
  createEmptyBoard,
  createRandomTetromino,
  checkCollision,
  placeTetromino,
  clearLayers,
  rotateTetromino,
  calculateScore,
  getDropSpeed,
} from './game/tetris';

function App() {
  const [board, setBoard] = useState<Cell[][][]>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [ghostPiece, setGhostPiece] = useState<Tetromino | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [nextPiece, setNextPiece] = useState<Tetromino | null>(null);

  const dropTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const boardRef = useRef(board);
  const currentPieceRef = useRef(currentPiece);
  const gameOverRef = useRef(gameOver);
  const isPausedRef = useRef(isPaused);

  boardRef.current = board;
  currentPieceRef.current = currentPiece;
  gameOverRef.current = gameOver;
  isPausedRef.current = isPaused;

  // Calculate ghost piece position
  const updateGhostPiece = useCallback((piece: Tetromino, currentBoard: Cell[][][]) => {
    let ghost = { ...piece, position: { ...piece.position } };
    while (!checkCollision(currentBoard, ghost, { x: 0, y: 1, z: 0 })) {
      ghost = { ...ghost, position: { ...ghost.position, y: ghost.position.y + 1 } };
    }
    setGhostPiece(ghost);
  }, []);

  // Start new game
  const startGame = useCallback(() => {
    const newBoard = createEmptyBoard();
    const piece = createRandomTetromino();
    const next = createRandomTetromino();
    setBoard(newBoard);
    setCurrentPiece(piece);
    setNextPiece(next);
    setScore(0);
    setLevel(0);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
    setGameStarted(true);
    updateGhostPiece(piece, newBoard);
  }, [updateGhostPiece]);

  // Spawn new piece
  const spawnPiece = useCallback(() => {
    const piece = nextPiece || createRandomTetromino();
    const next = createRandomTetromino();

    if (checkCollision(boardRef.current, piece)) {
      setGameOver(true);
      setCurrentPiece(null);
      setGhostPiece(null);
      return;
    }

    setCurrentPiece(piece);
    setNextPiece(next);
    updateGhostPiece(piece, boardRef.current);
  }, [nextPiece, updateGhostPiece]);

  // Lock piece and clear lines
  const lockPiece = useCallback(() => {
    if (!currentPieceRef.current) return;

    const newBoard = placeTetromino(boardRef.current, currentPieceRef.current);
    const { newBoard: clearedBoard, linesCleared } = clearLayers(newBoard);

    setBoard(clearedBoard);
    if (linesCleared > 0) {
      setLines(prev => {
        const newLines = prev + linesCleared;
        setLevel(Math.floor(newLines / 5));
        return newLines;
      });
      setScore(prev => prev + calculateScore(linesCleared, level));
    }

    setCurrentPiece(null);
    setGhostPiece(null);

    // Spawn next piece after a short delay
    setTimeout(() => {
      if (!gameOverRef.current) {
        spawnPiece();
      }
    }, 100);
  }, [level, spawnPiece]);

  // Move piece down
  const moveDown = useCallback(() => {
    if (!currentPieceRef.current || gameOverRef.current || isPausedRef.current) return;

    if (!checkCollision(boardRef.current, currentPieceRef.current, { x: 0, y: 1, z: 0 })) {
      const newPiece = {
        ...currentPieceRef.current,
        position: { ...currentPieceRef.current.position, y: currentPieceRef.current.position.y + 1 },
      };
      setCurrentPiece(newPiece);
      updateGhostPiece(newPiece, boardRef.current);
    } else {
      lockPiece();
    }
  }, [lockPiece, updateGhostPiece]);

  // Drop timer
  useEffect(() => {
    if (dropTimerRef.current) {
      clearInterval(dropTimerRef.current);
    }

    if (gameStarted && !gameOver && !isPaused && currentPiece) {
      const speed = getDropSpeed(level);
      dropTimerRef.current = setInterval(moveDown, speed);
    }

    return () => {
      if (dropTimerRef.current) {
        clearInterval(dropTimerRef.current);
      }
    };
  }, [gameStarted, gameOver, isPaused, level, currentPiece, moveDown]);

  // Hard drop
  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    let piece = { ...currentPiece, position: { ...currentPiece.position } };
    while (!checkCollision(board, piece, { x: 0, y: 1, z: 0 })) {
      piece = { ...piece, position: { ...piece.position, y: piece.position.y + 1 } };
    }
    setCurrentPiece(piece);
    currentPieceRef.current = piece;

    // Lock immediately
    const newBoard = placeTetromino(board, piece);
    const { newBoard: clearedBoard, linesCleared } = clearLayers(newBoard);
    setBoard(clearedBoard);
    if (linesCleared > 0) {
      setLines(prev => {
        const newLines = prev + linesCleared;
        setLevel(Math.floor(newLines / 5));
        return newLines;
      });
      setScore(prev => prev + calculateScore(linesCleared, level));
    }
    setCurrentPiece(null);
    setGhostPiece(null);
    setTimeout(() => {
      if (!gameOverRef.current) spawnPiece();
    }, 100);
  }, [currentPiece, board, gameOver, isPaused, level, spawnPiece]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentPiece || gameOver || !gameStarted) return;

      if (e.key === 'p' || e.key === 'P') {
        setIsPaused(prev => !prev);
        return;
      }

      if (isPaused) return;

      const piece = currentPieceRef.current;
      if (!piece) return;

      let newPiece: Tetromino;
      let offset = { x: 0, y: 0, z: 0 };

      switch (e.key) {
        case 'ArrowLeft':
          offset = { x: -1, y: 0, z: 0 };
          break;
        case 'ArrowRight':
          offset = { x: 1, y: 0, z: 0 };
          break;
        case 'ArrowUp':
          offset = { x: 0, y: 0, z: -1 };
          break;
        case 'ArrowDown':
          offset = { x: 0, y: 0, z: 1 };
          break;
        case 'q':
        case 'Q':
          offset = { x: 0, y: 0, z: -1 };
          break;
        case 'e':
        case 'E':
          offset = { x: 0, y: 0, z: 1 };
          break;
        case 'a':
        case 'A':
          newPiece = rotateTetromino(piece, 'y');
          if (!checkCollision(board, newPiece)) {
            setCurrentPiece(newPiece);
            updateGhostPiece(newPiece, board);
          }
          return;
        case 'd':
        case 'D':
          newPiece = rotateTetromino(piece, 'y');
          if (!checkCollision(board, newPiece)) {
            setCurrentPiece(newPiece);
            updateGhostPiece(newPiece, board);
          }
          return;
        case 'w':
        case 'W':
          newPiece = rotateTetromino(piece, 'x');
          if (!checkCollision(board, newPiece)) {
            setCurrentPiece(newPiece);
            updateGhostPiece(newPiece, board);
          }
          return;
        case 's':
        case 'S':
          newPiece = rotateTetromino(piece, 'x');
          if (!checkCollision(board, newPiece)) {
            setCurrentPiece(newPiece);
            updateGhostPiece(newPiece, board);
          }
          return;
        case 'r':
        case 'R':
          newPiece = rotateTetromino(piece, 'z');
          if (!checkCollision(board, newPiece)) {
            setCurrentPiece(newPiece);
            updateGhostPiece(newPiece, board);
          }
          return;
        case 'f':
        case 'F':
          newPiece = rotateTetromino(piece, 'z');
          if (!checkCollision(board, newPiece)) {
            setCurrentPiece(newPiece);
            updateGhostPiece(newPiece, board);
          }
          return;
        case ' ':
          e.preventDefault();
          hardDrop();
          return;
        default:
          return;
      }

      if (offset.x !== 0 || offset.y !== 0 || offset.z !== 0) {
        if (!checkCollision(board, piece, offset)) {
          newPiece = {
            ...piece,
            position: {
              x: piece.position.x + offset.x,
              y: piece.position.y + offset.y,
              z: piece.position.z + offset.z,
            },
          };
          setCurrentPiece(newPiece);
          updateGhostPiece(newPiece, board);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPiece, board, gameOver, gameStarted, isPaused, hardDrop, updateGhostPiece]);

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-black overflow-hidden relative">
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <TetrisScene board={board} currentPiece={currentPiece} ghostPiece={ghostPiece} />
      </div>

      {/* UI Overlay */}
      <GameUI
        score={score}
        level={level}
        lines={lines}
        nextPiece={nextPiece?.color || ''}
        gameOver={gameOver}
        isPaused={isPaused}
        onStart={startGame}
        onRestart={startGame}
        onPause={() => setIsPaused(prev => !prev)}
      />

      {/* Mobile Controls */}
      {gameStarted && !gameOver && (
        <MobileControls
          onMoveLeft={() => {
            if (!currentPieceRef.current || isPausedRef.current) return;
            if (!checkCollision(board, currentPieceRef.current, { x: -1, y: 0, z: 0 })) {
              const p = { ...currentPieceRef.current, position: { ...currentPieceRef.current.position, x: currentPieceRef.current.position.x - 1 } };
              setCurrentPiece(p);
              updateGhostPiece(p, board);
            }
          }}
          onMoveRight={() => {
            if (!currentPieceRef.current || isPausedRef.current) return;
            if (!checkCollision(board, currentPieceRef.current, { x: 1, y: 0, z: 0 })) {
              const p = { ...currentPieceRef.current, position: { ...currentPieceRef.current.position, x: currentPieceRef.current.position.x + 1 } };
              setCurrentPiece(p);
              updateGhostPiece(p, board);
            }
          }}
          onMoveForward={() => {
            if (!currentPieceRef.current || isPausedRef.current) return;
            if (!checkCollision(board, currentPieceRef.current, { x: 0, y: 0, z: -1 })) {
              const p = { ...currentPieceRef.current, position: { ...currentPieceRef.current.position, z: currentPieceRef.current.position.z - 1 } };
              setCurrentPiece(p);
              updateGhostPiece(p, board);
            }
          }}
          onMoveBackward={() => {
            if (!currentPieceRef.current || isPausedRef.current) return;
            if (!checkCollision(board, currentPieceRef.current, { x: 0, y: 0, z: 1 })) {
              const p = { ...currentPieceRef.current, position: { ...currentPieceRef.current.position, z: currentPieceRef.current.position.z + 1 } };
              setCurrentPiece(p);
              updateGhostPiece(p, board);
            }
          }}
          onMoveUp={() => moveDown()}
          onMoveDown={() => {
            if (!currentPieceRef.current || isPausedRef.current) return;
            if (!checkCollision(board, currentPieceRef.current, { x: 0, y: -1, z: 0 })) {
              const p = { ...currentPieceRef.current, position: { ...currentPieceRef.current.position, y: Math.max(0, currentPieceRef.current.position.y - 1) } };
              setCurrentPiece(p);
              updateGhostPiece(p, board);
            }
          }}
          onRotateY={() => {
            if (!currentPieceRef.current || isPausedRef.current) return;
            const rotated = rotateTetromino(currentPieceRef.current, 'y');
            if (!checkCollision(board, rotated)) {
              setCurrentPiece(rotated);
              updateGhostPiece(rotated, board);
            }
          }}
          onRotateX={() => {
            if (!currentPieceRef.current || isPausedRef.current) return;
            const rotated = rotateTetromino(currentPieceRef.current, 'x');
            if (!checkCollision(board, rotated)) {
              setCurrentPiece(rotated);
              updateGhostPiece(rotated, board);
            }
          }}
          onRotateZ={() => {
            if (!currentPieceRef.current || isPausedRef.current) return;
            const rotated = rotateTetromino(currentPieceRef.current, 'z');
            if (!checkCollision(board, rotated)) {
              setCurrentPiece(rotated);
              updateGhostPiece(rotated, board);
            }
          }}
          onHardDrop={hardDrop}
        />
      )}
    </div>
  );
}

export default App;
