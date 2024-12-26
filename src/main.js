import './style.css'

document.querySelector('#app').innerHTML = `
  <div class="game-container">
    <div class="score-container">
      <span id="score">Score: 0</span>
    </div>
    <div class="game-grid">
        <!-- Game tiles will be dynamically added here -->
    </div>
    <button id="resetBtn" class="reset-button">Reset Game</button>
  </div>
`;

const gameGrid = document.querySelector('.game-grid');
const scoreDisplay = document.querySelector('#score');
const resetBtn = document.querySelector('#resetBtn');

const gridSize = 4;
let score = 0;
let grid = [];

function initializeGrid() {
  score = 0;
  scoreDisplay.textContent = `Score: ${score}`;
  for (let row = 0; row < gridSize; row++) {
      grid[row] = [];
      for (let col = 0; col < gridSize; col++) {
          grid[row][col] = 0;

          const tile = document.createElement('div');
          tile.classList.add('tile');
          tile.dataset.row = row;
          tile.dataset.col = col;
          gameGrid.appendChild(tile);
      }
  }

  addRandomTile();
  addRandomTile();

  renderGrid();
}

resetBtn.addEventListener('click', () => {
  grid = [];
  gameGrid.innerHTML = '';
  initializeGrid();
});

function addRandomTile() {
  const emptyTiles = [];

  for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
          if (grid[row][col] === 0) {
              emptyTiles.push({ row, col });
          }
      }
  }

  if (emptyTiles.length > 0) {
      const { row, col } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];

      grid[row][col] = Math.random() < 0.9 ? 2 : 4;

      const tile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
      tile.classList.add('new');
  }
}

function renderGrid() {
  const tiles = document.querySelectorAll('.tile');
  tiles.forEach(tile => {
      const row = tile.dataset.row;
      const col = tile.dataset.col;
      const value = grid[row][col];

      tile.textContent = value === 0 ? '' : value;
      tile.dataset.value = value;

      tile.addEventListener('animationend', () => {
          tile.classList.remove('new');
      });

      if (tile.classList.contains('merge')) {
            tile.addEventListener('animationend', () => {
                tile.classList.remove('merge');
            });
        }
      const tileSize = 90;
      tile.style.top = `${row * tileSize + 10}px`;
      tile.style.left = `${col * tileSize + 10}px`;
  });
}

function updateScore(addedScore) {
  score += addedScore;
  scoreDisplay.textContent = `Score: ${score}`;
}

document.addEventListener('keydown', handleInput);

function handleInput(event) {
    switch (event.key) {
        case 'ArrowUp':
            moveUp();
            break;
        case 'ArrowDown':
            moveDown();
            break;
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
        default:
            return;
    }

    if (didMove) {
        addRandomTile();
        renderGrid();
    }

    if (isGameOver()) {
        alert('Game Over!');
    }
}

function slide(row) {
  const filteredRow = row.filter(value => value !== 0); // Remove zeros
  const mergedRow = [];
  let scoreGained = 0;

  for (let i = 0; i < filteredRow.length; i++) {
      if (filteredRow[i] === filteredRow[i + 1]) {
          mergedRow.push(filteredRow[i] * 2);
          scoreGained += filteredRow[i] * 2;
          i++;
      } else {
          mergedRow.push(filteredRow[i]);
      }
  }

  while (mergedRow.length < gridSize) {
      mergedRow.push(0);
  }

  return { mergedRow, scoreGained };
}

let didMove = false;
function moveUp() {
    didMove = false;
    let scoreForMove = 0;

    for (let col = 0; col < gridSize; col++) {
        const column = grid.map(row => row[col]);
        const { mergedRow, scoreGained } = slide(column);

        if (!arraysEqual(column, mergedRow)) {
            didMove = true;
        }

        grid.forEach((row, rowIndex) => {
            grid[rowIndex][col] = mergedRow[rowIndex];
        });

        scoreForMove += scoreGained;
    }

    // Update score if any tiles moved
    if (didMove) {
        updateScore(scoreForMove);
        addRandomTile();
        renderGrid();
    }
}

function moveDown() {
    didMove = false;
    let scoreForMove = 0;

    for (let col = 0; col < gridSize; col++) {
        const column = grid.map(row => row[col]).reverse();
        const { mergedRow, scoreGained } = slide(column);

        if (!arraysEqual(column, mergedRow.reverse())) {
            didMove = true;
        }

        grid.forEach((row, rowIndex) => {
            grid[rowIndex][col] = mergedRow[rowIndex];
        });

        scoreForMove += scoreGained;
    }

    if (didMove) {
        updateScore(scoreForMove);
        addRandomTile();
        renderGrid();
    }
}

// Move tiles left
function moveLeft() {
    didMove = false;
    let scoreForMove = 0;

    for (let row = 0; row < gridSize; row++) {
        const { mergedRow, scoreGained } = slide(grid[row]);

        if (!arraysEqual(grid[row], mergedRow)) {
            didMove = true;
        }

        grid[row] = mergedRow;
        scoreForMove += scoreGained;
    }

    if (didMove) {
        updateScore(scoreForMove);
        addRandomTile();
        renderGrid();
    }
}

// Move tiles right
function moveRight() {
  didMove = false;
  let scoreForMove = 0;

  for (let row = 0; row < gridSize; row++) {
      const originalRow = grid[row];
      const reversedRow = originalRow.slice().reverse();
      const { mergedRow, scoreGained } = slide(reversedRow);

      if (!arraysEqual(reversedRow, mergedRow)) {
          didMove = true;
      }

      grid[row] = mergedRow.reverse();
      scoreForMove += scoreGained;
  }

  if (didMove) {
      updateScore(scoreForMove);
      addRandomTile();
      renderGrid();
  }
}
function arraysEqual(arr1, arr2) {
    return arr1.every((value, index) => value === arr2[index]);
}

function isGameOver() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col] === 0) return false;

            if (
                (row > 0 && grid[row][col] === grid[row - 1][col]) ||
                (row < gridSize - 1 && grid[row][col] === grid[row + 1][col]) ||
                (col > 0 && grid[row][col] === grid[row][col - 1]) ||
                (col < gridSize - 1 && grid[row][col] === grid[row][col + 1])
            ) {
                return false;
            }
        }
    }
    return true;
}

initializeGrid();
