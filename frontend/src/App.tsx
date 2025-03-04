import React from 'react';
import Router from './Router';
import { ThemeProvider } from '@/contexts/ThemeContext';
import './styles/theme.css';
import './styles/theme-components.css';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  );
}

export default App;
