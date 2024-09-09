let board = [];
let openedSquares = [];
let flaggedSquares = [];
let bombCount = 0;
let squaresLeft = 0;
let gameOver = false;
let boardMetadata = { rowCount: 9, colCount: 9 }; 

let bombProbability = 0.15;
let maxProbability = 1.0;
function minesweeperGameBootstrapper(rowCount, colCount, bombProbability, maxProbability) {
    let easy = { rowCount: 9, colCount: 9 };
    let medium = { rowCount: 16, colCount: 16 };
    let expert = { rowCount: 16, colCount: 30 };

    if (rowCount == null && colCount == null) {
        boardMetadata = easy; 
    } else {
        boardMetadata = { rowCount: rowCount, colCount: colCount };
    }

    generateBoard(boardMetadata, bombProbability, maxProbability);
}

function generateBoard(boardMetadata, bombProbability, maxProbability) {
    let squaresLeft = boardMetadata.colCount * boardMetadata.rowCount;
    board = new Array(boardMetadata.colCount);

    for (let i = 0; i < boardMetadata.colCount; i++) {
        board[i] = new Array(boardMetadata.rowCount);
    }

    for (let i = 0; i < boardMetadata.colCount; i++) {
        for (let j = 0; j < boardMetadata.rowCount; j++) {
            board[i][j] = {
                hasBomb: Math.random() * maxProbability < bombProbability,
                isOpen: false,
                isFlagged: false,
                neighboringBombs: 0
            };
        }
    }

    for (let i = 0; i < boardMetadata.colCount; i++) {
        for (let j = 0; j < boardMetadata.rowCount; j++) {
            if (!board[i][j].hasBomb) {
                board[i][j].neighboringBombs = countNeighboringBombs(board, i, j, boardMetadata);
            }
        }
    }

    updateBoardUI(boardMetadata);
}


function countNeighboringBombs(board, x, y, boardMetadata) {
    let bombCount = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let newX = x + i;
            let newY = y + j;
            if (newX >= 0 && newX < boardMetadata.colCount && newY >= 0 && newY < boardMetadata.rowCount) {
                if (board[newX][newY].hasBomb) {
                    bombCount++;
                }
            }
        }
    }
    return bombCount;
}

function updateBoardUI(boardMetadata) {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = ''; 

    gameBoard.style.gridTemplateColumns = `repeat(${boardMetadata.colCount}, 40px)`;

    for (let i = 0; i < boardMetadata.colCount; i++) {
        for (let j = 0; j < boardMetadata.rowCount; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.dataset.x = i;
            tile.dataset.y = j;

            tile.addEventListener('click', () => discoverTile(board, i, j, boardMetadata));

            tile.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleFlag(board, i, j);
            });

            gameBoard.appendChild(tile); 
        }
    }
}

function discoverTile(board, x, y, boardMetadata) {
    if (gameOver || board[x][y].isOpen || board[x][y].isFlagged) {
        return; 
    }

    const tile = document.querySelector(`.tile[data-x="${x}"][data-y="${y}"]`);
    board[x][y].isOpen = true;
    tile.classList.add('open');

    if (board[x][y].hasBomb) {
        tile.classList.add('bomb');
        tile.innerHTML = '💣';
        gameOver = true;
        console.log("Game Over! You hit a bomb.");
        revealAllBombs(board, boardMetadata);
        return;
    }

    tile.innerHTML = board[x][y].neighboringBombs > 0 ? board[x][y].neighboringBombs : '';

    squaresLeft--;

    if (squaresLeft === 0) {
        console.log("Congratulations! You've won the game!");
        gameOver = true;
    }
}

function toggleFlag(board, x, y) {
    if (gameOver || board[x][y].isOpen) {
        return;
    }

    const tile = document.querySelector(`.tile[data-x="${x}"][data-y="${y}"]`);
    board[x][y].isFlagged = !board[x][y].isFlagged;
    tile.classList.toggle('flagged');
}

function revealAllBombs(board, boardMetadata) {
    for (let i = 0; i < boardMetadata.colCount; i++) {
        for (let j = 0; j < boardMetadata.rowCount; j++) {
            if (board[i][j].hasBomb) {
                const tile = document.querySelector(`.tile[data-x="${i}"][data-y="${j}"]`);
                tile.classList.add('bomb');
                tile.innerHTML = '💣';
            }
        }
    }
}

window.onload = function() {
    const difficultySelect = document.getElementById('difficulty-select');
    const bombProbabilityInput = document.getElementById('bomb-probability');
    const maxProbabilityInput = document.getElementById('max-probability');
    const startGameButton = document.getElementById('start-game');

    startGameButton.addEventListener('click', function() {
        let selectedDifficulty = difficultySelect.value;
        let bombProbability = parseFloat(bombProbabilityInput.value);
        let maxProbability = parseFloat(maxProbabilityInput.value);

        if (selectedDifficulty === 'easy') {
            minesweeperGameBootstrapper(9, 9, bombProbability, maxProbability); 
        } else if (selectedDifficulty === 'medium') {
            minesweeperGameBootstrapper(16, 16, bombProbability+0.05, maxProbability); 
        } else if (selectedDifficulty === 'expert') {
            minesweeperGameBootstrapper(16, 30, bombProbability+0.1, maxProbability); 
        }
    });

    generateBoard(boardMetadata, 0.15, 1.0); 
};