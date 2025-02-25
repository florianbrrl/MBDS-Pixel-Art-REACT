import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/common/ThemeToggle';
import './styles/theme.css';
import './styles/theme-components.css';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <header className="app-header">
          <h1>PixelArt App</h1>
          <ThemeToggle className="theme-toggle-button" />
        </header>
        <main className="app-main">
          <p>Bienvenue sur l'application PixelArt!</p>
          <p>Cette application vous permet de créer et partager des PixelBoards avec la communauté.</p>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
