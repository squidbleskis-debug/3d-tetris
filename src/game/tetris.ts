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

// Tetromino shapes (3D pieces) - all are arrays of layers (Y), each layer has rows (Z) and columns (X)
export const TETROMINOES = [
  {
    // I-piece (horizontal line)
    shape: [
      [[1, 1, 1, 1]],
    ],
    color: '#00f5ff',
  },
  {
    // O-piece (2x2 square)
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
    // 3D cross (plus shape on one layer)
    shape: [
      [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
    ],
    color: '#ec4899',
  },
  {
    // 3D L-shape (vertical tower)
    shape: [
      [[1]],
      [[1]],
      [[1, 1]],
    ],
    color: '#14b8a6',
  },
  {
    // 3D corner (2x2x2 partial cube)
    shape: [
      [[1, 1], [1, 0]],
      [[1, 0], [0, 0]],
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
  // Deep copy the shape
  const shape = template.shape.map(layer => layer.map(row => [...row]));
  
  const height = shape.length; // Y layers
  const depth = shape[0].length; // Z rows per layer
  const width = shape[0][0].length; // X cols per row

  return {
    shape,
    color: template.color,
    position: {
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(width / 2),
      y: 0,
      z: Math.floor(BOARD_DEPTH / 2) - Math.floor(depth / 2),
    },
  };
}

export function checkCollision(
  board: Cell[][][],
  tetromino: Tetromino,
  offset: Position = { x: 0, y: 0, z: 0 }
): boolean {
  for (let ly = 0; ly < tetromino.shape.length; ly++) {
    for (let lz = 0; lz < tetromino.shape[ly].length; lz++) {
      for (let lx = 0; lx < tetromino.shape[ly][lz].length; lx++) {
        if (tetromino.shape[ly][lz][lx]) {
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
    for (let lz = 0; lz < tetromino.shape[ly].length; lz++) {
      for (let lx = 0; lx < tetromino.shape[ly][lz].length; lx++) {
        if (tetromino.shape[ly][lz][lx]) {
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
    for (let x = 0; x < BOARD_WIDTH && layerFull; x++) {
      for (let z = 0; z < BOARD_DEPTH && layerFull; z++) {
        if (!newBoard[y][x][z].filled) {
          layerFull = false;
        }
      }
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
      y++; // Recheck this level since we moved everything down
    }
  }

  return { newBoard, linesCleared };
}

// Rotate the 3D shape around a given axis
// Shape is indexed as shape[y][z][x] (layers of depth-rows of width-cols)
export function rotateTetromino(tetromino: Tetromino, axis: 'x' | 'y' | 'z'): Tetromino {
  const shape = tetromino.shape;
  let rotated: number[][][];

  if (axis === 'y') {
    // Rotate around Y axis: rotates the X-Z plane within each layer
    // For each layer, rotate 90 degrees clockwise when viewed from top
    rotated = shape.map(layer => {
      const rows = layer.length; // Z dimension
      const cols = layer[0].length; // X dimension
      const newLayer: number[][] = [];
      // After rotation: new Z = old X, new X = (old Z reversed)
      for (let newX = 0; newX < rows; newX++) {
        const newRow: number[] = [];
        for (let newZ = 0; newZ < cols; newZ++) {
          newRow.push(layer[rows - 1 - newZ][newX]);
        }
        newLayer.push(newRow);
      }
      return newLayer;
    });
  } else if (axis === 'x') {
    // Rotate around X axis: swaps Y and Z dimensions
    // shape[y][z][x] -> newShape[z][y][x]
    const height = shape.length;
    const depth = shape[0].length;
    const width = shape[0][0].length;
    rotated = [];
    for (let newZ = 0; newZ < height; newZ++) {
      const newLayer: number[][] = [];
      for (let newY = 0; newY < depth; newY++) {
        const newRow: number[] = [];
        for (let x = 0; x < width; x++) {
          // newShape[newZ][newY][x] = shape[height-1-newY][newZ][x]
          newRow.push(shape[height - 1 - newY][newZ][x]);
        }
        newLayer.push(newRow);
      }
      rotated.push(newLayer);
    }
  } else {
    // Rotate around Z axis: swaps Y and X dimensions
    // shape[y][z][x] -> newShape[x][z][y]
    const height = shape.length;
    const depth = shape[0].length;
    const width = shape[0][0].length;
    rotated = [];
    for (let newX = 0; newX < width; newX++) {
      const newLayer: number[][] = [];
      for (let z = 0; z < depth; z++) {
        const newRow: number[] = [];
        for (let newY = 0; newY < height; newY++) {
          // newShape[newX][z][newY] = shape[height-1-newY][z][newX]
          newRow.push(shape[height - 1 - newY][z][newX]);
        }
        newLayer.push(newRow);
      }
      rotated.push(newLayer);
    }
  }

  return { ...tetromino, shape: rotated };
}

export function calculateScore(linesCleared: number, level: number): number {
  const basePoints = [0, 100, 300, 500, 800];
  return (basePoints[linesCleared] || 0) * (level + 1);
}

export function getDropSpeed(level: number): number {
  return Math.max(100, 1000 - level * 80);
}
