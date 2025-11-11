import React, { useState, useEffect, useCallback } from 'react';
import { getGameInstructions, getHangmanWord } from '../services/geminiService';
import Modal from './Modal';

interface HangmanProps {
  onBack: () => void;
}

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
const MAX_WRONG_GUESSES = 6;
const CATEGORIES = ['Animals', 'Food', 'Technology'];

const Hangman: React.FC<HangmanProps> = ({ onBack }) => {
  const [category, setCategory] = useState<string | null>(null);
  const [secretWord, setSecretWord] = useState<string>('');
  const [hint, setHint] = useState<string>('');
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [instructions, setInstructions] = useState('');

  const wrongGuesses = [...guessedLetters].filter(letter => !secretWord.includes(letter));
  const isWinner = secretWord && secretWord.split('').every(letter => guessedLetters.has(letter));
  const isLoser = wrongGuesses.length >= MAX_WRONG_GUESSES;
  const isGameOver = isWinner || isLoser;

  const startNewGame = useCallback(async (cat: string) => {
    setCategory(cat);
    setIsLoading(true);
    setSecretWord('');
    setHint('');
    setGuessedLetters(new Set());
    const wordData = await getHangmanWord(cat);
    if (wordData) {
      setSecretWord(wordData.word);
      setHint(wordData.hint);
    }
    setIsLoading(false);
  }, []);

  const handleGuess = (letter: string) => {
    if (isGameOver || guessedLetters.has(letter)) return;
    setGuessedLetters(prev => new Set(prev).add(letter));
  };

  const handleGetInstructions = async () => {
    setIsModalOpen(true);
    setIsLoading(true);
    const fetchedInstructions = await getGameInstructions('Hangman');
    setInstructions(fetchedInstructions);
    setIsLoading(false);
  };
  
  const HangmanDrawing = () => (
    <svg viewBox="0 0 100 120" className="w-48 h-56">
      {/* Base */}
      <line x1="10" y1="110" x2="90" y2="110" stroke="white" strokeWidth="4" />
      {/* Pole */}
      <line x1="30" y1="110" x2="30" y2="10" stroke="white" strokeWidth="4" />
      {/* Beam */}
      <line x1="30" y1="10" x2="70" y2="10" stroke="white" strokeWidth="4" />
      {/* Rope */}
      <line x1="70" y1="10" x2="70" y2="30" stroke="white" strokeWidth="4" />
      {/* Head */}
      {wrongGuesses.length > 0 && <circle cx="70" cy="40" r="10" fill="none" stroke="white" strokeWidth="4" />}
      {/* Body */}
      {wrongGuesses.length > 1 && <line x1="70" y1="50" x2="70" y2="80" stroke="white" strokeWidth="4" />}
      {/* Left Arm */}
      {wrongGuesses.length > 2 && <line x1="70" y1="60" x2="50" y2="50" stroke="white" strokeWidth="4" />}
      {/* Right Arm */}
      {wrongGuesses.length > 3 && <line x1="70" y1="60" x2="90" y2="50" stroke="white" strokeWidth="4" />}
      {/* Left Leg */}
      {wrongGuesses.length > 4 && <line x1="70" y1="80" x2="50" y2="100" stroke="white" strokeWidth="4" />}
      {/* Right Leg */}
      {wrongGuesses.length > 5 && <line x1="70" y1="80" x2="90" y2="100" stroke="white" strokeWidth="4" />}
    </svg>
  );

  if (!category) {
    return (
        <div className="flex flex-col items-center text-center">
            <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-400">Hangman</h2>
            <p className="text-gray-400 mb-8">Choose a category for the secret word.</p>
            <div className="flex flex-col sm:flex-row gap-4">
                {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => startNewGame(cat)} className="px-8 py-4 bg-purple-600 rounded-md hover:bg-purple-500 transition-colors text-lg font-semibold">
                        {cat}
                    </button>
                ))}
            </div>
            <button onClick={onBack} className="mt-8 px-6 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
                Back to Arcade
            </button>
        </div>
    );
  }

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400"></div>
            <p className="mt-4 text-lg">Gemini is thinking of a word...</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-400">Hangman</h2>
      
      <div className="mb-4">
        <HangmanDrawing />
      </div>

      <div className="flex gap-2 sm:gap-4 mb-4 text-2xl sm:text-4xl font-mono tracking-widest">
        {secretWord.split('').map((letter, index) => (
          <span key={index} className="w-8 sm:w-12 h-12 sm:h-16 border-b-4 flex items-center justify-center">
            {guessedLetters.has(letter) ? letter.toUpperCase() : ''}
          </span>
        ))}
      </div>
      
      <p className="text-lg text-yellow-300 mb-6 h-6 italic">Hint: {hint}</p>

      {isGameOver ? (
          <div className="text-center">
              <h3 className={`text-3xl font-bold mb-4 ${isWinner ? 'text-green-400' : 'text-red-500'}`}>
                  {isWinner ? "You Win!" : "You Lose!"}
              </h3>
              {!isWinner && <p className="text-xl">The word was: <span className="font-bold">{secretWord.toUpperCase()}</span></p>}
              <button onClick={() => startNewGame(category)} className="mt-4 px-8 py-3 text-lg bg-purple-600 rounded-md hover:bg-purple-500 transition-colors">Play Again</button>
          </div>
      ) : (
          <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {ALPHABET.map(letter => (
                  <button 
                      key={letter}
                      onClick={() => handleGuess(letter)}
                      disabled={guessedLetters.has(letter)}
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-md text-lg sm:text-xl font-bold
                                 hover:bg-purple-600 transition-colors disabled:bg-gray-800 disabled:text-gray-500"
                  >
                      {letter.toUpperCase()}
                  </button>
              ))}
          </div>
      )}

      <div className="flex space-x-4 mt-8">
        <button onClick={onBack} className="px-6 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Back</button>
        <button onClick={() => setCategory(null)} className="px-6 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Change Category</button>
        <button onClick={handleGetInstructions} className="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-500 transition-colors">How to Play</button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="How to Play Hangman">
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

export default Hangman;