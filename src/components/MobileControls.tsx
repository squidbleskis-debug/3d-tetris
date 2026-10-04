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

function TouchButton({
  onPress,
  children,
  className = '',
}: {
  onPress: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onTouchStart={(e) => {
        e.preventDefault();
        onPress();
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      className={`w-12 h-12 rounded-lg flex items-center justify-center active:scale-95 transition-transform select-none ${className}`}
    >
      {children}
    </button>
  );
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
          <TouchButton
            onPress={onMoveForward}
            className="bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-lg"
          >
            ↑
          </TouchButton>
          <div></div>
          <TouchButton
            onPress={onMoveLeft}
            className="bg-white/10 border border-white/20 text-white text-lg"
          >
            ←
          </TouchButton>
          <TouchButton
            onPress={onMoveBackward}
            className="bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-lg"
          >
            ↓
          </TouchButton>
          <TouchButton
            onPress={onMoveRight}
            className="bg-white/10 border border-white/20 text-white text-lg"
          >
            →
          </TouchButton>
        </div>

        {/* Center - Vertical movement */}
        <div className="flex flex-col gap-1 items-center">
          <TouchButton
            onPress={onMoveUp}
            className="bg-green-500/20 border border-green-400/30 text-green-300 text-xs"
          >
            ▲
          </TouchButton>
          <TouchButton
            onPress={onMoveDown}
            className="bg-green-500/20 border border-green-400/30 text-green-300 text-xs"
          >
            ▼
          </TouchButton>
        </div>

        {/* Right side - Rotation & Drop */}
        <div className="flex flex-col gap-1 items-center">
          <TouchButton
            onPress={onRotateY}
            className="bg-purple-500/20 border border-purple-400/30 text-purple-300 text-[10px]"
          >
            ROT-Y
          </TouchButton>
          <TouchButton
            onPress={onRotateX}
            className="bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px]"
          >
            ROT-X
          </TouchButton>
          <TouchButton
            onPress={onRotateZ}
            className="bg-teal-500/20 border border-teal-400/30 text-teal-300 text-[10px]"
          >
            ROT-Z
          </TouchButton>
          <TouchButton
            onPress={onHardDrop}
            className="bg-red-500/30 border border-red-400/30 text-red-300 text-[10px] font-bold"
          >
            DROP
          </TouchButton>
        </div>
      </div>
    </div>
  );
}
