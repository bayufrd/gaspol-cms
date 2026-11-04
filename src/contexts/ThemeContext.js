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
    const savedTheme = localStorage.getItem('gaspol_theme');
    if (savedTheme) {
      return savedTheme === 'theme-dark';
    }
    return false;
  });

  useEffect(() => {
    // Apply theme to body
    const theme = isDark ? 'theme-dark' : 'theme-light';
    document.body.className = document.body.className.replace(/theme-(dark|light)/g, '').trim();
    document.body.classList.add(theme);
    
    // Update checkbox (for Mazer script compatibility)
    const toggleCheckbox = document.getElementById('toggle-dark');
    if (toggleCheckbox) {
      toggleCheckbox.checked = isDark;
    }
    
    // Save to localStorage
    localStorage.setItem('gaspol_theme', theme);
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
