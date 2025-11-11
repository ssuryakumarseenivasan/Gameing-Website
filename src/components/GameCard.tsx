import React from 'react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(game)}
      className="bg-gray-800 rounded-lg p-6 flex flex-col items-center text-center cursor-pointer
                 border border-gray-700 hover:border-purple-500 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
    >
      <div className="w-20 h-20 mb-4 text-purple-400">{game.icon}</div>
      <h3 className="text-xl font-bold mb-2">{game.name}</h3>
      <p className="text-gray-400 text-sm">{game.description}</p>
    </div>
  );
};

export default GameCard;