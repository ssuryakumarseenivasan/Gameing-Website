import React, { useState, useCallback } from 'react';
import { RPSChoice, GameResult } from '../types';
import { getAIChoiceRPS, getGameInstructions } from '../services/geminiService';
import Modal from './Modal';
import { RockIcon, PaperIcon, ScissorsIcon } from './icons/RPSIcons';

interface RockPaperScissorsProps {
  onBack: () => void;
}

const choices: RPSChoice[] = ['rock', 'paper', 'scissors'];
const choiceIcons: Record<RPSChoice, React.ReactElement> = {
  rock: <RockIcon />,
  paper: <PaperIcon />,
  scissors: <ScissorsIcon />,
};

const RockPaperScissors: React.FC<RockPaperScissorsProps> = ({ onBack }) => {
  const [playerChoice, setPlayerChoice] = useState<RPSChoice | null>(null);
  const [aiChoice, setAiChoice] = useState<RPSChoice | null>(null);
  const [result, setResult] = useState<GameResult>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(false);

  const determineWinner = useCallback((pChoice: RPSChoice, aChoice: RPSChoice): GameResult => {
    if (pChoice === aChoice) return 'draw';
    if (
      (pChoice === 'rock' && aChoice === 'scissors') ||
      (pChoice === 'scissors' && aChoice === 'paper') ||
      (pChoice === 'paper' && aChoice === 'rock')
    ) {
      return 'win';
    }
    return 'lose';
  }, []);

  const handlePlayerChoice = async (choice: RPSChoice) => {
    setLoading(true);
    setResult(null);
    setAiChoice(null);
    setPlayerChoice(choice);

    const geminiChoice = await getAIChoiceRPS();
    
    setAiChoice(geminiChoice);
    setResult(determineWinner(choice, geminiChoice));
    setLoading(false);
  };

  const handleReset = () => {
    setPlayerChoice(null);
    setAiChoice(null);
    setResult(null);
    setLoading(false);
  };
  
  const handleGetInstructions = async () => {
    setIsModalOpen(true);
    setIsLoadingInstructions(true);
    const fetchedInstructions = await getGameInstructions('Rock Paper Scissors');
    setInstructions(fetchedInstructions);
    setIsLoadingInstructions(false);
  };

  const getResultMessage = () => {
    if (!result) return 'Make your move!';
    switch (result) {
      case 'win': return 'You Win!';
      case 'lose': return 'You Lose!';
      case 'draw': return 'It\'s a Draw!';
    }
  };

  const getResultColor = () => {
    if (!result) return 'text-white';
    switch (result) {
      case 'win': return 'text-green-400';
      case 'lose': return 'text-red-500';
      case 'draw': return 'text-yellow-400';
    }
  };
  
  const ChoiceDisplay: React.FC<{ choice: RPSChoice | null; title: string; isLoading?: boolean }> = ({ choice, title, isLoading = false }) => (
    <div className="flex flex-col items-center">
      <h3 className="text-xl mb-4 text-gray-400">{title}</h3>
      <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-800 rounded-full flex items-center justify-center border-4 border-gray-700">
        {isLoading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        ) : choice ? (
          <div className="w-20 h-20 text-white">{choiceIcons[choice]}</div>
        ) : (
          <span className="text-5xl text-gray-500">?</span>
        )}
      </div>
    </div>
  );


  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Rock Paper Scissors</h2>
      
      <div className="flex justify-around items-center w-full max-w-2xl mb-8 p-4">
        <ChoiceDisplay choice={playerChoice} title="Your Choice" />
        <span className="text-4xl font-bold text-gray-500">VS</span>
        <ChoiceDisplay choice={aiChoice} title="Gemini's Choice" isLoading={loading && !aiChoice} />
      </div>

      <h3 className={`text-3xl font-bold mb-8 h-10 ${getResultColor()}`}>{getResultMessage()}</h3>

      {result ? (
        <button onClick={handleReset} className="px-8 py-3 text-lg bg-purple-600 rounded-md hover:bg-purple-500 transition-colors">Play Again</button>
      ) : (
        <div className="flex space-x-4">
          {choices.map((choice) => (
            <button
              key={choice}
              onClick={() => handlePlayerChoice(choice)}
              disabled={loading}
              className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center
                         hover:bg-purple-600 hover:scale-110 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-16 h-16 text-white">{choiceIcons[choice]}</div>
            </button>
          ))}
        </div>
      )}

      <div className="flex space-x-4 mt-12">
        <button onClick={onBack} className="px-6 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Back</button>
        <button onClick={handleGetInstructions} className="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-500 transition-colors">How to Play</button>
      </div>

       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="How to Play Rock Paper Scissors">
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

export default RockPaperScissors;