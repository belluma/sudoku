const createBaseArray = () => Array.from(new Array(9), (_, i) => i + 1);


let matrix = [...Array(9)].map(() => [...Array(9)].map((_) => 0));
const createRandomRow = (array, baseArray = createBaseArray()) => {
    if (!baseArray.length) return array;
    array.push(baseArray.splice(Math.floor(Math.random() * baseArray.length), 1)[0]);
    return createRandomRow(array, baseArray);
};
let randomRow = createRandomRow([]);
let errors = false;
let difficulty = 1;
let selectedCell;
//array to track attempts for backtracking algorithm
const attempts = Array.from(new Array(81), (_) => 0);

//create arrays for each column and each block to check which numbers are valid to insert
const updateColumns = (activeMatrix) => {
    return Array.from(new Array(9), (x, j) =>
        Array.from(new Array(9), (_, i) => activeMatrix[i][j])
    );
};

const updateBlocks = (activeMatrix) => {
    return Array.from(new Array(9), (_, j) =>
        Array.from(new Array(9), (__, i) =>
            (activeMatrix[Math.floor(j / 3) * 3 + Math.floor(i / 3)][(j % 3) * 3 + (i % 3)])));
};
const activeColumn = (col, activeMatrix) => {
    return updateColumns(activeMatrix)[col];
};

const activeBlock = (row, col, activeMatrix) => {
    return updateBlocks(activeMatrix)[Math.floor(row / 3) * 3 + Math.floor(col / 3)];
};

//save matrix in array for each time a different number is tried, to visualize backtracking algorithm
let steps = [matrix];

const drawCell = (i, j) => {
    let cell = document.createElement("td");
    if (i === 2 || i === 5) cell.classList.add("border_bottom");
    if (j === 2 || j === 5) cell.classList.add("border_right");
    cell.innerHTML = matrix[i][j] !== 0 ? matrix[i][j] : " ";
    if (!matrix[i][j]) cell.onclick = selectCell.bind(this, 9 * i + j);
    if (matrix[i][j]) cell.classList.add("clues");
    return cell;
}

const drawTable = (index) => {
    matrix = steps[index];
    let table = document.getElementById("table");
    table.innerHTML = "";
    for (let i = 0; i < matrix.length; i++) {
        let line = document.createElement("tr");
        for (let j = 0; j < matrix[i].length; j++) {
            line.appendChild(drawCell(i, j));
        }
        table.appendChild(line);
    }
};

const fillTable = (index, attempt = 0, speed = 300, solve = false) => {
    if (index < 0) {
        console.error("no solution exists");
        return;
    }
    const row = Math.floor(index / 9);
    const col = index % 9;

    if (attempt > 0 && steps[index][row][col]) {
        trackback(index, speed, solve);
        return;
    }

    let possibleNumbers = randomRow
        .filter((n) => activeColumn(col, steps[index]).indexOf(n) === -1)
        .filter((n) => activeBlock(row, col, steps[index]).indexOf(n) === -1)
        .filter((n) => steps[index][row].indexOf(n) === -1);
    if (!steps[index][row][col]) {
        if (attempts[index] >= possibleNumbers.length) {
            trackback(index, speed, solve);
            return;
        }
    }

    let newMatrix = steps[index].map((a) => [...a]);
    if (!newMatrix[row][col]) newMatrix[row][col] = possibleNumbers[attempt];
    steps.push(newMatrix);
    if (solve) drawTable(index);
    if (row * col === 64) {
        if (solve) return drawTable(index + 1);
        else return createCluesForSudoku();
    }
    setTimeout(() => fillTable(index + 1, 0, speed, solve), speed);
};
const trackback = (index, speed, solve) => {
    attempts[index - 1]++;
    for (let i = index; i < attempts.length; i++) attempts[i] = 0;
    steps.pop();
    setTimeout(
        () => fillTable(index - 1, attempts[index - 1], speed, solve),
        speed
    );
};

const clearMatrix = () => {
    matrix = matrix.map((row) => row.map((_) => (0)));
    steps = [matrix];
    drawTable(0);
};

const createSudoku = () => {
    steps = [matrix];
    drawTable(0);
    fillTable(0, 0, 0);
};

const randomNumbersForCluePositions = () => {
    const amountOfClues = [22, 28, 34];
    const clueIndices = [];
    while (clueIndices.length < amountOfClues[difficulty]) {
        const random = Math.floor(Math.random() * 81);
        if (clueIndices.indexOf(random) === -1) clueIndices.push(random);
    }
    return clueIndices;
};
const createCluesForSudoku = () => {
    const clueIndices = randomNumbersForCluePositions();
    steps[0] = [...steps[steps.length - 1]].map((a, i) =>
        [...a].map((b, j) => {
            if (clueIndices.indexOf(9 * i + j) === -1) return 0;
            else return b;
        })
    );
    steps.splice(1);
    drawTable(0);
};
const solveSudoku = () => {
    if(errors){
        alert("Remove wrong entries first!");
        return;
    }
    fillTable(0, 0, 0, true);
};

const changeDifficulty = () =>
    (difficulty = document.getElementById("difficulty").value);

const selectCell = (index) => {
    let cells = Array.from(document.getElementsByTagName("TD"));
    cells.forEach((a) => a.classList.remove("marked"));
    cells[index].classList.add("marked");
    selectedCell = index;
};
document.addEventListener("keydown", (e) => {
    let cells = Array.from(document.getElementsByTagName("TD"));
    const row = Math.floor(selectedCell / 9);
    const col = selectedCell % 9;
    const possibleNumbers = randomRow
        .filter((n) => activeColumn(col, matrix).indexOf(n) === -1)
        .filter((n) => activeBlock(row, col, matrix).indexOf(n) === -1)
        .filter((n) => matrix[row].indexOf(n) === -1);
    if (e.key.match(/\d/) && selectedCell !== undefined) {
        if (possibleNumbers.indexOf(parseInt(e.key)) === -1)
            cells[selectedCell].classList.add("errors");
        else cells[selectedCell].classList.remove("errors");
        cells[selectedCell].innerHTML = e.key;
        matrix[row][col] = parseInt(e.key);
    } else if (e.key === "Backspace" || e.key === "Delete") {
        cells[selectedCell].classList.remove("errors");
        cells[selectedCell].innerHTML = " ";
        matrix[row][col] = 0;
    }
    errors = (cells.filter(c => c.classList.contains("errors"))).length > 0;
});

console.log(document.getElementsByTagName("TD"))
