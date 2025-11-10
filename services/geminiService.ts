import { GoogleGenAI } from "@google/genai";
import { RPSChoice, SudokuCell } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const model = 'gemini-2.5-flash';

export const getGameInstructions = async (gameName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model,
        contents: `Explain the rules of ${gameName} in simple, easy-to-understand bullet points for a beginner. Be concise and clear.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching game instructions:", error);
    return `Could not load instructions for ${gameName}. Please check your API key and network connection.`;
  }
};

export const getAIChoiceRPS = async (): Promise<RPSChoice> => {
  const validChoices: RPSChoice[] = ['rock', 'paper', 'scissors'];
  try {
    const response = await ai.models.generateContent({
        model,
        contents: 'You are playing Rock, Paper, Scissors. Choose one of rock, paper, or scissors. Respond with only your choice in lowercase.',
    });
    
    const choice = response.text.trim().toLowerCase() as RPSChoice;

    if (validChoices.includes(choice)) {
      return choice;
    } else {
      console.warn(`Gemini returned an invalid choice: "${choice}". Falling back to random.`);
      return validChoices[Math.floor(Math.random() * validChoices.length)];
    }
  } catch (error) {
    console.error("Error fetching AI choice:", error);
    return validChoices[Math.floor(Math.random() * validChoices.length)];
  }
};

export const getSudokuHint = async (grid: SudokuCell[][]): Promise<{ row: number; col: number; value: number } | null> => {
  const prompt = `
    You are a Sudoku expert. The user needs a hint for the following Sudoku grid.
    'null' represents an empty cell. Provide a single valid number for one of the empty cells.
    Grid state: ${JSON.stringify(grid.map(row => row.map(cell => cell.value)))}
    Respond with ONLY the row index, column index, and the number, separated by commas (e.g., "0,4,5").
    Do not provide any other text.
  `;
  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    const [row, col, value] = response.text.trim().split(',').map(Number);
    if (!isNaN(row) && !isNaN(col) && !isNaN(value)) {
      return { row, col, value };
    }
  } catch (error) {
    console.error("Error fetching Sudoku hint:", error);
  }
  return null;
};

export const getSudokuSolution = async (puzzle: (number | null)[][]): Promise<number[][] | null> => {
  const prompt = `
    You are a Sudoku solver. Solve the following Sudoku puzzle.
    'null' represents an empty cell.
    Puzzle: ${JSON.stringify(puzzle)}
    Respond with ONLY a JSON 2D array representing the solved grid.
    Do not provide any other text, markdown, or explanation.
  `;
  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    const solvedGrid = JSON.parse(response.text.trim());
    return solvedGrid;
  } catch (error) {
    console.error("Error fetching Sudoku solution:", error);
  }
  return null;
};

export const getHangmanWord = async (category: string): Promise<{ word: string; hint: string } | null> => {
    const prompt = `
        You are a word game assistant.
        Generate a single, common, lowercase English word for a game of Hangman. The word should be between 5 and 10 letters long.
        The category is: ${category}.
        Also provide a short, clever hint for the word.
        Respond with ONLY a JSON object in the format {"word": "yourword", "hint": "yourhint"}.
    `;
    try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        const result = JSON.parse(response.text.trim());
        if (result.word && result.hint) {
            return { word: result.word.toLowerCase(), hint: result.hint };
        }
    } catch (error) {
        console.error("Error fetching Hangman word:", error);
    }
    // Fallback
    const fallbacks: { [key: string]: {word: string, hint: string} } = {
        Animals: {word: "elephant", hint: "Has a trunk but isn't a car."},
        Food: {word: "pizza", hint: "A cheesy, round delight from Italy."},
        Technology: {word: "computer", hint: "The device you're likely using right now."}
    }
    return fallbacks[category] || fallbacks.Animals;
};
