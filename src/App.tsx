import React, { useState } from 'react';
import { Game, User } from './types';
import GameLibrary from './components/GameLibrary';
import TicTacToe from './components/TicTacToe';
import RockPaperScissors from './components/RockPaperScissors';
import Header from './components/Header';
import ChessComponent from './components/Chess';
import ConnectFour from './components/ConnectFour';
import MemoryMatch from './components/MemoryMatch';
import Sudoku from './components/Sudoku';
import Hangman from './components/Hangman';

const App: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
  };

  const handleGoBack = () => {
    setSelectedGame(null);
  };

  const handleLogin = () => {
    // This is a mock login for demonstration purposes.
    setUser({ name: 'Player One', avatar: 'P' });
  };

  const handleLogout = () => {
    setUser(null);
  };

  const renderGame = () => {
    if (!selectedGame) return null;
    switch (selectedGame.id) {
      case 'tic-tac-toe':
        return <TicTacToe onBack={handleGoBack} />;
      case 'rock-paper-scissors':
        return <RockPaperScissors onBack={handleGoBack} />;
      case 'chess':
        return <ChessComponent onBack={handleGoBack} />;
      case 'connect-four':
        return <ConnectFour onBack={handleGoBack} />;
      case 'memory-match':
        return <MemoryMatch onBack={handleGoBack} />;
      case 'sudoku':
        return <Sudoku onBack={handleGoBack} />;
      case 'hangman':
        return <Hangman onBack={handleGoBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <Header 
        onTitleClick={handleGoBack}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <main className="container mx-auto p-4 md:p-8">
        {selectedGame ? (
          renderGame()
        ) : (
          <GameLibrary onSelectGame={handleSelectGame} />
        )}
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>&copy; 2024 Celestial Arcade. All games are for entertainment purposes only.</p>
      </footer>
    </div>
  );
};

export default App;