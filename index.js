const createBaseArray = () => Array.from(new Array(9), (x, i) => (x = i + 1));

let matrix = [...Array(9)].map(() => [...Array(9)].map((a) => 0));
let createRandomRow = (array, baseArray = createBaseArray()) => {
  if (baseArray.length == 0) return array;
  let b = baseArray.splice(Math.floor(Math.random() * baseArray.length), 1)[0];
  array.push(b);
  return createRandomRow(array, baseArray);
};
let randomRow = createRandomRow([]);

let difficulty = 1;
let selectedCell;
//array to track attempts for backtracking algorithm
attempts = Array.from(new Array(81), (x) => (x = 0));

//create arrays for each column and each block to check which numbers are valid to insert
let updateColumns = (matrix) => {
  let columns = Array.from(new Array(9), (x, j) =>
    Array.from(new Array(9), (y, i) => (y = matrix[i][j]))
  );
  return columns;
};

let updateBlocks = (activeMatrix) => {
  let blocks = Array.from(new Array(9), (x, j) =>
    Array.from(
      new Array(9),
      (y, i) =>
        (y =
          activeMatrix[Math.floor(j / 3) * 3 + Math.floor(i / 3)][
            (j % 3) * 3 + (i % 3)
          ])
    )
  );
  return blocks;
};
let activeColumn = (col, matrix) => {
  return updateColumns(matrix)[col];
};

let activeBlock = (row, col, matrix) => {
  return updateBlocks(matrix)[Math.floor(row / 3) * 3 + Math.floor(col / 3)];
};

//save matrix in array for each time a different number is tried, to visuallize backtracking algorithm
steps = [matrix];

let drawTable = (index) => {
  matrix = steps[index];
  table = document.getElementById("table");
  table.innerHTML = "";
  for (let i = 0; i < matrix.length; i++) {
    let line = document.createElement("tr");
    for (let j = 0; j < matrix[i].length; j++) {
      let cell = document.createElement("td");
      if (i == 2 || i == 5) cell.classList.add("border_bottom");
      if (j == 2 || j == 5) cell.classList.add("border_right");
      cell.innerHTML = matrix[i][j] != 0 ? matrix[i][j] : " ";
      if (!matrix[i][j]) cell.onclick = selectCell.bind(this, 9 * i + j);
      if (matrix[i][j]) cell.classList.add("clues");
      line.appendChild(cell);
    }
    table.appendChild(line);
  }
};

let findSolution = (index, attempt = 0, speed = 300) => {
  if (index < 0) {
    console.error("no solution exists");
    return;
  }
  let row = Math.floor(index / 9);
  let col = index % 9;
  let column = activeColumn(col, steps[index]);
  let block = activeBlock(row, col, steps[index]);

  if (attempt > 0 && steps[index][row][col]) {
    trackback(index, speed, solve);
    return;
  }

  let possibleNumbers = randomRow
    .filter((n) => column.indexOf(n) == -1)
    .filter((n) => block.indexOf(n) == -1)
    .filter((n) => steps[index][row].indexOf(n) == -1);
  if (!steps[index][row][col]) {
    if (attempts[index] >= possibleNumbers.length) {
      trackback(index, speed, solve);
      return;
    }
  }

  let newMatrix = steps[index].map((a) => [...a]);
  if (!newMatrix[row][col]) newMatrix[row][col] = possibleNumbers[attempt];
  steps.push(newMatrix);
  if (row * col == 64) return True;

  setTimeout(() => fillTable(index + 1, 0, speed, solve), speed);
};

let fillTable = (index, attempt = 0, speed = 300, solve = false) => {
  if (index < 0) {
    console.error("no solution exists");
    return;
  }
  let row = Math.floor(index / 9);
  let col = index % 9;

  if (attempt > 0 && steps[index][row][col]) {
    trackback(index, speed, solve);
    return;
  }

  let possibleNumbers = randomRow
    .filter((n) => activeColumn(col, steps[index]).indexOf(n) == -1)
    .filter((n) => activeBlock(row, col, steps[index]).indexOf(n) == -1)
    .filter((n) => steps[index][row].indexOf(n) == -1);
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
  if (row * col == 64) {
    if (solve) return drawTable(index + 1);
    else return createCluesForSudoku();
  }
  setTimeout(() => fillTable(index + 1, 0, speed, solve), speed);
};
let trackback = (index, speed, solve) => {
  attempts[index - 1]++;
  for (let i = index; i < attempts.length; i++) attempts[i] = 0;
  steps.pop();
  setTimeout(
    () => fillTable(index - 1, attempts[index - 1], speed, solve),
    speed
  );
  return;
};

let clearMatrix = () => {
  matrix = matrix.map((row) => row.map((col) => (col = 0)));
  steps = [matrix];
  console.log(steps);
  drawTable(0);
};

