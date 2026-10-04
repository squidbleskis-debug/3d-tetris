import React, { useRef, useMemo } from 'react';
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
  isGhost?: boolean;
}

function Block({ position, color, opacity = 1, isGhost = false }: BlockProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && !isGhost) {
      // Subtle breathing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + position[0] + position[1]) * 0.01;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[0.92, 0.92, 0.92]} />
      {isGhost ? (
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15}
          wireframe={false}
        />
      ) : (
        <meshPhysicalMaterial
          color={color}
          metalness={0.2}
          roughness={0.3}
          clearcoat={0.5}
          clearcoatRoughness={0.2}
          emissive={color}
          emissiveIntensity={0.1}
        />
      )}
    </mesh>
  );
}

function ScanLine() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = (Math.sin(state.clock.elapsedTime * 0.5) + 1) / 2;
      meshRef.current.position.y = BOARD_HEIGHT / 2 - t * BOARD_HEIGHT;
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[BOARD_WIDTH + 0.5, BOARD_DEPTH + 0.5]} />
      <meshBasicMaterial
        color="#3b82f6"
        transparent
        opacity={0.1}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
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
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.03;
    }
  });

  const blocks = useMemo(() => {
    const elements: JSX.Element[] = [];

    // Render placed blocks
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        for (let z = 0; z < BOARD_DEPTH; z++) {
          if (board[y][x][z].filled) {
            elements.push(
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
              elements.push(
                <Block
                  key={`ghost-${ly}-${lx}-${lz}`}
                  position={[
                    x - BOARD_WIDTH / 2 + 0.5,
                    BOARD_HEIGHT - y - 0.5,
                    z - BOARD_DEPTH / 2 + 0.5,
                  ]}
                  color={ghostPiece.color}
                  isGhost={true}
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
              elements.push(
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

    return elements;
  }, [board, currentPiece, ghostPiece]);

  return (
    <group ref={groupRef}>
      {blocks}
      
      {/* Board wireframe */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(BOARD_WIDTH + 0.2, BOARD_HEIGHT + 0.2, BOARD_DEPTH + 0.2)]} />
        <lineBasicMaterial color="#3b82f6" transparent opacity={0.15} />
      </lineSegments>

      {/* Inner grid lines */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(BOARD_WIDTH, BOARD_HEIGHT, BOARD_DEPTH)]} />
        <lineBasicMaterial color="#1e40af" transparent opacity={0.08} />
      </lineSegments>

      {/* Bottom grid */}
      <gridHelper
        args={[Math.max(BOARD_WIDTH, BOARD_DEPTH), Math.max(BOARD_WIDTH, BOARD_DEPTH), '#1e3a5f', '#0f1f3a']}
        position={[0, -BOARD_HEIGHT / 2 - 0.01, 0]}
      />

      {/* Corner lights */}
      <pointLight position={[-BOARD_WIDTH/2, BOARD_HEIGHT/2, -BOARD_DEPTH/2]} intensity={0.3} color="#3b82f6" distance={15} />
      <pointLight position={[BOARD_WIDTH/2, BOARD_HEIGHT/2, BOARD_DEPTH/2]} intensity={0.3} color="#8b5cf6" distance={15} />
      <pointLight position={[BOARD_WIDTH/2, -BOARD_HEIGHT/2, -BOARD_DEPTH/2]} intensity={0.2} color="#06b6d4" distance={15} />

      {/* Scanning line effect */}
      <ScanLine />
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
    <Canvas
      className="w-full h-full"
      shadows
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#050510']} />
      <PerspectiveCamera makeDefault position={[18, 12, 18]} fov={45} />
      <OrbitControls
        enablePan={false}
        minDistance={15}
        maxDistance={45}
        autoRotate={false}
        target={[0, 0, 0]}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.1}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[15, 25, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-10, 15, -10]} intensity={0.4} color="#8b5cf6" />
      <pointLight position={[0, 20, 0]} intensity={0.6} color="#ffffff" />
      <pointLight position={[0, -15, 0]} intensity={0.3} color="#3b82f6" />
      
      {/* Fog */}
      <fog attach="fog" args={['#050510', 25, 55]} />
      
      {/* Background particles */}
      <BackgroundParticles />
      
      {/* Game board */}
      <GameBoard board={board} currentPiece={currentPiece} ghostPiece={ghostPiece} />
    </Canvas>
  );
}
