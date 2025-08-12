import React, { useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeProvider, useTheme } from './contexts/ThemeContext.jsx';
import { lightTheme, darkTheme } from './styles/theme.js';
import { GlobalStyle, Container } from './styles/components.js';
import Header from './components/Header.jsx';
import ComplexitySection from './components/ComplexitySection.jsx';
import DebugSection from './components/DebugSection.jsx';
import CreateSection from './components/CreateSection.jsx';
import AboutSection from './components/AboutSection.jsx';

import DotGridBackground from './components/DotGridBackground.jsx';

const AppContent = () => {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('complexity');

  const currentTheme = theme.name === 'light' ? lightTheme : darkTheme;

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'complexity':
        return <ComplexitySection />;
      case 'debug':
        return <DebugSection />;
      case 'create':
        return <CreateSection />;
      case 'about':
        return <AboutSection />;
      default:
        return <ComplexitySection />;
    }
  };

  return (
    <StyledThemeProvider theme={currentTheme}>
      <GlobalStyle theme={currentTheme} />
      <DotGridBackground />
      <Container>
        <Header activeSection={activeSection} setActiveSection={setActiveSection} />
        {renderActiveSection()}
      </Container>
    </StyledThemeProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
