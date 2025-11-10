import React from 'react';
import { Difficulty } from '../types';

interface DifficultySelectorProps {
  onSelectDifficulty: (difficulty: Difficulty) => void;
  title: string;
  onBack: () => void;
}

const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelectDifficulty, title, onBack }) => {
  const getButtonClass = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-600 hover:bg-green-500';
      case 'Medium':
        return 'bg-yellow-600 hover:bg-yellow-500';
      case 'Hard':
        return 'bg-red-600 hover:bg-red-500';
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-4xl font-bold mb-4">{title}</h2>
      <p className="text-gray-400 mb-8">Choose a difficulty level for the AI opponent.</p>
      <div className="flex flex-col sm:flex-row gap-4">
        {difficulties.map((level) => (
          <button
            key={level}
            onClick={() => onSelectDifficulty(level)}
            className={`px-8 py-4 rounded-md transition-colors text-lg font-semibold w-40 ${getButtonClass(level)}`}
          >
            {level}
          </button>
        ))}
      </div>
      <button onClick={onBack} className="mt-8 px-6 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
        Back to Arcade
      </button>
    </div>
  );
};

export default DifficultySelector;
