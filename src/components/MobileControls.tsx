import React from 'react';

interface MobileControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveForward: () => void;
  onMoveBackward: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRotateY: () => void;
  onRotateX: () => void;
  onRotateZ: () => void;
  onHardDrop: () => void;
}

export default function MobileControls({
  onMoveLeft,
  onMoveRight,
  onMoveForward,
  onMoveBackward,
  onMoveUp,
  onMoveDown,
  onRotateY,
  onRotateX,
  onRotateZ,
  onHardDrop,
}: MobileControlsProps) {
  return (
    <div className="absolute bottom-4 left-0 right-0 pointer-events-auto md:hidden">
      <div className="flex justify-between items-end px-4">
        {/* Left side - Movement */}
        <div className="grid grid-cols-3 gap-1">
          <div></div>
          <button
            onTouchStart={onMoveUp}
            className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center text-white text-lg active:bg-white/30 border border-white/20"
          >
            ↑
          </button>
          <div></div>
          <button
            onTouchStart={onMoveLeft}
            className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center text-white text-lg active:bg-white/30 border border-white/20"
          >
            ←
          </button>
          <button
            onTouchStart={onMoveDown}
            className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center text-white text-lg active:bg-white/30 border border-white/20"
          >
            ↓
          </button>
          <button
            onTouchStart={onMoveRight}
            className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center text-white text-lg active:bg-white/30 border border-white/20"
          >
            →
          </button>
        </div>

        {/* Center - Depth movement */}
        <div className="flex flex-col gap-1 items-center">
          <button
            onTouchStart={onMoveForward}
            className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-purple-300 text-xs active:bg-purple-500/40 border border-purple-400/30"
          >
            FWD
          </button>
          <button
            onTouchStart={onMoveBackward}
            className="w-12 h-12 bg-purple-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-purple-300 text-xs active:bg-purple-500/40 border border-purple-400/30"
          >
            BWD
          </button>
        </div>

        {/* Right side - Rotation & Drop */}
        <div className="flex flex-col gap-1 items-center">
          <button
            onTouchStart={onRotateY}
            className="w-12 h-12 bg-cyan-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-cyan-300 text-xs active:bg-cyan-500/40 border border-cyan-400/30"
          >
            ROT-Y
          </button>
          <button
            onTouchStart={onRotateX}
            className="w-12 h-12 bg-green-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-green-300 text-xs active:bg-green-500/40 border border-green-400/30"
          >
            ROT-X
          </button>
          <button
            onTouchStart={onHardDrop}
            className="w-12 h-12 bg-red-500/30 backdrop-blur-sm rounded-lg flex items-center justify-center text-red-300 text-xs active:bg-red-500/50 border border-red-400/30 font-bold"
          >
            DROP
          </button>
        </div>
      </div>
    </div>
  );
}
