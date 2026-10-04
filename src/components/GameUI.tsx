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
      {/* Score panel - right side */}
      <div className="absolute top-14 right-4 pointer-events-auto">
        <div className="space-y-2">
          <div className="bg-black/50 backdrop-blur-md rounded-xl p-3 border border-cyan-500/20 min-w-[100px]">
            <div className="text-cyan-400/70 text-[10px] uppercase tracking-wider">Score</div>
            <div className="text-white text-lg font-bold font-mono">{score.toLocaleString()}</div>
          </div>
          <div className="bg-black/50 backdrop-blur-md rounded-xl p-3 border border-purple-500/20 min-w-[100px]">
            <div className="text-purple-400/70 text-[10px] uppercase tracking-wider">Level</div>
            <div className="text-white text-lg font-bold font-mono">{level}</div>
          </div>
          <div className="bg-black/50 backdrop-blur-md rounded-xl p-3 border border-green-500/20 min-w-[100px]">
            <div className="text-green-400/70 text-[10px] uppercase tracking-wider">Lines</div>
            <div className="text-white text-lg font-bold font-mono">{lines}</div>
          </div>
        </div>
      </div>

      {/* Center overlay for game states */}
      {(gameOver || isPaused) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center max-w-sm mx-4">
            {gameOver ? (
              <>
                <div className="text-5xl mb-3">💀</div>
                <h2 className="text-3xl font-bold text-red-400 mb-2">Game Over</h2>
                <div className="space-y-1 mb-4">
                  <p className="text-gray-300">Счёт: <span className="text-white font-bold">{score.toLocaleString()}</span></p>
                  <p className="text-gray-400 text-sm">Уровень {level} • {lines} линий</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onRestart}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-white font-bold hover:scale-105 transition-transform"
                  >
                    🔄 Заново
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-5xl mb-3">⏸️</div>
                <h2 className="text-3xl font-bold text-yellow-400 mb-4">Пауза</h2>
                <button
                  onClick={onPause}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg text-white font-bold hover:scale-105 transition-transform"
                >
                  ▶ Продолжить
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Start screen - only show when game hasn't started yet */}
      {score === 0 && lines === 0 && !gameOver && !isPaused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <div className="bg-black/70 backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center max-w-md mx-4">
            <div className="text-5xl mb-3">🎮</div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Готов играть?
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Управляй фигурами в трёх измерениях!
            </p>
            <div className="grid grid-cols-2 gap-2 text-left text-gray-400 text-xs mb-5">
              <div className="bg-white/5 rounded-lg p-2">
                <span className="text-cyan-400">←→↑↓</span> Движение
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <span className="text-cyan-400">Q/E</span> Глубина
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <span className="text-cyan-400">A/D</span> Вращение Y
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <span className="text-cyan-400">W/S</span> Вращение X
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <span className="text-cyan-400">R/F</span> Вращение Z
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <span className="text-cyan-400">Space</span> Дроп
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <span className="text-cyan-400">Tab</span> VK Play
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <span className="text-cyan-400">P</span> Пауза
              </div>
            </div>
            <button
              onClick={onStart}
              className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-cyan-500/30"
            >
              🚀 Начать игру
            </button>
          </div>
        </div>
      )}

      {/* Bottom hint */}
      <div className="mt-auto p-3 flex justify-center">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/5">
          <p className="text-gray-600 text-[10px]">
            🖱️ Вращай камеру • ←→↑↓ движение • Q/E глубина • Space дроп • Tab VK Play
          </p>
        </div>
      </div>
    </div>
  );
}
