import React, { useState, useMemo, useCallback } from 'react';
import { SudokuCell, Difficulty } from '../types';
import { getGameInstructions, getSudokuHint, getSudokuSolution } from '../services/geminiService';
import Modal from './Modal';
import DifficultySelector from './DifficultySelector';

interface SudokuProps {
  onBack: () => void;
}

const puzzles: Record<Difficulty, string> = {
  Easy: '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79',
  Medium: '.2.6.8...58...9..7......4.1.9.5...2...7.8...3.5.1.4......3..2...69...4.3.7.',
  Hard: '8..........36......7..9.2...5...7.......457.....1...3...1....68..85...1..9....4..',
};

const parsePuzzle = (puzzleString: string): SudokuCell[][] => {
  const grid: SudokuCell[][] = [];
  for (let r = 0; r < 9; r++) {
    const row: SudokuCell[] = [];
    for (let c = 0; c < 9; c++) {
      const char = puzzleString[r * 9 + c];
      const value = char === '.' ? null : parseInt(char, 10);
      row.push({ value, isGiven: value !== null, isInvalid: false });
    }
    grid.push(row);
  }
  return grid;
};

const Sudoku: React.FC<SudokuProps> = ({ onBack }) => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [grid, setGrid] = useState<SudokuCell[][] | null>(null);
  const [initialGrid, setInitialGrid] = useState<(number | null)[][] | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateGrid = useCallback((currentGrid: SudokuCell[][]): SudokuCell[][] => {
    const newGrid = currentGrid.map(row => row.map(cell => ({ ...cell, isInvalid: false })));
    
    const checkUniqueness = (arr: (number | null)[]): number[] => {
        const counts: { [key: number]: number[] } = {};
        arr.forEach((val, index) => {
            if (val !== null) {
                if (!counts[val]) counts[val] = [];
                counts[val].push(index);
            }
        });
        const invalidIndices: number[] = [];
        Object.values(counts).forEach(indices => {
            if (indices.length > 1) {
                invalidIndices.push(...indices);
            }
        });
        return invalidIndices;
    };

    // Check rows and columns
    for (let i = 0; i < 9; i++) {
        const rowVals = newGrid[i].map(cell => cell.value);
        const colVals = newGrid.map(row => row[i].value);
        checkUniqueness(rowVals).forEach(c => newGrid[i][c].isInvalid = true);
        checkUniqueness(colVals).forEach(r => newGrid[r][i].isInvalid = true);
    }

    // Check 3x3 boxes
    for (let boxR = 0; boxR < 9; boxR += 3) {
        for (let boxC = 0; boxC < 9; boxC += 3) {
            const boxVals: { val: number | null, r: number, c: number }[] = [];
            for (let r = boxR; r < boxR + 3; r++) {
                for (let c = boxC; c < boxC + 3; c++) {
                    boxVals.push({ val: newGrid[r][c].value, r, c });
                }
            }
            const invalidIndicesInBox = checkUniqueness(boxVals.map(bv => bv.val));
            invalidIndicesInBox.forEach(idx => {
                const {r, c} = boxVals[idx];
                newGrid[r][c].isInvalid = true;
            })
        }
    }
    
    return newGrid;
  }, []);

  const handleInputChange = (row: number, col: number, value: string) => {
    if (!grid) return;
    const num = value === '' ? null : parseInt(value, 10);
    if (num !== null && (isNaN(num) || num < 1 || num > 9)) return;

    const newGrid = grid.map(r => r.map(c => ({ ...c })));
    if (!newGrid[row][col].isGiven) {
      newGrid[row][col].value = num;
      setGrid(validateGrid(newGrid));
    }
  };
  
  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    const parsedGrid = parsePuzzle(puzzles[diff]);
    setGrid(parsedGrid);
    setInitialGrid(parsedGrid.map(row => row.map(cell => cell.value)));
  };

  const handleReset = () => {
    if (difficulty) startGame(difficulty);
  };
  
  const handleGetInstructions = async () => {
    setIsModalOpen(true);
    setIsLoading(true);
    const fetchedInstructions = await getGameInstructions('Sudoku');
    setInstructions(fetchedInstructions);
    setIsLoading(false);
  };

  const handleGetHint = async () => {
    if (!grid) return;
    setIsLoading(true);
    const hint = await getSudokuHint(grid);
    if (hint) {
      const { row, col, value } = hint;
      const newGrid = grid.map(r => r.map(c => ({...c})));
      newGrid[row][col].value = value;
      setGrid(validateGrid(newGrid));
    }
    setIsLoading(false);
  };

  const handleSolve = async () => {
    if (!initialGrid) return;
    setIsLoading(true);
    const solution = await getSudokuSolution(initialGrid);
    if (solution) {
        const solvedGrid = solution.map((row, r) => row.map((val, c) => ({
            value: val,
            isGiven: initialGrid[r][c] !== null,
            isInvalid: false
        })));
        setGrid(solvedGrid);
    }
    setIsLoading(false);
  };

  if (!difficulty || !grid) {
    return <DifficultySelector onSelectDifficulty={startGame} title="Sudoku" onBack={onBack} />;
  }

  const isSolved = grid.every(row => row.every(cell => cell.value !== null && !cell.isInvalid));
  
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Sudoku</h2>
      {isSolved && <p className="text-xl h-8 mb-4 font-semibold text-green-400">Congratulations! You solved it!</p>}
      {!isSolved && <p className="text-xl h-8 mb-4 font-semibold">{difficulty} Puzzle</p>}
      
      <div className="bg-gray-800 p-2 rounded-lg shadow-2xl grid grid-cols-9 gap-px">
        {grid.map((row, rIndex) => 
          row.map((cell, cIndex) => (
            <input
              key={`${rIndex}-${cIndex}`}
              type="number"
              min="1"
              max="9"
              value={cell.value || ''}
              onChange={(e) => handleInputChange(rIndex, cIndex, e.target.value)}
              readOnly={cell.isGiven}
              className={`w-10 h-10 md:w-12 md:h-12 text-center text-2xl font-semibold rounded-sm
                ${cell.isGiven ? 'bg-gray-700 text-white' : 'bg-gray-600 text-cyan-300'}
                ${cell.isInvalid && !cell.isGiven ? 'bg-red-500/50 text-white' : ''}
                ${(cIndex + 1) % 3 === 0 && cIndex < 8 ? 'mr-0.5' : ''}
                ${(rIndex + 1) % 3 === 0 && rIndex < 8 ? 'mb-0.5' : ''}
                focus:outline-none focus:ring-2 focus:ring-purple-500 z-10`}
            />
          ))
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-6">
        <button onClick={onBack} className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Back</button>
        <button onClick={handleReset} className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-500 transition-colors">New Game</button>
        <button onClick={handleGetHint} disabled={isLoading} className="px-4 py-2 bg-yellow-600 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-50">Hint</button>
        <button onClick={handleSolve} disabled={isLoading} className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-500 transition-colors disabled:opacity-50">Solve</button>
        <button onClick={handleGetInstructions} className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-500 transition-colors">How to Play</button>
      </div>

       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="How to Play Sudoku">
        {isLoading ? (
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

export default Sudoku;