// Board Class to create the game board
class Board {
  static KEYS = {
    Q: "Q",
    W: "W",
    E: "E",
    R: "R",
    T: "T",
    Y: "Y",
    U: "U",
    I: "I",
    O: "O",
    P: "P",
    A: "A",
    S: "S",
    D: "D",
    F: "F",
    G: "G",
    H: "H",
    J: "J",
    K: "K",
    L: "L",
    Z: "Z",
    X: "X",
    C: "C",
    V: "V",
    B: "B",
    N: "N",
    M: "M",
    ENTER: "ENTER",
    BACKSPACE: "⌫",
  };

  static COLORS = {
    correct: "#6aaa64",
    present: "#c9b458",
    absent: "#787c7e",
  };

  constructor(word, validWords) {
    this.rows = 6;
    this.cols = 5;
    this.word = word;
    this.validWords = validWords;
    this.gameState = {
      currentRow: 0,
      currentCol: 0,
      board: Array.from({ length: this.rows }, () => Array(this.cols).fill("")),
      guesses: [],
      isGameOver: false,
    };
  }

  createBoard() {
    const board = document.querySelector(".game-board");
    for (let i = 0; i < this.rows; i++) {
      const row = document.createElement("div");
      row.classList.add("row");
      board.appendChild(row);
      for (let j = 0; j < this.cols; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        row.appendChild(cell);
      }
    }
  }

  createInputField() {
    const board = document.querySelector(".game-board");
    const inputField = document.createElement("input");
    inputField.type = "text";
    // Disable autocomplete to prevent browser suggestions
    inputField.autocomplete = "off";
    inputField.maxLength = this.cols;
    inputField.classList.add("input-field");
    board.appendChild(inputField);
    this.submitButton = document.createElement("button");
    this.submitButton.type = "button";
    this.submitButton.textContent = "Submit guess";
    this.submitButton.classList.add("submit-button");
    board.appendChild(this.submitButton);
    inputField.focus();
  }

  createWordleKeyboard() {
    const keyboard = document.createElement("div");
    keyboard.classList.add("keyboard");
    keyboard.setAttribute("role", "group");
    keyboard.setAttribute("aria-label", "On-screen keyboard");
    // to match the staggered layout that the actual Wordle uses
    const keys = Object.keys(Board.KEYS);
    const keyRows = [
      keys.slice(0, 10),
      keys.slice(10, 19),
      ["ENTER", ...keys.slice(19, 26), "BACKSPACE"],
    ];

    keyRows.forEach((keys) => {
      const row = document.createElement("div");
      row.classList.add("keyboard-row");

      keys.forEach((key) => {
        const keyButton = document.createElement("button");
        keyButton.type = "button";
        keyButton.textContent = Board.KEYS[key];
        keyButton.dataset.key = key;
        keyButton.setAttribute("aria-label", key);
        keyButton.classList.add("key");
        keyButton.addEventListener("click", () => {
          if (this.gameState.isGameOver) return;
          const input = document.querySelector(".input-field");
          if (key === "ENTER") {
            this.submitGuess();
          } else if (key === "BACKSPACE") {
            input.value = input.value.slice(0, -1);
          } else if (input.value.length < this.cols) {
            input.value += key;
          }
          if (!this.gameState.isGameOver) input.focus();
        });
        // This matches the ENTER and BACKSPACE keys on Wordle
        if (key === "ENTER" || key === "BACKSPACE") {
          keyButton.classList.add("key-wide");
        }
        row.appendChild(keyButton);
      });

      keyboard.appendChild(row);
    });
    document.body.appendChild(keyboard);
  }

  createRestartButton() {
    this.restartButton = document.createElement("button");
    this.restartButton.type = "button";
    this.restartButton.textContent = "Play again";
    this.restartButton.classList.add("restart-button");
    this.restartButton.hidden = true;
    this.restartButton.addEventListener("click", () => {
      // Reload the page to start a new game
      window.location.reload();
    });

    this.submitButton.after(this.restartButton);
  }

  /**
   * Update a cell on the game board.
   *
   * @param {number} row
   * @param {number} col
   * @param {string} letter
   */
  updateCell(row, col, letter) {
    const board = document.querySelector(".game-board");
    const cell = board.children[row].children[col];
    cell.textContent = letter;
    this.gameState.board[row][col] = letter;
  }

  /**
   * Update the current row with the results of the user's guess.
   *
   * @param {string[]} results
   */
  updateCurrentRow(results) {
    const board = document.querySelector(".game-board");
    results.forEach((result, i) => {
      const cell = board.children[this.gameState.currentRow].children[i];
      cell.style.backgroundColor = Board.COLORS[result];
      cell.style.color = "#ffffff";
    });
  }

