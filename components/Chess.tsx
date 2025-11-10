
import React, { useState, useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { getGameInstructions } from '../services/geminiService';
import Modal from './Modal';
import { ChessGameMode } from '../types';

interface ChessProps {
  onBack: () => void;
}

const ChessComponent: React.FC<ChessProps> = ({ onBack }) => {
  const game = useMemo(() => new Chess(), []);
  const [fen, setFen] = useState(game.fen());
  const [gameMode, setGameMode] = useState<ChessGameMode | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(false);
  
  const [importedFen, setImportedFen] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (copyStatus) {
      const timer = setTimeout(() => setCopyStatus(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyStatus]);

  function onDrop(sourceSquare: string, targetSquare: string) {
    let move = null;
    try {
      move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // always promote to a queen for simplicity
      });
    } catch (error) {
      return false; // illegal move
    }

    if (move === null) return false; // illegal move

    setFen(game.fen());
    return true;
  }

  const handleReset = () => {
    game.reset();
    setFen(game.fen());
  };

  const handleGetInstructions = async () => {
    setIsModalOpen(true);
    setIsLoadingInstructions(true);
    const fetchedInstructions = await getGameInstructions('Chess');
    setInstructions(fetchedInstructions);
    setIsLoadingInstructions(false);
  };
  
  const handleCopyFen = async () => {
    await navigator.clipboard.writeText(fen);
    setCopyStatus('Move code copied!');
  };

  const handleLoadFen = () => {
    try {
      // FIX: An expression of type 'void' cannot be tested for truthiness.
      // Modern versions of chess.js have a `load` method that returns void and throws on failure.
      // This logic now correctly handles that behavior.
      game.load(importedFen);
      setFen(game.fen());
      setImportedFen('');
      setLoadError('');
    } catch (e) {
      setLoadError('Invalid move code. Please try again.');
    }
  };

  const getStatusMessage = () => {
    if (game.isCheckmate()) return `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`;
    if (game.isDraw()) return 'Draw!';
    if (game.isStalemate()) return 'Stalemate!';
    if (game.isThreefoldRepetition()) return 'Draw by threefold repetition!';
    if (game.isInsufficientMaterial()) return 'Draw by insufficient material!';
    const turn = game.turn() === 'w' ? 'White' : 'Black';
    return `${turn}'s turn${game.isCheck() ? ' - Check!' : ''}`;
  };

  if (!gameMode) {
    return (
      <div className="flex flex-col items-center text-center">
        <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">Chess</h2>
        <p className="text-gray-400 mb-8">Choose your game mode.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => setGameMode('local')} className="px-8 py-4 bg-purple-600 rounded-md hover:bg-purple-500 transition-colors text-lg font-semibold">Local Multiplayer</button>
          <button onClick={() => setGameMode('correspondence')} className="px-8 py-4 bg-blue-600 rounded-md hover:bg-blue-500 transition-colors text-lg font-semibold">Correspondence (Online)</button>
        </div>
         <button onClick={onBack} className="mt-8 px-6 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Back to Arcade</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">Chess</h2>
      <p className="text-lg text-gray-400 mb-2 capitalize">{gameMode} Mode</p>
      <p className="text-xl h-8 mb-4">{getStatusMessage()}</p>
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg shadow-lg">
        <Chessboard
            // FIX: Changed prop from `fen` to `position` as required by the react-chessboard component API.
            position={fen} 
            onPieceDrop={onDrop}
            boardWidth={560}
            customBoardStyle={{
                borderRadius: '8px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
            }}
            customDarkSquareStyle={{ backgroundColor: '#779556' }}
            customLightSquareStyle={{ backgroundColor: '#EBECD0' }}
        />
      </div>

      {gameMode === 'correspondence' && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg w-full max-w-lg">
          <h3 className="text-lg font-semibold mb-2 text-center">Play Online</h3>
          <p className="text-sm text-gray-400 text-center mb-4">After your turn, copy the move code and send it to your opponent.</p>
          <div className="flex items-center gap-2 mb-4">
              <input type="text" readOnly value={fen} className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-sm text-gray-300"/>
              <button onClick={handleCopyFen} className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-500 transition-colors whitespace-nowrap">{copyStatus || 'Copy Move'}</button>
          </div>
          <p className="text-sm text-gray-400 text-center mb-2">To load your opponent's move, paste their code below.</p>
          <div className="flex items-center gap-2">
            <input 
                type="text" 
                value={importedFen}
                onChange={(e) => setImportedFen(e.target.value)}
                placeholder="Paste opponent's move code here" 
                className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-sm placeholder-gray-500"/>
            <button onClick={handleLoadFen} className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-500 transition-colors">Load Move</button>
          </div>
           {loadError && <p className="text-red-500 text-xs mt-2 text-center">{loadError}</p>}
        </div>
      )}

      <div className="flex space-x-4 mt-6">
        <button onClick={onBack} className="px-6 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">Back</button>
        <button onClick={handleReset} className="px-6 py-2 bg-purple-600 rounded-md hover:bg-purple-500 transition-colors">Reset Game</button>
        <button onClick={handleGetInstructions} className="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-500 transition-colors">How to Play</button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="How to Play Chess">
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

export default ChessComponent;