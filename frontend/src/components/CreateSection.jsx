import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Code, Send, ChevronDown, Check } from 'lucide-react';
import { Card, Button, TextArea, LoadingSpinner } from '../styles/components.js';
import { apiService } from '../services/api.js';
import MarkdownRenderer from './MarkdownRenderer.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import PlanetModel from './PlanetModel.jsx';

const SectionContainer = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const InputSection = styled(Card)`
  height: fit-content;
  background: ${props => props.theme.isDark ? 
    'rgba(255, 255, 255, 0.05)' : 
    'rgba(255, 255, 255, 0.1)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 20px;
  box-shadow: ${props => props.theme.isDark ? 
    '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' : 
    '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
  };
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  /* Beautiful gradient background */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme.isDark 
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
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.isDark ? 
      '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)' : 
      '0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
    };
  }
`;

const SplineSection = styled.div`
  height: 600px;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  
  /* Ensure Spline canvas has transparent background */
  canvas {
    background: transparent !important;
  }
  
  /* Remove any default shadows or backgrounds */
  * {
    background: transparent;
    box-shadow: none;
  }
  
  @media (min-width: 1024px) {
    height: 600px;
    min-height: 500px;
    transform: translateY(-30px);
  }
`;

const ResultsSection = styled.div`
  grid-column: 1 / -1;
  margin-top: 2rem;
`;

const ResultCard = styled(Card)`
  background: ${props => props.theme.isDark ? 
    'rgba(255, 255, 255, 0.05)' : 
    'rgba(255, 255, 255, 0.1)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 20px;
  box-shadow: ${props => props.theme.isDark ? 
    '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' : 
    '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
  };
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  /* Beautiful gradient background */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme.isDark 
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
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.isDark ? 
      '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)' : 
      '0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
    };
  }
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.text};
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme.text};
`;

const ResultContainer = styled.div`
  background: ${props => props.theme.isDark ? 
    'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)' : 
    'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 100%)'
  };
  border: 1px solid ${props => props.theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 12px;
  padding: 1.5rem;
  white-space: pre-wrap;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: ${props => props.theme.text};
  max-height: 400px;
  overflow-y: auto;
  backdrop-filter: blur(10px);

  /* HTML content styling */
  h3 {
    color: ${props => props.theme.primary};
    margin: 1rem 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
  }

  strong {
    color: ${props => props.theme.text};
    font-weight: 600;
  }

  em {
    font-style: italic;
    color: ${props => props.theme.textSecondary};
  }

  p {
    margin: 0.5rem 0;
    line-height: 1.5;
  }

  ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  li {
    margin: 0.25rem 0;
  }

  code {
    background: ${props => props.theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 0.85rem;
  }

  pre {
    background: ${props => props.theme.background};
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 0.5rem 0;
  }

  pre code {
    background: none;
    padding: 0;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: ${props => props.theme.textSecondary};
  font-style: italic;
`;

