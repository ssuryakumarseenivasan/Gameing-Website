import { GoogleGenAI } from "@google/genai";
import { RPSChoice, Difficulty, ConnectFourBoard, MemoryCard } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this environment, we assume it's always present.
  console.warn("API_KEY is not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getGameInstructions = async (gameName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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
        model: 'gemini-2.5-flash',
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
    // Fallback to a random choice if the API fails
    return validChoices[Math.floor(Math.random() * validChoices.length)];
  }
};

export const getAIConnectFourMove = async (board: ConnectFourBoard, difficulty: Difficulty): Promise<number> => {
    const prompt = `
      You are an AI playing Connect Four with ${difficulty} difficulty.
      The current board is a 2D array where 'Red' is the human player and 'Yellow' is you.
      The board state is: ${JSON.stringify(board)}
      It's your turn (Yellow). Choose a column (0-6) to drop your piece.
      - Easy: Pick a valid, mostly random column. Avoid obviously losing moves.
      - Medium: Try to block the player if they have 3 in a row. Try to make your own 3 in a row.
      - Hard: Play optimally. Look for wins, block opponent wins, and set up future traps.
      The top of the board is row 0. A piece falls to the lowest available spot in a column.
      Respond with ONLY the number of the column you choose.
    `;
    
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        const move = parseInt(response.text.trim(), 10);

        // Validate the move
        if (!isNaN(move) && move >= 0 && move <= 6 && board[0][move] === null) {
            return move;
        }
    } catch (error) {
        console.error("Error fetching Connect Four AI move:", error);
    }
    
    // Fallback to a random valid move
    const validColumns = [0, 1, 2, 3, 4, 5, 6].filter(col => board[0][col] === null);
    return validColumns[Math.floor(Math.random() * validColumns.length)];
};


export const getAIMemoryMatchMove = async (cards: MemoryCard[], difficulty: Difficulty): Promise<[number, number]> => {
  const unflippedIndices = cards.map((card, i) => ({...card, i})).filter(c => !c.isMatched && !c.isFlipped).map(c => c.i);
  const flippedCards = cards.map((card, i) => ({...card, i})).filter(c => c.isFlipped && !c.isMatched);
  
  const prompt = `
    You are an AI playing a Memory Match game with ${difficulty} difficulty.
    There are ${cards.length} cards total.
    The current board state is represented by an array of objects: ${JSON.stringify(cards.map(({ value, isFlipped, isMatched }) => ({ value, isFlipped, isMatched })))}
    'isFlipped' means the card is currently visible. 'isMatched' means it has been successfully matched.
    - Easy: Have a poor memory. Mostly guess randomly. If you see a match, take it.
    - Medium: Remember some of the last few cards you've seen. Prioritize known matches.
    - Hard: Have a perfect memory of all previously revealed cards. Always make the optimal move.
    
    Choose two card indices to flip. The indices of available, unmatched cards are: ${unflippedIndices.join(', ')}.
    Respond with ONLY the two indices you choose, separated by a comma (e.g., "3,7").
  `;

  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    const moves = response.text.trim().split(',').map(n => parseInt(n, 10));

    if (moves.length === 2 && !isNaN(moves[0]) && !isNaN(moves[1]) && moves[0] !== moves[1] && unflippedIndices.includes(moves[0]) && unflippedIndices.includes(moves[1])) {
        return [moves[0], moves[1]];
    }
  } catch (error) {
    console.error("Error fetching Memory Match AI move:", error);
  }

  // Fallback to random move
  const firstIndex = unflippedIndices[Math.floor(Math.random() * unflippedIndices.length)];
  let secondIndex;
  do {
    secondIndex = unflippedIndices[Math.floor(Math.random() * unflippedIndices.length)];
  } while (firstIndex === secondIndex);
  
  return [firstIndex, secondIndex];
};