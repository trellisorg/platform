export const CELL_SIZE_PX = 10;

export const COLUMNS = 750 / CELL_SIZE_PX;
export const ROWS = 750 / CELL_SIZE_PX;

const setCellValueHelper = (game: number[][], row: number, col: number) => {
    try {
        return game[row][col];
    } catch {
        return 0;
    }
};

const countNeighbours = (game: number[][], row: number, col: number) => {
    let total_neighbours = 0;
    total_neighbours += setCellValueHelper(game, row - 1, col - 1);
    total_neighbours += setCellValueHelper(game, row - 1, col);
    total_neighbours += setCellValueHelper(game, row - 1, col + 1);
    total_neighbours += setCellValueHelper(game, row, col - 1);
    total_neighbours += setCellValueHelper(game, row, col + 1);
    total_neighbours += setCellValueHelper(game, row + 1, col - 1);
    total_neighbours += setCellValueHelper(game, row + 1, col);
    total_neighbours += setCellValueHelper(game, row + 1, col + 1);
    return total_neighbours;
};

const updateCellValue = (game: number[][], row: number, col: number) => {
    const total = countNeighbours(game, row, col);
    // cell with more than 4 or less then 3 neighbours dies. 1 => 0; 0 => 0
    if (total > 4 || total < 3) {
        return 0;
    }
    // dead cell with 3 neighbours becomes alive. 0 => 1
    else if (game[row][col] === 0 && total === 3) {
        return 1;
    }
    // or returning its status back. 0 => 0; 1 => 1
    else {
        return game[row][col];
    }
};

export const updateLifeCycle = (activeGame: number[][]) => {
    const newGame: number[][] = [];

    for (let i = 0; i < COLUMNS; i++) {
        const newRow = [];
        for (let j = 0; j < ROWS; j++) {
            newRow.push(updateCellValue(activeGame, i, j));
        }

        newGame.push(newRow);
    }
    return newGame;
};
