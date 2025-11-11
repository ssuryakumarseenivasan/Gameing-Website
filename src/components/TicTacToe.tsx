import React, { useState, useEffect } from 'react';
import { Board, Player } from '../types';
import { getGameInstructions } from '../services/geminiService';
import Modal from './Modal';

interface TicTacToeProps {
  onBack: () => void;
}

const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

const TicTacToe: React.FC<TicTacToeProps> = ({ onBack }) => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(false);

  const checkWinner = (currentBoard: Board) => {
    for (const combo of winningCombos) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return currentBoard[a];
      }
    }
    if (currentBoard.every(cell => cell !== null)) {
      return 'Draw';
    }
    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const newWinner = checkWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
  };
  
  const handleGetInstructions = async () => {
    setIsModalOpen(true);
    setIsLoadingInstructions(true);
    const fetchedInstructions = await getGameInstructions('Tic-Tac-Toe');
    setInstructions(fetchedInstructions);
    setIsLoadingInstructions(false);
  };

  const getStatusMessage = () => {
    if (winner) {
      return winner === 'Draw' ? 'It\'s a Draw!' : `Player ${winner} wins!`;
    }
    return `Current Player: ${currentPlayer}`;
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Tic-Tac-Toe</h2>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {board.map((value, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className={`w-24 h-24 md:w-32 md:h-32 bg-gray-800 rounded-lg text-5xl font-bold flex items-center justify-center
                        transition-colors duration-200 ${!value && !winner ? 'hover:bg-gray-700' : ''}
                        ${value === 'X' ? 'text-cyan-400' : 'text-pink-500'}`}
          >
            {value}
          </button>
        ))}
      </div>
      <p className="text-xl h-8 mb-4">{getStatusMessage()}</p>
      <div className="flex space-x-4">
        <button onClick={onBack} className="px-6 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Back</button>
        <button onClick={handleReset} className="px-6 py-2 bg-purple-600 rounded-md hover:bg-purple-500 transition-colors">Reset Game</button>
        <button onClick={handleGetInstructions} className="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-500 transition-colors">How to Play</button>
      </div>

       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="How to Play Tic-Tac-Toe">
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

export default TicTacToe;