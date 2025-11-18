import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });
  const [cropTheme, setCropTheme] = useState('default');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setCropColor = (crop) => {
    const cropColors = {
      'rice': 'green',
      'wheat': 'amber',
      'cotton': 'blue',
      'maize': 'yellow',
      'tomato': 'red',
      'potato': 'purple',
      'default': 'green'
    };
    setCropTheme(cropColors[crop?.toLowerCase()] || 'default');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, cropTheme, setCropColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

