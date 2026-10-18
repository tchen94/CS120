// Local answer dictionary; the remote list expands the accepted guesses.
export const ANSWER_WORDS = [
  "APPLE", "BEACH", "BRAVE", "BREAD", "BRICK", "CHAIR", "CHARM", "CHEST",
  "CLOUD", "CORAL", "DANCE", "DREAM", "EARTH", "FLAME", "FLOOR", "FROST",
  "GHOST", "GIANT", "GLOOM", "GRAPE", "GREEN", "HEART", "HORSE", "HOUSE",
  "LIGHT", "MAGIC", "MANGO", "MIGHT", "MOUSE", "OCEAN", "PAINT", "PEACH",
  "PIANO", "PLANT", "PRIDE", "REACT", "RIVER", "SHORE", "SMILE", "SOUND",
  "SPACE", "SPARK", "STONE", "STORM", "SUGAR", "TABLE", "TIGER", "TRAIN",
  "WATER", "WHEAT"
];

// Credits to https://github.com/darkermango/5-Letter-words for accepted guesses.
let wordBankPromise;

const fetchWords = () => {
  if (!wordBankPromise) {
    wordBankPromise = fetch(
      "https://darkermango.github.io/5-Letter-words/words.json",
    )
      .then((response) => {
        // Catch the errors early
        if (!response.ok) {
          throw new Error(`Could not load words: HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const words = data.words;
        if (!Array.isArray(words) || words.length === 0) {
          throw new Error("The word bank is missing or empty.");
        }
        // Convert all words to uppercase for consistency
        return words.map((word) => word.toUpperCase());
      })
      .catch((error) => {
        wordBankPromise = undefined;
        throw error;
      });
  }
  return wordBankPromise;
};

export const fetchWord = async () => {
  const words = ANSWER_WORDS;
  const word = words[Math.floor(Math.random() * words.length)];
  console.log(`The word is: ${word}`);
  return word;
};

export const fetchValidWords = async () => {
  try {
    const words = await fetchWords();
    return new Set([...ANSWER_WORDS, ...words]);
  } catch (error) {
    console.warn("Using the local word dictionary:", error);
    return new Set(ANSWER_WORDS);
  }
};
