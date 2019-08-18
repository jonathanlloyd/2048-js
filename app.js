const make2048 = function(canvas) {
  const GAME_WIDTH = 550;
  const GAME_HEIGHT = 400;
  const FONT_SIZE_PX = 30;
  const LINE_WIDTH_PX = 3;
  const PADDING_PX = 10;

  const COLORS = {
    '2': '#F7F5E4',
    '4': '#DFDCC5',
    '8': '#BFBB8B',
    '16': '#ACAA6A',
    '32': '#9C9B36',
    '64': '#5C6C15',
    '128': '#2A4007',
    '256': '#DAC683',
    '512': '#7E641A',
    '1024': '#533F08',
    '2048': '#091604',
  };

  const directions = {
    left: 'left',
    right: 'right',
  };
  const moves = {
    up: 'up',
    down: 'down',
    left: 'left',
    right: 'right',
  };
  const gameStates = {
    playing: 'playing',
    won: 'won',
    lost: 'lost',
  };

  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;
  const context = canvas.getContext('2d');

  const debugState = state => {
    const width = 4 * (3 + 4);
    let rowStr = '';
    for (let i = 0; i < width; i++) {
      rowStr += '-';
    }

    let output = '';
    for (let row = 0; row < 4; row++) {
      output += rowStr + '\n';
      for (let column = 0; column < 4; column++) {
        let content = state.boxes[row][column] + '';
        let padding = 4 - content.length;
        for (let i = 0; i < padding; i++) {
          content += ' ';
        }
        output += `| ${content} `;
      }
      output += '|\n';
    }
    output += rowStr + '\n';

    return output;
  };

  const copyBoxes = boxes => {
    const newBoxes = [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ];
    for (let row = 0; row < 4; row++) {
      for (let column = 0; column < 4; column++) {
        newBoxes[row][column] = boxes[row][column];
      }
    }
    return newBoxes;
  };

  const compareBoxes = (a, b) => {
    for (let row = 0; row < 4; row++) {
      for (let column = 0; column < 4; column++) {
        if (a[row][column] !== b[row][column]) {
          return false;
        }
      }
    }
    return true;
  };

  const boxesContains = (boxes, value) => {
    for (let row = 0; row < 4; row++) {
      for (let column = 0; column < 4; column++) {
        if (boxes[row][column] === value) {
          return true;
        }
      }
    }
    return false;
  };

  const rotateBoxes = (boxes, direction) => {
    if (direction === directions.left) {
      return [
        [boxes[3][0], boxes[2][0], boxes[1][0], boxes[0][0]],
        [boxes[3][1], boxes[2][1], boxes[1][1], boxes[0][1]],
        [boxes[3][2], boxes[2][2], boxes[1][2], boxes[0][2]],
        [boxes[3][3], boxes[2][3], boxes[1][3], boxes[0][3]],
      ];
    } else {
      return [
        [boxes[0][3], boxes[1][3], boxes[2][3], boxes[3][3]],
        [boxes[0][2], boxes[1][2], boxes[2][2], boxes[3][2]],
        [boxes[0][1], boxes[1][1], boxes[2][1], boxes[3][1]],
        [boxes[0][0], boxes[1][0], boxes[2][0], boxes[3][0]],
      ];
    }
  };

  const moveDown = boxes => {
    const newBoxes = copyBoxes(boxes);
    for (let column = 0; column < 4; column++) {
      let hasSquished = false;
      for (let row = 3; row >= 0; row--) {
        let boxValue = newBoxes[row][column];
        if (boxValue === null) {
          continue;
        }
        let finalNextRow = row;
        for (let nextRow = row + 1; nextRow < 4; nextRow++) {
          const nextValue = newBoxes[nextRow][column];
          const isMatch = nextValue === boxValue;
          if (nextValue !== null && (!isMatch || hasSquished)) {
            break;
          }
          if (isMatch) {
            hasSquished = true;
            boxValue *= 2;
          }
          finalNextRow += 1;
        }
        newBoxes[row][column] = null;
        newBoxes[finalNextRow][column] = boxValue;
      }
    }
    return newBoxes;
  };
  const getNextBoxes = (boxes, move) => {
    let numRotations = null;
    let direction = null;
    switch (move) {
      case moves.up:
        numRotations = 2;
        direction = directions.left;
        break;
      case moves.down:
        numRotations = 0;
        direction = directions.left;
        break;
      case moves.left:
        numRotations = 1;
        direction = directions.right;
        break;
      case moves.right:
        numRotations = 1;
        direction = directions.left;
        break;
    }

    let nextBoxes = copyBoxes(boxes);
    for (let i = 0; i < numRotations; i++) {
      nextBoxes = rotateBoxes(nextBoxes, direction);
    }
    nextBoxes = moveDown(nextBoxes);
    const backDirection =
      direction === directions.right ? directions.left : directions.right;
    for (let i = 0; i < numRotations; i++) {
      nextBoxes = rotateBoxes(nextBoxes, backDirection);
    }

    return nextBoxes;
  };

  const applyMove = (state, move) => {
    const nextBoxes = getNextBoxes(state.boxes, move);
    const somethingMoved = !compareBoxes(state.boxes, nextBoxes);
    if (somethingMoved) {
      let column = randInt(0, 3);
      let row = randInt(0, 3);
      while (nextBoxes[row][column]) {
        column = randInt(0, 3);
        row = randInt(0, 3);
      }
      const value = Math.random() > 0.2 ? 2 : 4;
      nextBoxes[row][column] = value;
    }

    let gameState = gameStates.playing;
    if (boxesContains(nextBoxes, 2048)) {
      gameState = gameStates.won;
    }

    const canMoveInDirection = (state, direction) => {
      const nextBoxes = getNextBoxes(state.boxes, direction);
      return !compareBoxes(state.boxes, nextBoxes);
    };
    const canMove =
      canMoveInDirection(state, moves.up) ||
      canMoveInDirection(state, moves.down) ||
      canMoveInDirection(state, moves.left) ||
      canMoveInDirection(state, moves.right);
    if (!canMove) {
      gameState = gameStates.lost;
    }

    return {boxes: nextBoxes, gameState};
  };

  const colorHexToRGB = hex => {
    const rHex = hex.substring(1, 3);
    const gHex = hex.substring(3, 5);
    const bHex = hex.substring(5, 7);
    return [parseInt(rHex, 16), parseInt(gHex, 16), parseInt(bHex, 16)];
  };
  const colorRGBToHex = rgb => {
    return `#${rgb[0].toString(16)}${rgb[1].toString(16)}${rgb[2].toString(
      16,
    )}`;
  };
  const fontColor = boxColor => {
    const [r, g, b] = colorHexToRGB(boxColor);
    const average = (r + b + g) / 3;
    return average > 128 ? 'black' : 'white';
  };

  const drawGame = (ctx, width, height, state) => {
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${FONT_SIZE_PX}px ubuntu, sans`;
    ctx.textAlign = 'center';

    const largerDimension = Math.min(width, height);
    const gridSize = largerDimension - PADDING_PX;
    const cellSize = gridSize / 4;
    const gridX = (width - gridSize) / 2;
    const gridY = (height - gridSize) / 2;

    // Draw boxes
    for (let row = 0; row < 4; row++) {
      for (let column = 0; column < 4; column++) {
        const boxValue = state.boxes[column][row];
        if (boxValue === null) {
          continue;
        }
        const boxValueStr = '' + boxValue;
        const color = COLORS[boxValueStr];
        const x = gridX + row * cellSize;
        const y = gridY + column * cellSize;
        const textX = x + cellSize / 2;
        const textY = y + cellSize / 2 + FONT_SIZE_PX / 2;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.fillStyle = fontColor(color);
        ctx.fillText(boxValueStr, textX, textY);
      }
    }

    // Draw grid
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = LINE_WIDTH_PX;
    // Columns
    for (let i = 0; i < 5; i++) {
      const x = gridX + i * cellSize;
      const lineTop = gridY;
      const lineBottom = gridY + gridSize;
      ctx.beginPath();
      ctx.moveTo(x, lineTop);
      ctx.lineTo(x, lineBottom);
      ctx.stroke();
    }
    // Rows
    for (let i = 0; i < 5; i++) {
      const y = gridY + i * cellSize;
      const lineLeft = gridX;
      const lineRight = gridX + gridSize;
      ctx.beginPath();
      ctx.moveTo(lineLeft, y);
      ctx.lineTo(lineRight, y);
      ctx.stroke();
    }

    // Draw Overlay
    let alpha = 0.2;
    let text = null;
    switch (state.gameState) {
      case gameStates.won:
        text = 'You win!';
        break;
      case gameStates.lost:
        text = 'You lose.';
        break;
    }
    if (text !== null) {
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = 'gray';
      ctx.fillRect(gridX, gridY, gridSize, gridSize);
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = 'white';
      ctx.fillText(text, width / 2, height / 2);
    }
  };

  const randInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const state = {
    boxes: [
      [2, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ],
    gameState: gameStates.playing,
  };
  let currentState = state;
  let states = [];
  drawGame(context, GAME_WIDTH, GAME_HEIGHT, currentState);
  document.addEventListener('keydown', e => {
    const key = e.keyCode;
    switch (key) {
      case 38:
        states.push(currentState);
        currentState = applyMove(currentState, moves.up);
        break;
      case 40:
        states.push(currentState);
        currentState = applyMove(currentState, moves.down);
        break;
      case 37:
        states.push(currentState);
        currentState = applyMove(currentState, moves.left);
        break;
      case 39:
        states.push(currentState);
        currentState = applyMove(currentState, moves.right);
        break;
      case 85:
        currentState = states.pop();
        break;
      case 82:
        currentState = {
          boxes: rotateBoxes(currentState.boxes, directions.right),
          gameState: gameStates.playing,
        };
        break;
      case 83:
        currentState = state;
        break;
    }
    drawGame(context, GAME_WIDTH, GAME_HEIGHT, currentState);
  });
};
