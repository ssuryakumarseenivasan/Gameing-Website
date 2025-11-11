import React, { useState, useEffect, useRef } from 'react';
import { MemoryCard, Difficulty } from '../types';
import { getGameInstructions } from '../services/geminiService';
import Modal from './Modal';
import DifficultySelector from './DifficultySelector';

interface MemoryMatchProps {
  onBack: () => void;
}

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

const generateCards = (): MemoryCard[] => {
  const deck = [...EMOJIS, ...EMOJIS];
  return deck
    .map((value, index) => ({ id: index, value, isFlipped: false, isMatched: false }))
    .sort(() => Math.random() - 0.5);
};

const MemoryMatch: React.FC<MemoryMatchProps> = ({ onBack }) => {
  const [cards, setCards] = useState<MemoryCard[]>(generateCards());
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [playerMoves, setPlayerMoves] = useState(0);
  const [aiMoves, setAiMoves] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(false);

  // AI Memory
  const aiMemory = useRef<Map<string, number[]>>(new Map());

  useEffect(() => {
    // Update AI memory whenever cards are flipped
    flippedIndices.forEach(index => {
        const card = cards[index];
        if (!aiMemory.current.has(card.value)) {
            aiMemory.current.set(card.value, []);
        }
        if (!aiMemory.current.get(card.value)!.includes(index)) {
            aiMemory.current.get(card.value)!.push(index);
        }
    });
  }, [flippedIndices, cards]);

  const makeLocalAIMove = () => {
    setAiMoves(prev => prev + 1);
    const availableIndices = cards.map((c, i) => i).filter(i => !cards[i].isMatched);
    
    // Hard / Medium: Look for a known match
    if (difficulty === 'Hard' || difficulty === 'Medium') {
        for (const [value, indices] of aiMemory.current.entries()) {
            if (indices.length === 2) {
                const card1 = cards[indices[0]];
                const card2 = cards[indices[1]];
                if (!card1.isMatched && !card2.isMatched) {
                    flipCardsForAI(indices[0], indices[1]);
                    return;
                }
            }
        }
    }

    // Easy / Medium Fallback: Flip one known and one random, or two random
    let firstIndex = -1;
    let secondIndex = -1;

    if (difficulty !== 'Hard' && Math.random() > 0.5) { // Imperfect memory for Medium/Easy
        // Guess randomly
    } else {
         // Try to use memory
        const knownUnmatched = Array.from(aiMemory.current.values()).find(indices => indices.length === 1 && !cards[indices[0]].isMatched);
        if (knownUnmatched) {
            firstIndex = knownUnmatched[0];
        }
    }

    // Pick random cards
    const getShuffledAvailable = () => availableIndices.sort(() => Math.random() - 0.5);

    if (firstIndex === -1) {
        [firstIndex, secondIndex] = getShuffledAvailable().slice(0, 2);
    } else {
        do {
            secondIndex = getShuffledAvailable()[0];
        } while (firstIndex === secondIndex);
    }
    
    flipCardsForAI(firstIndex, secondIndex);
  };

  const flipCardsForAI = (first: number, second: number) => {
    setTimeout(() => {
        setCards(prev => prev.map((card, index) => (index === first || index === second) ? { ...card, isFlipped: true } : card));
        setFlippedIndices([first, second]);
    }, 500);
  }

  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [firstIndex, secondIndex] = flippedIndices;
      if (cards[firstIndex].value === cards[secondIndex].value) {
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.value === cards[firstIndex].value ? { ...card, isMatched: true, isFlipped: true } : card
          ));
          setFlippedIndices([]);
          if (!isPlayerTurn && !getIsGameOver()) {
            setTimeout(makeLocalAIMove, 1000);
          }
        }, 800);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((card, index) =>
            flippedIndices.includes(index) ? { ...card, isFlipped: false } : card
          ));
          setFlippedIndices([]);
          setIsPlayerTurn(prev => !prev);
        }, 1200);
      }
    }
  }, [flippedIndices, cards, isPlayerTurn]);
  
  useEffect(() => {
    if (!isPlayerTurn && !getIsGameOver() && difficulty) {
       setTimeout(makeLocalAIMove, 1000);
    }
  }, [isPlayerTurn, difficulty]);


  const handleCardClick = (index: number) => {
    if (!isPlayerTurn || flippedIndices.length === 2 || cards[index].isFlipped) {
      return;
    }
    
    if (flippedIndices.length === 0) {
        setPlayerMoves(prev => prev + 1);
    }
    
    const newFlippedIndices = [...flippedIndices, index];
    setCards(prev => prev.map((card, i) => i === index ? { ...card, isFlipped: true } : card));
    setFlippedIndices(newFlippedIndices);
  };

  const handleReset = () => {
    setCards(generateCards());
    setFlippedIndices([]);
    setIsPlayerTurn(true);
    setPlayerMoves(0);
    setAiMoves(0);
    aiMemory.current.clear();
  };
  
  const handleGetInstructions = async () => {
    setIsModalOpen(true);
    setIsLoadingInstructions(true);
    const fetchedInstructions = await getGameInstructions('Memory Match');
    setInstructions(fetchedInstructions);
    setIsLoadingInstructions(false);
  };
  
  const getIsGameOver = () => cards.every(card => card.isMatched);

  const getStatusMessage = () => {
    if (getIsGameOver()) {
        if (playerMoves < aiMoves) return 'You Win!';
        if (aiMoves < playerMoves) return 'AI Wins!';
        return "It's a Draw!";
    }
    return isPlayerTurn ? "Your turn" : "AI's turn";
  };
  
  if (!difficulty) {
    return <DifficultySelector onSelectDifficulty={setDifficulty} title="Memory Match" onBack={onBack} />;
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Memory Match</h2>
      <div className="flex justify-between w-full max-w-sm mb-4 text-lg">
          <span>You: {playerMoves}</span>
          <span className="font-semibold">{getStatusMessage()}</span>
          <span>AI: {aiMoves}</span>
      </div>
      
      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-800 rounded-lg">
        {cards.map((card, index) => (
          <div key={card.id} className="w-16 h-20 md:w-20 md:h-24 perspective" onClick={() => handleCardClick(index)}>
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${card.isFlipped ? 'rotate-y-180' : ''}`}>
              <div className="absolute w-full h-full bg-purple-600 rounded-lg flex items-center justify-center backface-hidden">
                <span className="text-2xl">?</span>
              </div>
              <div className="absolute w-full h-full bg-gray-700 rounded-lg flex items-center justify-center rotate-y-180 backface-hidden">
                <span className="text-4xl">{card.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .perspective { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
      
      <div className="flex space-x-4 mt-6">
        <button onClick={onBack} className="px-6 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Back</button>
        <button onClick={handleReset} className="px-6 py-2 bg-purple-600 rounded-md hover:bg-purple-500 transition-colors">New Game</button>
        <button onClick={handleGetInstructions} className="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-500 transition-colors">How to Play</button>
      </div>

       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="How to Play Memory Match">
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

export default MemoryMatch;