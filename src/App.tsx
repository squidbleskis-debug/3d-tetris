import React, { useState, useEffect, useCallback, useRef } from 'react';
import TetrisScene from './components/TetrisScene';
import GameUI from './components/GameUI';
import MobileControls from './components/MobileControls';
import VKAuthScreen from './components/VKAuthScreen';
import VKPlayPanel from './components/VKPlayPanel';
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
import { vkPlaySDK, VKUser } from './services/vkplay';

function App() {
  const [vkUser, setVkUser] = useState<VKUser | null>(null);
  const [showAuth, setShowAuth] = useState(true);
  const [showVKPanel, setShowVKPanel] = useState(false);

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
  const [timePlayed, setTimePlayed] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);

  const dropTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const boardRef = useRef(board);
  const currentPieceRef = useRef(currentPiece);
  const gameOverRef = useRef(gameOver);
  const isPausedRef = useRef(isPaused);
  const timeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  boardRef.current = board;
  currentPieceRef.current = currentPiece;
  gameOverRef.current = gameOver;
  isPausedRef.current = isPaused;

  // Timer for time played
  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      timeRef.current = setInterval(() => {
        setTimePlayed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timeRef.current) clearInterval(timeRef.current);
    };
  }, [gameStarted, gameOver, isPaused]);

  // Check achievements
  useEffect(() => {
    if (vkUser && gameStarted) {
      const achievements = vkPlaySDK.updateAchievements(score, level, lines, timePlayed);
      const justUnlocked = achievements.find(a => a.unlocked && a.progress === a.maxProgress);
      if (justUnlocked && !newAchievement) {
        setNewAchievement(justUnlocked.title);
        setTimeout(() => setNewAchievement(null), 3000);
      }
    }
  }, [score, level, lines, timePlayed, vkUser]);

  // Submit score on game over
  useEffect(() => {
    if (gameOver && score > 0 && vkUser) {
      vkPlaySDK.submitScore(score, level, lines);
    }
  }, [gameOver]);

  const updateGhostPiece = useCallback((piece: Tetromino, currentBoard: Cell[][][]) => {
    let ghost = { ...piece, position: { ...piece.position } };
    while (!checkCollision(currentBoard, ghost, { x: 0, y: 1, z: 0 })) {
      ghost = { ...ghost, position: { ...ghost.position, y: ghost.position.y + 1 } };
    }
    setGhostPiece(ghost);
  }, []);

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
    setTimePlayed(0);
    setCombo(0);
    updateGhostPiece(piece, newBoard);
  }, [updateGhostPiece]);

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

  const lockPiece = useCallback(() => {
    if (!currentPieceRef.current) return;

    const newBoard = placeTetromino(boardRef.current, currentPieceRef.current);
    const { newBoard: clearedBoard, linesCleared } = clearLayers(newBoard);

    setBoard(clearedBoard);
    if (linesCleared > 0) {
      setCombo(prev => prev + 1);
      setShowCombo(true);
      setTimeout(() => setShowCombo(false), 1500);
      setLines(prev => {
        const newLines = prev + linesCleared;
        setLevel(Math.floor(newLines / 5));
        return newLines;
      });
      setScore(prev => prev + calculateScore(linesCleared, level) * (combo > 0 ? 1 + combo * 0.5 : 1));
    } else {
      setCombo(0);
    }

    setCurrentPiece(null);
    setGhostPiece(null);

    setTimeout(() => {
      if (!gameOverRef.current) {
        spawnPiece();
      }
    }, 100);
  }, [level, spawnPiece, combo]);

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

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    let piece = { ...currentPiece, position: { ...currentPiece.position } };
    while (!checkCollision(board, piece, { x: 0, y: 1, z: 0 })) {
      piece = { ...piece, position: { ...piece.position, y: piece.position.y + 1 } };
    }
    setCurrentPiece(piece);
    currentPieceRef.current = piece;

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
      if (e.key === 'Tab') {
        e.preventDefault();
        setShowVKPanel(prev => !prev);
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
        case 'q': case 'Q':
          offset = { x: 0, y: 0, z: -1 };
          break;
        case 'e': case 'E':
          offset = { x: 0, y: 0, z: 1 };
          break;
        case 'a': case 'A':
          newPiece = rotateTetromino(piece, 'y');
          if (!checkCollision(board, newPiece)) {
            setCurrentPiece(newPiece);
            updateGhostPiece(newPiece, board);
          }
          return;
        case 'd': case 'D':
          newPiece = rotateTetromino(piece, 'y');
          if (!checkCollision(board, newPiece)) {
            setCurrentPiece(newPiece);
            updateGhostPiece(newPiece, board);
          }
          return;
        case 'w': case 'W':
          newPiece = rotateTetromino(piece, 'x');
          if (!checkCollision(board, newPiece)) {
            setCurrentPiece(newPiece);
            updateGhostPiece(newPiece, board);
          }
          return;
        case 's': case 'S':
          newPiece = rotateTetromino(piece, 'x');
          if (!checkCollision(board, newPiece)) {
            setCurrentPiece(newPiece);
            updateGhostPiece(newPiece, board);
          }
          return;
        case 'r': case 'R':
          newPiece = rotateTetromino(piece, 'z');
          if (!checkCollision(board, newPiece)) {
            setCurrentPiece(newPiece);
            updateGhostPiece(newPiece, board);
          }
          return;
        case 'f': case 'F':
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

  // Auth screen
  if (showAuth) {
    return (
      <VKAuthScreen
        onAuth={(user) => {
          setVkUser(user);
          setShowAuth(false);
        }}
        onSkip={() => {
          setShowAuth(false);
        }}
      />
    );
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-black overflow-hidden relative">
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <TetrisScene board={board} currentPiece={currentPiece} ghostPiece={ghostPiece} />
      </div>

      {/* VK Play Top Bar */}
      {gameStarted && (
        <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
          <div className="flex items-center justify-between p-2 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => setShowVKPanel(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
                  <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.598-.189 1.367 1.258 2.182 1.814.617.42 1.085.328 1.085.328l2.18-.03s1.14-.071.6-.972c-.045-.074-.318-.668-1.635-1.886-1.378-1.276-1.194-1.07.467-3.278.842-1.12 1.333-1.98 1.245-2.296-.075-.273-.872-.203-.872-.203l-2.45.015s-.182-.025-.317.056c-.131.079-.216.263-.216.263s-.387 1.03-.903 1.906c-1.089 1.848-1.524 1.946-1.702 1.832-.414-.265-.31-1.065-.31-1.634 0-1.776.27-2.517-.525-2.708-.264-.063-.458-.105-1.133-.112-.865-.009-1.596.003-2.01.205-.276.135-.488.434-.36.451.16.021.522.098.714.359.248.338.24 1.097.24 1.097s.143 2.09-.333 2.349c-.327.178-.775-.185-1.737-1.846-.493-.85-.864-1.79-.864-1.79s-.072-.176-.2-.271c-.155-.115-.372-.151-.372-.151l-2.327.015s-.349.01-.477.162c-.114.135-.009.414-.009.414s1.817 4.255 3.873 6.396c1.886 1.963 4.028 1.834 4.028 1.834h.971z"/>
                </svg>
                <span className="text-blue-300 text-xs font-medium">VK Play</span>
              </button>
              {vkUser && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg">
                  <span className="text-sm">{vkUser.avatar}</span>
                  <span className="text-gray-300 text-xs">{vkUser.firstName}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="px-2 py-1 bg-white/5 rounded text-gray-400 text-xs">
                ⏱ {Math.floor(timePlayed / 60)}:{(timePlayed % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Combo notification */}
      {showCombo && combo > 1 && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <div className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-2xl shadow-orange-500/50">
            <span className="text-white font-bold text-xl">COMBO x{combo}! 🔥</span>
          </div>
        </div>
      )}

      {/* New achievement notification */}
      {newAchievement && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 animate-pulse">
          <div className="px-6 py-3 bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-sm rounded-xl shadow-2xl shadow-yellow-500/30 border border-yellow-400/30">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <div>
                <div className="text-yellow-200 text-xs uppercase tracking-wider">Новое достижение!</div>
                <div className="text-white font-bold">{newAchievement}</div>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* VK Play Panel */}
      <VKPlayPanel
        user={vkUser}
        currentScore={score}
        currentLevel={level}
        currentLines={lines}
        timePlayed={timePlayed}
        isOpen={showVKPanel}
        onClose={() => setShowVKPanel(false)}
      />
    </div>
  );
}

export default App;
