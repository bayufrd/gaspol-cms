import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'theme-dark';
    }
    // Check system preference
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    // Apply theme to body
    const theme = isDark ? 'theme-dark' : 'theme-light';
    document.body.className = document.body.className.replace(/theme-(dark|light)/g, '');
    document.body.classList.add(theme);
    
    // Update checkbox (for Mazer script compatibility)
    const toggleCheckbox = document.getElementById('toggle-dark');
    if (toggleCheckbox) {
      toggleCheckbox.checked = isDark;
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
