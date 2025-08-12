import React from 'react';
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const isDark = theme === 'dark';

  const themeValues = {
    name: theme,
    isDark,
    // Light theme colors
    ...(theme === 'light' ? {
      background: '#ffffff',
      surface: '#f8f9fa',
      cardBackground: 'rgba(255, 255, 255, 0.9)',
      text: '#1a1a1a',
      textSecondary: '#6b7280',
      primary: '#3b82f6',
      border: '#e5e7eb',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    } : {
      // Dark theme colors
      background: '#0f0f23',
      surface: '#1a1a2e',
      cardBackground: 'rgba(26, 26, 46, 0.9)',
      text: '#ffffff',
      textSecondary: '#a1a1aa',
      primary: '#60a5fa',
      border: '#374151',
      gradient: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
    })
  };

  return (
    <ThemeContext.Provider value={{ theme: themeValues, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
