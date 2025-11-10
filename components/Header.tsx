import React from 'react';
import { User } from '../types';
import { GoogleIcon } from './icons/GoogleIcon';

interface HeaderProps {
    onTitleClick: () => void;
    user: User | null;
    onLogin: () => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onTitleClick, user, onLogin, onLogout }) => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-700/50">
      <div className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={onTitleClick}
        >
          <svg
            className="w-8 h-8 text-purple-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
          </svg>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Celestial Arcade
          </h1>
        </div>
        
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center font-bold text-sm">
                  {user.avatar}
                </div>
                <span className="text-gray-300 hidden sm:inline">{user.name}</span>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="bg-white text-gray-800 font-semibold text-sm py-2 px-4 rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <GoogleIcon />
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;