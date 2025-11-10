import React, { useState, useEffect } from 'react';
import { ConnectFourBoard, ConnectFourPlayer, Difficulty } from '../types';
import { getGameInstructions } from '../services/geminiService';
import Modal from './Modal';
import DifficultySelector from './DifficultySelector';

interface ConnectFourProps {
  onBack: () => void;
}

const ROWS = 6;
const COLS = 7;

const createEmptyBoard = (): ConnectFourBoard => Array(ROWS).fill(null).map(() => Array(COLS).fill(null));

const ConnectFour: React.FC<ConnectFourProps> = ({ onBack }) => {
  const [board, setBoard] = useState<ConnectFourBoard>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<ConnectFourPlayer>('Red');
  const [winner, setWinner] = useState<ConnectFourPlayer | 'Draw' | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [isAITurn, setIsAITurn] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(false);
  
  const checkWinnerForPlayer = (b: ConnectFourBoard, p: ConnectFourPlayer): boolean => {
    // Check horizontal, vertical, and diagonal wins
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
          if (c + 3 < COLS && b[r][c] === p && b[r][c+1] === p && b[r][c+2] === p && b[r][c+3] === p) return true;
          if (r + 3 < ROWS) {
            if (b[r][c] === p && b[r+1][c] === p && b[r+2][c] === p && b[r+3][c] === p) return true;
            if (c + 3 < COLS && b[r][c] === p && b[r+1][c+1] === p && b[r+2][c+2] === p && b[r+3][c+3] === p) return true;
            if (c - 3 >= 0 && b[r][c] === p && b[r+1][c-1] === p && b[r+2][c-2] === p && b[r+3][c-3] === p) return true;
          }
      }
    }
    return false;
  };

  const calculateLocalAIMove = (b: ConnectFourBoard, diff: Difficulty): number => {
      const validColumns = [0,1,2,3,4,5,6].filter(c => b[0][c] === null);

      // --- Hard / Medium Logic: Offensive and Defensive checks ---
      if (diff === 'Hard' || diff === 'Medium') {
          // 1. Check for a winning move for AI
          for (const col of validColumns) {
              const tempBoard = b.map(r => [...r]);
              for (let r = ROWS - 1; r >= 0; r--) {
                  if (tempBoard[r][col] === null) {
                      tempBoard[r][col] = 'Yellow';
                      if (checkWinnerForPlayer(tempBoard, 'Yellow')) return col;
                      break;
                  }
              }
          }
          // 2. Check to block player's winning move
          for (const col of validColumns) {
              const tempBoard = b.map(r => [...r]);
              for (let r = ROWS - 1; r >= 0; r--) {
                  if (tempBoard[r][col] === null) {
                      tempBoard[r][col] = 'Red';
                      if (checkWinnerForPlayer(tempBoard, 'Red')) return col;
                      break;
                  }
              }
          }
      }

      // --- Hard Logic: Center preference ---
      if (diff === 'Hard') {
          const centerOrder = [3, 2, 4, 1, 5, 0, 6];
          for (const col of centerOrder) {
              if (validColumns.includes(col)) return col;
          }
      }
      
      // --- Easy / Fallback Logic: Random valid move ---
      return validColumns[Math.floor(Math.random() * validColumns.length)];
  }


  useEffect(() => {
    if (currentPlayer === 'Yellow' && !winner && difficulty) {
      setIsAITurn(true);
      const makeAIMove = () => {
        const aiMoveCol = calculateLocalAIMove(board, difficulty);
        handleDrop(aiMoveCol);
      };
      // Add a slight delay for better UX
      setTimeout(makeAIMove, 500);
    } else {
        setIsAITurn(false);
    }
  }, [currentPlayer, winner, difficulty, board]);
  
  const checkWinner = (currentBoard: ConnectFourBoard): ConnectFourPlayer | 'Draw' | null => {
    if (checkWinnerForPlayer(currentBoard, 'Red')) return 'Red';
    if (checkWinnerForPlayer(currentBoard, 'Yellow')) return 'Yellow';
    if (currentBoard[0].every(cell => cell !== null)) return 'Draw';
    return null;
  };
  
  const handleDrop = (col: number) => {
    if (winner || board[0][col] !== null) return;

    let newBoard = board.map(row => [...row]);
    let row = ROWS - 1;
    while (row >= 0) {
      if (newBoard[row][col] === null) {
        newBoard[row][col] = currentPlayer;
        break;
      }
      row--;
    }

    if (row < 0) return; // Column is full

    setBoard(newBoard);
    const newWinner = checkWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
    } else {
      setCurrentPlayer(currentPlayer === 'Red' ? 'Yellow' : 'Red');
    }
  };

  const handleReset = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer('Red');
    setWinner(null);
  };
  
  const handleGetInstructions = async () => {
    setIsModalOpen(true);
    setIsLoadingInstructions(true);
    const fetchedInstructions = await getGameInstructions('Connect Four');
    setInstructions(fetchedInstructions);
    setIsLoadingInstructions(false);
  };

  const getStatusMessage = () => {
    if (winner) {
      if (winner === 'Draw') return 'It\'s a Draw!';
      return winner === 'Red' ? 'You Win!' : 'AI Wins!';
    }
    return isAITurn ? "AI is thinking..." : "Your turn";
  };
  
  if (!difficulty) {
    return <DifficultySelector onSelectDifficulty={setDifficulty} title="Connect Four" onBack={onBack} />;
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-400">Connect Four</h2>
      <p className={`text-xl h-8 mb-4 font-semibold ${winner === 'Red' ? 'text-green-400' : winner === 'Yellow' ? 'text-red-500' : ''}`}>{getStatusMessage()}</p>
      
      <div className="bg-blue-800 p-3 rounded-lg shadow-2xl">
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: COLS }).map((_, colIndex) => (
            <div key={colIndex} onClick={() => !isAITurn && handleDrop(colIndex)} className="cursor-pointer">
              {Array.from({ length: ROWS }).map((_, rowIndex) => (
                  <div key={rowIndex} className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center p-1">
                    <div className={`w-full h-full rounded-full ${board[rowIndex][colIndex] === 'Red' ? 'bg-red-500' : board[rowIndex][colIndex] === 'Yellow' ? 'bg-yellow-400' : 'bg-gray-900'} transition-colors duration-300`}></div>
                  </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-4 mt-6">
        <button onClick={onBack} className="px-6 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Back</button>
        <button onClick={handleReset} className="px-6 py-2 bg-purple-600 rounded-md hover:bg-purple-500 transition-colors">New Game</button>
        <button onClick={handleGetInstructions} className="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-500 transition-colors">How to Play</button>
      </div>

       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="How to Play Connect Four">
        {isLoadingInstructions ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap font-sans text-gray-300">{instructions}</pre>
        )}
      </Modal>
    </div>
  );
};

export default ConnectFour;