const CustomDropdown = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['isOpen'].includes(prop),
})`
  width: 100%;
  padding: 0.875rem 1rem;
  background: ${props => props.theme.name === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.8)'};
  border: 1px solid ${props => props.theme.name === 'dark' 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(138, 43, 226, 0.2)'};
  border-radius: 12px;
  color: ${props => props.theme.name === 'dark' ? '#ffffff' : '#333'};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(10px);
  text-align: left;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(138, 43, 226, 0.1), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    background: ${props => props.theme.name === 'dark' 
      ? 'rgba(138, 43, 226, 0.15)' 
      : 'rgba(138, 43, 226, 0.1)'};
    border-color: rgba(138, 43, 226, 0.4);
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(138, 43, 226, 0.2);
  }

  &:focus {
    outline: none;
    border-color: rgba(138, 43, 226, 0.6);
    box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.2);
  }

  svg {
    transition: transform 0.3s ease;
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const DropdownList = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isOpen'].includes(prop),
})`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${props => props.theme.name === 'dark' 
    ? 'rgba(30, 30, 30, 0.95)' 
    : 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme.name === 'dark' 
    ? 'rgba(255, 255, 255, 0.15)' 
    : 'rgba(138, 43, 226, 0.2)'};
  border-radius: 12px;
  box-shadow: 0 10px 40px ${props => props.theme.name === 'dark' 
    ? 'rgba(0, 0, 0, 0.5)' 
    : 'rgba(0, 0, 0, 0.15)'};
  z-index: 1000;
  margin-top: 0.5rem;
  max-height: 250px;
  overflow-y: auto;
  transform: ${props => props.isOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(138, 43, 226, 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(138, 43, 226, 0.5);
  }
`;

const DropdownItem = styled.button.withConfig({
  shouldForwardProp: (prop) => !['isSelected'].includes(prop),
})`
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: ${props => props.theme.name === 'dark' ? '#ffffff' : '#333'};
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  position: relative;

  &:hover {
    background: ${props => props.theme.name === 'dark' 
      ? 'rgba(138, 43, 226, 0.2)' 
      : 'rgba(138, 43, 226, 0.1)'};
    color: ${props => props.theme.name === 'dark' ? '#ffffff' : '#8a2be2'};
  }

  &:first-child {
    border-radius: 12px 12px 0 0;
  }

  &:last-child {
    border-radius: 0 0 12px 12px;
  }

  ${props => props.isSelected && `
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(75, 0, 130, 0.1));
    color: ${props.theme.name === 'dark' ? '#ffffff' : '#8a2be2'};
    font-weight: 600;
  `}
`;

const LanguageIcon = styled.span`
  font-size: 1.1rem;
  margin-right: 0.5rem;
`;

const CreateSection = () => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { theme } = useTheme();
  const resultsRef = useRef(null);
  const dropdownRef = useRef(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚡' },
    { value: 'csharp', label: 'C#', icon: '🔷' },
    { value: 'go', label: 'Go', icon: '🐹' },
    { value: 'rust', label: 'Rust', icon: '🦀' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  ];

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description of what you want to create');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const response = await apiService.createCode({ prompt, language });
      console.log('Create API Response:', response); // Debug log
      console.log('Response type:', typeof response); // Debug log
      console.log('Solution field:', response?.solution); // Debug log
      console.log('Solution type:', typeof response?.solution); // Debug log
      
      // The API returns { success: true, solution: "..." }
      if (response && response.success && response.solution && typeof response.solution === 'string') {
        console.log('Setting result to:', response.solution); // Debug log
        setResult(response.solution);
        // Auto-scroll to results section after a short delay
        setTimeout(() => {
          if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 300);
      } else if (typeof response === 'string') {
        console.log('Response is string, setting directly'); // Debug log
        setResult(response);
        // Auto-scroll to results section after a short delay
        setTimeout(() => {
          if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 300);
      } else {
        console.error('Unexpected response structure:', response);
        console.error('Solution field:', response?.solution);
        setError('Received invalid response format from server. Check console for details.');
      }
    } catch (err) {
      console.error('Create API Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while generating the code');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  
  const selectLanguage = (langValue) => {
    setLanguage(langValue);
    setIsDropdownOpen(false);
  };

  const selectedLanguage = languages.find(lang => lang.value === language);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div>
      <SectionContainer style={{ marginTop: '2rem' }}>
        <InputSection>
          <SectionTitle>
            <Code size={24} />
            Code Generation
          </SectionTitle>
          
          <FormGroup>
            <Label>Programming Language:</Label>
            <CustomDropdown ref={dropdownRef}>
              <DropdownButton 
                onClick={toggleDropdown}
                isOpen={isDropdownOpen}
                type="button"
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <LanguageIcon>{selectedLanguage?.icon}</LanguageIcon>
                  {selectedLanguage?.label}
                </div>
                <ChevronDown size={18} />
              </DropdownButton>
              <DropdownList isOpen={isDropdownOpen}>
                {languages.map(lang => (
                  <DropdownItem
                    key={lang.value}
                    onClick={() => selectLanguage(lang.value)}
                    isSelected={language === lang.value}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <LanguageIcon>{lang.icon}</LanguageIcon>
                      {lang.label}
                    </div>
                    {language === lang.value && <Check size={16} />}
                  </DropdownItem>
                ))}
              </DropdownList>
            </CustomDropdown>
          </FormGroup>

          <FormGroup>
            <Label>Describe what you want to create:</Label>
            <TextArea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Create a function to sort an array using quicksort algorithm..."
              rows={6}
            />
          </FormGroup>

          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !prompt.trim()}
            variant="primary"
          >
            {isLoading ? <LoadingSpinner /> : <Send size={20} />}
            {isLoading ? 'Generating...' : 'Generate Code'}
          </Button>
        </InputSection>

        <SplineSection>
          {/* Local 3D Planet Model */}
          <PlanetModel theme={theme} />
        </SplineSection>
      </SectionContainer>

      {/* Results section that appears below and auto-scrolls into view */}
      {(result || error || isLoading) && (
        <ResultsSection ref={resultsRef}>
          <ResultCard>
            <SectionTitle>
              <Code size={24} />
              Generated Code
            </SectionTitle>

            <ResultContainer>
              {error ? (
                <div style={{ color: 'var(--error-color)' }}>
                  Error: {error}
                </div>
              ) : result ? (
                <MarkdownRenderer content={result} theme={theme} />
              ) : isLoading ? (
                <EmptyState>
                  Generating your code...
                </EmptyState>
              ) : (
                <EmptyState>
                  Enter a description to generate code here...
                </EmptyState>
              )}
            </ResultContainer>
          </ResultCard>
        </ResultsSection>
      )}
    </div>
  );
};

export default CreateSection;
