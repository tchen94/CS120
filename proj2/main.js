import Board from "./Board.js";
import { fetchWord, fetchValidWords } from "./WordsAPI.js";

// Start the game when the page loads
try {
  const randomWord = await fetchWord();
  const validWords = await fetchValidWords();
  const currentGame = new Board(randomWord, validWords);
  currentGame.initializeGame();
} catch (error) {
  console.error(error);
  document.querySelector(".game-board").textContent =
    "Could not load the game. Please refresh to try again.";
}
