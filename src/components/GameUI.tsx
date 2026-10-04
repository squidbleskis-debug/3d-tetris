import React from 'react';

interface GameUIProps {
  score: number;
  level: number;
  lines: number;
  nextPiece: string;
  gameOver: boolean;
  isPaused: boolean;
  onStart: () => void;
  onRestart: () => void;
  onPause: () => void;
}

export default function GameUI({
  score,
  level,
  lines,
  gameOver,
  isPaused,
  onStart,
  onRestart,
  onPause,
}: GameUIProps) {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col">
      {/* Top bar */}
      <div className="flex justify-between items-start p-4 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-cyan-500/30">
          <div className="text-cyan-400 text-xs uppercase tracking-wider mb-1">Score</div>
          <div className="text-white text-2xl font-bold font-mono">{score.toLocaleString()}</div>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-purple-500/30">
            <div className="text-purple-400 text-xs uppercase tracking-wider mb-1">Level</div>
            <div className="text-white text-2xl font-bold font-mono">{level}</div>
          </div>
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-green-500/30">
            <div className="text-green-400 text-xs uppercase tracking-wider mb-1">Lines</div>
            <div className="text-white text-2xl font-bold font-mono">{lines}</div>
          </div>
        </div>
      </div>

      {/* Center overlay for game states */}
      {(gameOver || isPaused) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
            {gameOver ? (
              <>
                <h2 className="text-4xl font-bold text-red-400 mb-2">Game Over</h2>
                <p className="text-gray-300 mb-4">Final Score: {score.toLocaleString()}</p>
                <button
                  onClick={onRestart}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-white font-bold hover:scale-105 transition-transform"
                >
                  Play Again
                </button>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold text-yellow-400 mb-4">Paused</h2>
                <button
                  onClick={onPause}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg text-white font-bold hover:scale-105 transition-transform"
                >
                  Resume
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Start screen */}
      {score === 0 && lines === 0 && !gameOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center max-w-md">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              3D TETRIS
            </h1>
            <p className="text-gray-300 mb-6 text-sm">
              A three-dimensional twist on the classic game!
            </p>
            <div className="text-left text-gray-400 text-xs mb-6 space-y-1">
              <p><span className="text-cyan-400">←→↑↓</span> — Move piece</p>
              <p><span className="text-cyan-400">Q/E</span> — Move forward/backward</p>
              <p><span className="text-cyan-400">A/D</span> — Rotate Y axis</p>
              <p><span className="text-cyan-400">W/S</span> — Rotate X axis</p>
              <p><span className="text-cyan-400">R/F</span> — Rotate Z axis</p>
              <p><span className="text-cyan-400">Space</span> — Hard drop</p>
              <p><span className="text-cyan-400">P</span> — Pause</p>
              <p><span className="text-cyan-400">Mouse</span> — Rotate camera</p>
            </div>
            <button
              onClick={onStart}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-cyan-500/30"
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {/* Bottom controls hint */}
      <div className="mt-auto p-4 flex justify-center">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
          <p className="text-gray-500 text-xs">
            🖱️ Drag to rotate camera • Arrow keys to move • Space to drop
          </p>
        </div>
      </div>

      {/* Pause button */}
      {!gameOver && score > 0 && (
        <button
          onClick={onPause}
          className="absolute top-4 right-4 pointer-events-auto bg-black/60 backdrop-blur-md rounded-lg p-2 border border-white/20 text-white hover:bg-white/10 transition-colors"
        >
          {isPaused ? '▶' : '⏸'}
        </button>
      )}
    </div>
  );
}
