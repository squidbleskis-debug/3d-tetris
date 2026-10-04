// 3D Tetris Game Logic
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const BOARD_DEPTH = 10;

export type Cell = {
  filled: boolean;
  color: string;
};

export type Position = {
  x: number;
  y: number;
  z: number;
};

export type Tetromino = {
  shape: number[][][];
  color: string;
  position: Position;
};

// Tetromino shapes (3D pieces)
export const TETROMINOES = [
  {
    // I-piece (3D line)
    shape: [
      [[1, 1, 1, 1]],
    ],
    color: '#00f5ff',
  },
  {
    // O-piece (3D cube 2x2)
    shape: [
      [[1, 1], [1, 1]],
    ],
    color: '#ffd700',
  },
  {
    // T-piece
    shape: [
      [[0, 1, 0], [1, 1, 1]],
    ],
    color: '#a855f7',
  },
  {
    // S-piece
    shape: [
      [[0, 1, 1], [1, 1, 0]],
    ],
    color: '#22c55e',
  },
  {
    // Z-piece
    shape: [
      [[1, 1, 0], [0, 1, 1]],
    ],
    color: '#ef4444',
  },
  {
    // L-piece
    shape: [
      [[1, 0], [1, 0], [1, 1]],
    ],
    color: '#f97316',
  },
  {
    // J-piece
    shape: [
      [[0, 1], [0, 1], [1, 1]],
    ],
    color: '#3b82f6',
  },
  // 3D-specific pieces
  {
    // 3D cross
    shape: [
      [[0, 1, 0]],
      [[1, 1, 1]],
      [[0, 1, 0]],
    ],
    color: '#ec4899',
  },
  {
    // 3D corner
    shape: [
      [[1, 1], [1, 0]],
      [[1, 0], [0, 0]],
    ],
    color: '#14b8a6',
  },
  {
    // 3D L-shape (vertical)
    shape: [
      [[1, 0]],
      [[1, 0]],
      [[1, 1]],
    ],
    color: '#8b5cf6',
  },
];

export function createEmptyBoard(): Cell[][][] {
  const board: Cell[][][] = [];
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    board[y] = [];
    for (let x = 0; x < BOARD_WIDTH; x++) {
      board[y][x] = [];
      for (let z = 0; z < BOARD_DEPTH; z++) {
        board[y][x][z] = { filled: false, color: '' };
      }
    }
  }
  return board;
}

export function createRandomTetromino(): Tetromino {
  const index = Math.floor(Math.random() * TETROMINOES.length);
  const template = TETROMINOES[index];
  return {
    shape: template.shape.map(layer => layer.map(row => [...row])),
    color: template.color,
    position: {
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(template.shape[0][0].length / 2),
      y: 0,
      z: Math.floor(BOARD_DEPTH / 2) - Math.floor(template.shape[0].length / 2),
    },
  };
}