  /**
   * Update the keyboard colors based on the results of the user's guess.
   *
   * @param {string[]} results
   */
  updateKeyboard(results) {
    const keyboard = document.querySelector(".keyboard");
    const priority = { absent: 1, present: 2, correct: 3 };

    results.forEach((result, i) => {
      const key = this.gameState.board[this.gameState.currentRow][i];
      const keyButton = keyboard.querySelector(`button[data-key="${key}"]`);
      if (keyButton) {
        // Only update the key color if it's not already correct
        if ((priority[keyButton.dataset.status] || 0) < priority[result]) {
          keyButton.dataset.status = result;
          keyButton.style.backgroundColor = Board.COLORS[result];
          keyButton.style.color = "#ffffff";
        }
      }
    });
  }

  /**
   * Validate the user's input to ensure it is a valid guess.
   *
   * @param {string} userGuess
   * @returns
   */
  validateInput(userGuess) {
    if (!/^[A-Z]{5}$/.test(userGuess)) {
      alert(`Please enter a ${this.cols}-letter word.`);
      return false;
    }

    // Check if the input is an actual word
    if (!this.validWords.has(userGuess)) {
      alert("Word not in the word list.");
      return false;
    }
    return true;
  }

  /**
   * Check the user's guess against the correct word.
   *
   * @param {string} userGuess
   */
  checkGuess(userGuess) {
    const correctWord = this.word.split("");
    /**
     * We check the guess against the correct word.
     * Like Wordle, we first check for correct letters in the correct
     * position, then check for correct letters in the wrong position,
     * and finally mark the remaining letters as incorrect.
     *
     * We'll also update the keyboard colors based on the results
     */
    const results = Array(this.cols).fill("absent");
    for (let i = 0; i < userGuess.length; i++) {
      if (userGuess[i] === correctWord[i]) {
        results[i] = "correct";
        correctWord[i] = null; // Mark this letter as used
      }
    }

    for (let i = 0; i < userGuess.length; i++) {
      if (results[i] === "correct") continue;
      if (correctWord.includes(userGuess[i])) {
        results[i] = "present";
        correctWord[correctWord.indexOf(userGuess[i])] = null; // Mark this letter as used
      }
    }
    // Update each cell with the user's guess
    for (let i = 0; i < userGuess.length; i++) {
      this.updateCell(this.gameState.currentRow, i, userGuess[i]);
    }

    // Update the colors of the cells based on the results
    this.updateCurrentRow(results);

    // Update the colors of the keys on the keyboard
    this.updateKeyboard(results);
  }

  /**
   * Play the game while listening for user input.
   * The game ends when the user guesses the word or runs out of attempts.
   * If the user guesses the word, they are congratulated and given the option to play again.
   * If the user runs out of attempts, they are shown the correct word and given the option to play again.
   */
  playWordle() {
    const inputField = document.querySelector(".input-field");

    inputField.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.submitGuess();
      }
    });

    this.submitButton.addEventListener("click", () => this.submitGuess());
  }

  /**
   * Submit the user's guess and check it against the correct word.
   * @returns {boolean} - True if the guess is valid, false otherwise.
   */
  submitGuess() {
    const state = this.gameState;
    if (state.isGameOver) return;
    const inputField = document.querySelector(".input-field");
    const userGuess = inputField.value.toUpperCase();
    if (!this.validateInput(userGuess)) return;

    this.checkGuess(userGuess);
    state.guesses.push(userGuess);
    const win = userGuess === this.word;
    if (win || state.currentRow === this.rows - 1) {
      state.isGameOver = true;
      inputField.disabled = true;
      this.submitButton.disabled = true;
      this.restartButton.hidden = false;
      // Allow the browser to paint the final row before alert blocks rendering.
      // Believe this is a race condition, but this will work for now.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          alert(
            win
              ? "Congratulations! You've guessed the word!"
              : `Game Over! The correct word was: ${this.word}`,
          );
          this.restartButton.focus();
        });
      });
    } else {
      state.currentRow++;
      inputField.focus();
    }
    inputField.value = "";
  }

  /**
   * Initialize the game by creating the board, input field, keyboard, and restart button.
   * Also starts the game loop to listen for user input.
   */
  initializeGame() {
    this.createBoard();
    this.createInputField();
    this.createWordleKeyboard();
    this.createRestartButton();
    this.playWordle();
  }
}

export default Board;