let createSudoku = () => {
  steps = [matrix];
  drawTable(0);
  fillTable(0, 0, 0);
};

let randomNumbersForCluePositions = () => {
  let amountOfClues = [22, 28, 34];
  let clueIndices = [];
  while (clueIndices.length < amountOfClues[difficulty]) {
    random = Math.floor(Math.random() * 81);
    if (clueIndices.indexOf(random) == -1) clueIndices.push(random);
  }
  return clueIndices;
};
let createCluesForSudoku = () => {
  let clueIndices = randomNumbersForCluePositions();
  steps[0] = [...steps[steps.length - 1]].map((a, i) =>
    [...a].map((b, j) => {
      if (clueIndices.indexOf(9 * i + j) == -1) return 0;
      else return b;
    })
  );
  steps.splice(1);
  console.error(steps[0]);
  drawTable(0);
};
let solve = () => {
  fillTable(0, 0, 0, true);
};

let changeDifficulty = () =>
  (difficulty = document.getElementById("difficulty").value);

let selectCell = (index) => {
  cells = Array.from(document.getElementsByTagName("TD"));
  cells.map((a) => a.classList.remove("marked"));
  cells[index].classList.add("marked");
  selectedCell = index;
};
document.addEventListener("keydown", (e) => {
  let cells = Array.from(document.getElementsByTagName("TD"));
  let row = Math.floor(selectedCell / 9);
  let col = selectedCell % 9;
  console.log(cells[selectedCell]);
  let possibleNumbers = randomRow
    .filter((n) => activeColumn(col, matrix).indexOf(n) == -1)
    .filter((n) => activeBlock(row, col, matrix).indexOf(n) == -1)
    .filter((n) => matrix[row].indexOf(n) == -1);
  if (e.key.match(/\d/) && selectedCell != undefined) {
    if (possibleNumbers.indexOf(parseInt(e.key)) == -1)
      cells[selectedCell].classList.add("errors");
    else cells[selectedCell].classList.remove("errors");
    cells[selectedCell].innerHTML = e.key;
    matrix[row][col] = parseInt(e.key);
  } else if (e.key == "Backspace" || e.key == "Delete") {
    cells[selectedCell].classList.remove("errors");
    cells[selectedCell].innerHTML = " ";
    matrix[row][col] = 0;
  }

  // if (possibleNumbers.indexOf(matrix[row][col]) == -1)
  console.log(selectedCell);
  console.log(possibleNumbers);
  // else cells[selectedCell].classList.remove("errors");
});

let test = () => {
  console.log(difficulty);
  console.log(steps);
};

//solve and show(set speed)

//solve manually (show errors - correct errors)
//save solution in seperate var
//on entry of number check with blocks/columns and mark wrong if not possible
// compare all entries with solution
// get hint - if wrong entries remove, else fill empty field

// const createBaseArray = () => Array.from(new Array(9), (x, i) => (x = i + 1));
// let counter = 0;
// let baseArray = createBaseArray();
// let array = Array.from(new Array(9));
// let matrix = Array.from(new Array(9), (x) => Array.from(new Array(9)));
// let columns = Array.from(new Array(9), (x, j) =>
//   Array.from(new Array(9), (y, i) => (y = matrix[i][j]))
// );
// let updateColumns = (activeMatrix) => {
//   let columns = Array.from(new Array(9), (x, j) =>
//     Array.from(new Array(9), (y, i) => (y = activeMatrix[i][j]))
//   );
//   return columns;
// };

// let updateBlocks = (activeMatrix) => {
//   let blocks = Array.from(new Array(9), (x, j) =>
//     Array.from(
//       new Array(9),
//       (y, i) =>
//         (y =
//           activeMatrix[Math.floor(j / 3) * 3 + Math.floor(i / 3)][
//             (j % 3) * 3 + (i % 3)
//           ])
//     )
//   );
//   //   console.log(activeMatrix);
//   // drawTable(activeMatrix);
//   return blocks;
// };
// let attempts = Array.from(new Array(81), (x) => (x = 0));
// let loop = [
//   {
//     matrix: matrix.map((a) => [...a]),
//     columns: updateColumns(matrix.map((a) => [...a])),
//     blocks: updateBlocks(matrix.map((a) => [...a])),
//     index: 0,
//     turn: 0,
//     possbileMoves: 9,
//   },
// ];
// let active = 1;
// let blocks = Array.from(new Array(9), (x, j) =>
//   Array.from(
//     new Array(9),
//     (y, i) =>
//       (y =
//         matrix[Math.floor(j / 3) * 3 + Math.floor(i / 3)][
//           (j % 3) * 3 + (i % 3)
//         ])
//   )
// );

