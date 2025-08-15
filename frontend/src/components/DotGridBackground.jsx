
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext.jsx';
import DotGrid from './DotGrid.jsx';

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  pointer-events: none;
`;

const DotGridBackground = () => {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render animated dot background on mobile devices
  if (isMobile) {
    return (
      <BackgroundContainer theme={theme} />
    );
  }

  return (
    <BackgroundContainer theme={theme}>
      <DotGrid
        dotSize={4}
        gap={15}
        baseColor={theme.isDark ? "#5227FF" : "#3B82F6"}
        activeColor={theme.isDark ? "#3BF6F0" : "#FF5722"} // valid hex for cyan
        proximity={100}
        shockRadius={150}
        shockStrength={4}
        resistance={850}
        returnDuration={1.5}
      />
    </BackgroundContainer>
  );
};

export default DotGridBackground;
