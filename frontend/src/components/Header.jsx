import React from 'react';
import styled from 'styled-components';
import { Code2, Zap, Bug, Plus, TestTube } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;
  margin-bottom: 1.5rem;
  position: relative;
`;

const GlassContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: ${props => props.theme.name === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.1)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.name === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 50px;
  box-shadow: 
    0 8px 32px ${props => props.theme.name === 'dark' 
      ? 'rgba(0, 0, 0, 0.3)' 
      : 'rgba(0, 0, 0, 0.1)'},
    inset 0 1px 0 ${props => props.theme.name === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(255, 255, 255, 0.2)'};
  min-width: 800px;
  position: relative;
  overflow: hidden;
  
  /* Animated gradient background */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: ${props => props.theme.name === 'dark' 
      ? `linear-gradient(
          45deg,
          rgba(138, 43, 226, 0.15),
          rgba(75, 0, 130, 0.1),
          rgba(30, 144, 255, 0.15),
          rgba(138, 43, 226, 0.1)
        )`
      : `linear-gradient(
          45deg,
          rgba(138, 43, 226, 0.1),
          rgba(75, 0, 130, 0.05),
          rgba(30, 144, 255, 0.1),
          rgba(138, 43, 226, 0.05)
        )`};
   
    z-index: -1;
  }
  
  @keyframes liquidMove {
    0%, 100% {
      transform: rotate(0deg) scale(1);
    }
    25% {
      transform: rotate(90deg) scale(1.1);
    }
    50% {
      transform: rotate(180deg) scale(1);
    }
    75% {
      transform: rotate(270deg) scale(1.1);
    }
  }
  
  @media (max-width: 768px) {
    min-width: auto;
    width: 95%;
    padding: 1rem 1.5rem;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.3rem;
  font-weight: 700;
  color: ${props => props.theme.name === 'dark' ? '#ffffff' : '#1a1a1a'};
  text-shadow: ${props => props.theme.name === 'dark' 
    ? '0 2px 4px rgba(0, 0, 0, 0.5)' 
    : '0 2px 4px rgba(0, 0, 0, 0.1)'};
`;

const LogoIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #8a2be2, #4b0082);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);
`;

const Navigation = styled.nav`
  display: flex;
  gap: 0.5rem;
  background: ${props => props.theme.name === 'dark' 
    ? 'rgba(255, 255, 255, 0.12)' 
    : 'rgba(255, 255, 255, 0.05)'};
  padding: 0.5rem;
  border-radius: 25px;
  border: 1px solid ${props => props.theme.name === 'dark' 
    ? 'rgba(255, 255, 255, 0.25)' 
    : 'rgba(255, 255, 255, 0.1)'};
  backdrop-filter: blur(15px);
`;

const NavButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['active'].includes(prop),
})`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border: none;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.9), rgba(75, 0, 130, 0.9))' 
    : 'transparent'};
  color: ${props => {
    if (props.active) return '#ffffff';
    return props.theme.name === 'dark' ? '#e0e0e0' : '#555555';
  }};
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  text-shadow: ${props => props.theme.name === 'dark' && !props.active 
    ? '0 1px 3px rgba(0, 0, 0, 0.8)' 
    : 'none'};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, rgba(138, 43, 226, 1), rgba(75, 0, 130, 1))' 
      : props.theme.name === 'dark' 
        ? 'rgba(255, 255, 255, 0.15)' 
        : 'rgba(138, 43, 226, 0.1)'};
    color: ${props => props.active 
      ? '#ffffff' 
      : props.theme.name === 'dark' 
        ? '#ffffff' 
        : '#8a2be2'};
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid ${props => props.theme.name === 'dark' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(255, 255, 255, 0.2)'};
  background: ${props => props.theme.name === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.theme.name === 'dark' ? '#ffffff' : '#1a1a1a'};
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1.1rem;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  filter: ${props => props.theme.name === 'dark' 
    ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))' 
    : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'};

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(circle, rgba(138, 43, 226, 0.3), transparent);
    transition: all 0.3s ease;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  &:hover::before {
    width: 100px;
    height: 100px;
  }

  &:hover {
    background: ${props => props.theme.name === 'dark' 
      ? 'rgba(138, 43, 226, 0.25)' 
      : 'rgba(138, 43, 226, 0.2)'};
    border-color: rgba(138, 43, 226, 0.4);
    transform: scale(1.05) rotate(10deg);
    box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const AboutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid ${props => props.theme.name === 'dark' 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(255, 255, 255, 0.2)'};
  background: ${props => props.theme.name === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1.1rem;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  filter: ${props => props.theme.name === 'dark' 
    ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))' 
    : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'};
  margin-right: 0.5rem;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(circle, rgba(138, 43, 226, 0.3), transparent);
    transition: all 0.3s ease;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  &:hover::before {
    width: 100px;
    height: 100px;
  }

  &:hover {
    background: ${props => props.theme.name === 'dark' 
      ? 'rgba(138, 43, 226, 0.25)' 
      : 'rgba(138, 43, 226, 0.2)'};
    border-color: rgba(138, 43, 226, 0.4);
    transform: scale(1.05) rotate(10deg);
    box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Header = ({ activeSection, setActiveSection }) => {
  const { theme, toggleTheme } = useTheme();

  const sections = [
    { id: 'complexity', label: 'Complexity', icon: Zap },
    { id: 'debug', label: 'Debug', icon: Bug },
    { id: 'create', label: 'Create', icon: Plus },
  ];

  return (
    <HeaderContainer>
      <GlassContainer>
        <Logo>
          <LogoIcon>
            <Code2 size={18} />
          </LogoIcon>
          <span>Code Analyzer</span>
        </Logo>

        <Navigation>
          {sections.map(({ id, label, icon: Icon }) => (
            <NavButton
              key={id}
              active={activeSection === id}
              onClick={() => setActiveSection(id)}
            >
              <Icon size={14} />
              {label}
            </NavButton>
          ))}
        </Navigation>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AboutButton onClick={() => setActiveSection('about')}>
            🧑🏻‍🦱
          </AboutButton>
          <ThemeToggle onClick={toggleTheme}>
            {theme.name === 'light' ? '🌙' : '☀️'}
          </ThemeToggle>
        </div>
      </GlassContainer>
    </HeaderContainer>
  );
};

export default Header;