// let updateDisplay = () => {
//   document.getElementById("display").innerHTML = active + 1 + "/" + loop.length;
//   drawTable(loop[active].matrix);
// };
// var drawTable = (activeMatrix) => {
//   let table = document.getElementById("table");
//   table.innerHTML = "";
//   for (let i = 0; i < activeMatrix.length; i++) {
//     let line = document.createElement("tr");
//     for (let j = 0; j < activeMatrix[i].length; j++) {
//       cell = document.createElement("td");
//       cell.innerHTML = activeMatrix[i][j];
//       line.appendChild(cell);
//     }
//     table.appendChild(line);
//   }
//   table.onclick = (e) => {
//     if (e.target.nodeName != "TD") return;
//     const inputs = Array.from(document.getElementsByTagName("input"));
//     inputs.map((a) => a.remove());
//     const input = document.createElement("input");
//     input.value = e.target.innerHTML;
//     input.type = "number";
//     input.min = 1;
//     input.max = 9;
//     input.onchange = () => {
//       e.target.innerHTML = input.value;
//       console.log(input.value);
//       console.log(activeMatrix);
//     };
//     console.log(e.target);
//     e.target.parentNode.appendChild(input);
//     console.log(e);
//   };
// };
// let populateFirstRowWithRandomNumbers = (index) => {
//   matrix[0][index] = baseArray.splice(
//     Math.floor(Math.random() * baseArray.length),
//     1
//   )[0];
//   updateColumnsAndBlocks();
//   if (baseArray.length)
//     setTimeout(() => populateFirstRowWithRandomNumbers(index + 1), 500);
// };
// let fillTable = (index, attempt = 0) => {
//   counter++;
//   if (counter == 100) return;
//   let row = Math.floor(index / 9);
//   let col = index % 9;
//   let column = loop[index].columns[col];
//   let block = loop[index].blocks[Math.floor(row / 3) * 3 + Math.floor(col / 3)];
//   let b = createBaseArray();
//   let possibleNumbers = b
//     .filter((n) => column.indexOf(n) == -1)
//     .filter((n) => block.indexOf(n) == -1)
//     .filter((n) => loop[index].matrix[row].indexOf(n) == -1);
//   console.log(attempts[index], possibleNumbers);
//   if (attempts[index] >= possibleNumbers.length) {
//     attempts[index - 1]++;
//     //reset attempts that took place later in matrix than the place jumped back to to retry
//     for (let i = index; i < attempts.length; i++) attempts[i] = 0;
//     // console.log(possibleNumbers, attempts);
//     // console.log(index);
//     //reset matrix further down the line
//     loop.splice(index);
//     setTimeout(() => {
//       fillTable(index - 1, attempts[index - 1]), 300;
//     });
//     return;
//   }
//   currentMatrix = loop[index].matrix.map((a) => [...a]);
//   //   if (!matrix[row][col])
//   currentMatrix[row][col] = possibleNumbers[attempt] || 0;
//   loop.push({
//     matrix: currentMatrix,
//     columns: updateColumns(loop[index].matrix),
//     blocks: updateBlocks(loop[index].matrix),
//     index: index,
//     turn: loop.length,
//     possbileMoves: possibleNumbers.length,
//   });
//   drawTable(loop[index].matrix);
//   // updateColumnsAndBlocks(loop[index].matrix);
//   updateDisplay();
//   if (index < matrix.length * matrix[0].length) {
//     active++;
//     setTimeout(() => fillTable(index + 1), 300);
//     // fillTable(index + 1);
//   }
// };

// let previous = () => {
//   if (active == 0) return;
//   active--;
//   updateDisplay();
// };
// let next = () => {
//   if (active == loop.length - 1) return;
//   active++;
//   updateDisplay();
// };
// test = () => {
//   console.log(matrix);
//   console.log(columns);
// };
// // var populate = () => {
// //     let table = document.getElementById('table')
// //     for(let i = 0; i < matrix.length; i++){
// //         let line = document.createElement('tr');
// //         for(let j = 0; j < matrix[i].length; j++){
// //             cell = document.createElement('td')
// //             cell.innerHTML = matrix[i][j]
// //             line.appendChild(cell)
// //         }
// //         table.appendChild(line)

// //     }
// //     table.onclick = (e) => {
// //         if(e.target.nodeName != 'TD') return
// //         const inputs = Array.from(document.getElementsByTagName('input'))
// //         inputs.map(a => a.remove())
// //         const input = document.createElement('input')
// //         input.value = e.target.innerHTML
// //         input.type = "number"
// //         input.min = 1
// //         input.max = 9
// //         input.onchange = () => {
// //             e.target.innerHTML = input.value
// //             console.log(input.value)
// //             console.log(matrix)
// //         }
// //         console.log(e.target)
// //         e.target.parentNode.appendChild(input)
// //         console.log(e)
// //     }
// // }

// open_input = () => {
//   console.log(123);
// };
// // populate()
