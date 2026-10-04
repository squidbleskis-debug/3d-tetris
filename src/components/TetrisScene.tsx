import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BOARD_DEPTH,
  Cell,
  Tetromino,
} from '../game/tetris';
import BackgroundParticles from './BackgroundParticles';

interface BlockProps {
  position: [number, number, number];
  color: string;
  opacity?: number;
}

function Block({ position, color, opacity = 1 }: BlockProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.95, 0.95, 0.95]} />
      <meshStandardMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}

interface BoardProps {
  board: Cell[][][];
  currentPiece: Tetromino | null;
  ghostPiece: Tetromino | null;
}

function GameBoard({ board, currentPiece, ghostPiece }: BoardProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle idle rotation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  const blocks: JSX.Element[] = [];

  // Render placed blocks
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      for (let z = 0; z < BOARD_DEPTH; z++) {
        if (board[y][x][z].filled) {
          blocks.push(
            <Block
              key={`board-${y}-${x}-${z}`}
              position={[
                x - BOARD_WIDTH / 2 + 0.5,
                BOARD_HEIGHT - y - 0.5,
                z - BOARD_DEPTH / 2 + 0.5,
              ]}
              color={board[y][x][z].color}
            />
          );
        }
      }
    }
  }

  // Render ghost piece
  if (ghostPiece) {
    for (let ly = 0; ly < ghostPiece.shape.length; ly++) {
      for (let lx = 0; lx < ghostPiece.shape[ly].length; lx++) {
        for (let lz = 0; lz < ghostPiece.shape[ly][lx].length; lz++) {
          if (ghostPiece.shape[ly][lx][lz]) {
            const x = ghostPiece.position.x + lx;
            const y = ghostPiece.position.y + ly;
            const z = ghostPiece.position.z + lz;
            blocks.push(
              <Block
                key={`ghost-${ly}-${lx}-${lz}`}
                position={[
                  x - BOARD_WIDTH / 2 + 0.5,
                  BOARD_HEIGHT - y - 0.5,
                  z - BOARD_DEPTH / 2 + 0.5,
                ]}
                color={ghostPiece.color}
                opacity={0.2}
              />
            );
          }
        }
      }
    }
  }

  // Render current piece
  if (currentPiece) {
    for (let ly = 0; ly < currentPiece.shape.length; ly++) {
      for (let lx = 0; lx < currentPiece.shape[ly].length; lx++) {
        for (let lz = 0; lz < currentPiece.shape[ly][lx].length; lz++) {
          if (currentPiece.shape[ly][lx][lz]) {
            const x = currentPiece.position.x + lx;
            const y = currentPiece.position.y + ly;
            const z = currentPiece.position.z + lz;
            blocks.push(
              <Block
                key={`current-${ly}-${lx}-${lz}`}
                position={[
                  x - BOARD_WIDTH / 2 + 0.5,
                  BOARD_HEIGHT - y - 0.5,
                  z - BOARD_DEPTH / 2 + 0.5,
                ]}
                color={currentPiece.color}
              />
            );
          }
        }
      }
    }
  }

  return (
    <group ref={groupRef}>
      {blocks}
      {/* Board wireframe */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(BOARD_WIDTH, BOARD_HEIGHT, BOARD_DEPTH)]} />
        <lineBasicMaterial color="#4a5568" transparent opacity={0.3} />
      </lineSegments>
      {/* Grid lines on bottom */}
      <gridHelper
        args={[Math.max(BOARD_WIDTH, BOARD_DEPTH), Math.max(BOARD_WIDTH, BOARD_DEPTH), '#2d3748', '#1a202c']}
        position={[0, -BOARD_HEIGHT / 2, 0]}
      />
    </group>
  );
}

interface TetrisSceneProps {
  board: Cell[][][];
  currentPiece: Tetromino | null;
  ghostPiece: Tetromino | null;
}

export default function TetrisScene({ board, currentPiece, ghostPiece }: TetrisSceneProps) {
  return (
    <Canvas className="w-full h-full">
      <PerspectiveCamera makeDefault position={[15, 15, 15]} fov={50} />
      <OrbitControls
        enablePan={false}
        minDistance={15}
        maxDistance={40}
        autoRotate={false}
        target={[0, 0, 0]}
      />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <directionalLight position={[-10, 10, -10]} intensity={0.5} />
      <pointLight position={[0, 15, 0]} intensity={0.5} color="#ffffff" />
      <fog attach="fog" args={['#0a0a1a', 30, 60]} />
      <BackgroundParticles />
      <GameBoard board={board} currentPiece={currentPiece} ghostPiece={ghostPiece} />
    </Canvas>
  );
}