export function checkCollision(
  board: Cell[][][],
  tetromino: Tetromino,
  offset: Position = { x: 0, y: 0, z: 0 }
): boolean {
  for (let ly = 0; ly < tetromino.shape.length; ly++) {
    for (let lx = 0; lx < tetromino.shape[ly].length; lx++) {
      for (let lz = 0; lz < tetromino.shape[ly][lx].length; lz++) {
        if (tetromino.shape[ly][lx][lz]) {
          const newX = tetromino.position.x + lx + offset.x;
          const newY = tetromino.position.y + ly + offset.y;
          const newZ = tetromino.position.z + lz + offset.z;

          if (
            newX < 0 || newX >= BOARD_WIDTH ||
            newY < 0 || newY >= BOARD_HEIGHT ||
            newZ < 0 || newZ >= BOARD_DEPTH
          ) {
            return true;
          }

          if (board[newY][newX][newZ].filled) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

export function placeTetromino(board: Cell[][][], tetromino: Tetromino): Cell[][][] {
  const newBoard = board.map(layer =>
    layer.map(row =>
      row.map(cell => ({ ...cell }))
    )
  );

  for (let ly = 0; ly < tetromino.shape.length; ly++) {
    for (let lx = 0; lx < tetromino.shape[ly].length; lx++) {
      for (let lz = 0; lz < tetromino.shape[ly][lx].length; lz++) {
        if (tetromino.shape[ly][lx][lz]) {
          const x = tetromino.position.x + lx;
          const y = tetromino.position.y + ly;
          const z = tetromino.position.z + lz;
          if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH && z >= 0 && z < BOARD_DEPTH) {
            newBoard[y][x][z] = { filled: true, color: tetromino.color };
          }
        }
      }
    }
  }
  return newBoard;
}

export function clearLayers(board: Cell[][][]): { newBoard: Cell[][][]; linesCleared: number } {
  let linesCleared = 0;
  const newBoard = board.map(layer =>
    layer.map(row =>
      row.map(cell => ({ ...cell }))
    )
  );

  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    let layerFull = true;
    for (let x = 0; x < BOARD_WIDTH; x++) {
      for (let z = 0; z < BOARD_DEPTH; z++) {
        if (!newBoard[y][x][z].filled) {
          layerFull = false;
          break;
        }
      }
      if (!layerFull) break;
    }

    if (layerFull) {
      linesCleared++;
      // Move everything above down
      for (let moveY = y; moveY > 0; moveY--) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          for (let z = 0; z < BOARD_DEPTH; z++) {
            newBoard[moveY][x][z] = { ...newBoard[moveY - 1][x][z] };
          }
        }
      }
      // Clear top layer
      for (let x = 0; x < BOARD_WIDTH; x++) {
        for (let z = 0; z < BOARD_DEPTH; z++) {
          newBoard[0][x][z] = { filled: false, color: '' };
        }
      }
      y++; // Recheck this level
    }
  }

  return { newBoard, linesCleared };
}

export function rotateTetromino(tetromino: Tetromino, axis: 'x' | 'y' | 'z'): Tetromino {
  const newShape = tetromino.shape.map(layer => layer.map(row => [...row]));

  if (axis === 'y') {
    // Rotate around Y axis (horizontal rotation)
    const height = newShape.length;
    const rows = newShape[0].length;
    const cols = newShape[0][0].length;
    const rotated: number[][][] = [];
    for (let ly = 0; ly < height; ly++) {
      rotated[ly] = [];
      for (let lz = 0; lz < cols; lz++) {
        rotated[ly][lz] = [];
        for (let lx = 0; lx < rows; lx++) {
          rotated[ly][lz][lx] = newShape[ly][rows - 1 - lx][lz];
        }
      }
    }
    return { ...tetromino, shape: rotated };
  } else if (axis === 'x') {
    // Rotate around X axis (vertical rotation front-back)
    const height = newShape.length;
    const rows = newShape[0].length;
    const cols = newShape[0][0].length;
    const rotated: number[][][] = [];
    for (let lz = 0; lz < cols; lz++) {
      rotated[lz] = [];
      for (let ly = 0; ly < height; ly++) {
        rotated[lz][ly] = [];
        for (let lx = 0; lx < rows; lx++) {
          rotated[lz][ly][lx] = newShape[height - 1 - ly][lx][lz];
        }
      }
    }
    return { ...tetromino, shape: rotated };
  } else {
    // Rotate around Z axis (top-down rotation)
    const height = newShape.length;
    const rows = newShape[0].length;
    const cols = newShape[0][0].length;
    const rotated: number[][][] = [];
    for (let ly = 0; ly < height; ly++) {
      rotated[ly] = [];
      for (let lx = 0; lx < cols; lx++) {
        rotated[ly][lx] = [];
        for (let lz = 0; lz < rows; lz++) {
          rotated[ly][lx][lz] = newShape[ly][rows - 1 - lz][lx];
        }
      }
    }
    return { ...tetromino, shape: rotated };
  }
}

export function calculateScore(linesCleared: number, level: number): number {
  const basePoints = [0, 100, 300, 500, 800];
  return (basePoints[linesCleared] || 0) * (level + 1);
}

export function getDropSpeed(level: number): number {
  return Math.max(100, 1000 - level * 80);
}
