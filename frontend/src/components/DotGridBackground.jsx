import React from 'react';
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
  opacity: ${props => props.theme.isDark ? '0.6' : '0.4'};
  pointer-events: none;
`;

const DotGridBackground = () => {
  const { theme } = useTheme();

  return (
    <BackgroundContainer theme={theme}>
      <DotGrid
        dotSize={5}
        gap={15}
        baseColor={theme.isDark ? "#5227FF" : "#3B82F6"}
        activeColor="#5227FF"
        proximity={120}
        shockRadius={250}
        shockStrength={5}
        resistance={750}
        returnDuration={1.5}
      />
    </BackgroundContainer>
  );
};

export default DotGridBackground;
