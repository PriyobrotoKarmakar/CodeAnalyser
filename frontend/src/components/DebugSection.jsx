import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Bug, Send, Code2, Eye, Edit3 } from 'lucide-react';
import { Card, Button, LoadingSpinner } from '../styles/components.js';
import { apiService } from '../services/api.js';
import MarkdownRenderer from './MarkdownRenderer.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import Spline from '@splinetool/react-spline';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const DebugContainer = styled.div`
  min-height: ${props => props.hasContent ? '100vh' : 'auto'};
`;

const ContentOverlay = styled.div`
  margin: 0 auto;
  max-width: 1200px;
  padding: 0 2rem;
`;

const SectionContainer = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;

  @media (min-width: 1024px) {
    grid-template-columns: 1.2fr 1fr;
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
    };
  }
`;

const SplineSection = styled.div`
  height: 600px;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 1024px) {
    height: 400px;
    min-height: 300px;
  }
`;

const ResultsSection = styled.div`
  grid-column: 1 / -1;
  margin-top: 2rem;
`;

const OutputSection = styled(Card)`
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
    background: ${props => props.theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
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

const CodeInputContainer = styled.div`
  border: 1px solid ${props => props.theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 12px;
  overflow: hidden;
  background: ${props => props.theme.isDark ? 
    'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)' : 
    'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 100%)'
  };
  backdrop-filter: blur(10px);
`;

const CodeInputHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: ${props => props.theme.isDark ? 
    'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)' : 
    'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)'
  };
  border-bottom: 1px solid ${props => props.theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.textSecondary};
  backdrop-filter: blur(5px);
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, rgba(138, 43, 226, 0.8), rgba(75, 0, 130, 0.8))' 
    : 'transparent'};
  color: ${props => {
    if (props.active) return '#ffffff';
    return props.theme.isDark ? '#e0e0e0' : '#555555';
  }};
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, rgba(138, 43, 226, 1), rgba(75, 0, 130, 1))' 
      : props.theme.isDark 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(138, 43, 226, 0.1)'};
    color: ${props => props.active 
      ? '#ffffff' 
      : props.theme.isDark 
        ? '#ffffff' 
        : '#8a2be2'};
  }
`;

const CodeContainer = styled.div`
  position: relative;
  height: 300px;
  overflow: hidden;
`;

const CodeEditor = styled.textarea`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 1rem;
  border: none;
  background: transparent;
  color: ${props => props.theme.text};
  font-family: 'Fira Code', 'Courier New', Consolas, Monaco, 'Lucida Console', monospace !important;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: none;
  box-sizing: border-box;
  overflow: auto;
  opacity: ${props => props.isVisible ? 1 : 0};
  pointer-events: ${props => props.isVisible ? 'all' : 'none'};
  transition: opacity 0.3s ease;

  &:focus {
    outline: none;
    background: rgba(0, 0, 0, 0.05);
  }

  &::placeholder {
    color: ${props => props.theme.textSecondary};
    opacity: 0.7;
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(138, 43, 226, 0.5);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(138, 43, 226, 0.7);
  }
`;

const CodePreview = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${props => props.isVisible ? 1 : 0};
  pointer-events: ${props => props.isVisible ? 'all' : 'none'};
  transition: opacity 0.3s ease;
  overflow: hidden;

  .syntax-highlighter {
    height: 100% !important;
    margin: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
    font-size: 0.875rem !important;
  }
`;

const LineNumbers = styled.div`
  position: absolute;
  top: 1rem;
  left: 0;
  padding: 0 0.5rem;
  background: ${props => props.theme.isDark ? 
    'rgba(255, 255, 255, 0.05)' : 
    'rgba(0, 0, 0, 0.05)'};
  border-right: 1px solid ${props => props.theme.isDark ? 
    'rgba(255, 255, 255, 0.1)' : 
    'rgba(0, 0, 0, 0.1)'};
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.8rem;
  line-height: 1.5;
  color: ${props => props.theme.textSecondary};
  opacity: 0.7;
  user-select: none;
  pointer-events: none;
  min-width: 3rem;
  text-align: right;
`;

const SimpleCodeTextArea = styled.textarea`
  width: 100%;
  height: 300px;
  max-height: 400px;
  padding: 1rem;
  border: none;
  background: transparent;
  color: ${props => props.theme.text};
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  box-sizing: border-box;
  overflow: auto;

  &:focus {
    outline: none;
    background: rgba(0, 0, 0, 0.05);
  }

  &::placeholder {
    color: ${props => props.theme.textSecondary};
    opacity: 0.7;
  }

  &::selection {
    background: ${props => props.theme.primary}40;
  }
`;

const DebugSection = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { theme } = useTheme();
  const resultsSectionRef = useRef(null);

  // Detect programming language from code
  const detectLanguage = (code) => {
    if (!code) return 'javascript';
    
    // Simple language detection based on common patterns
    if (code.includes('#include') || code.includes('std::')) return 'cpp';
    if (code.includes('def ') || code.includes('import ')) return 'python';
    if (code.includes('public class') || code.includes('System.out')) return 'java';
    if (code.includes('using ') || code.includes('Console.')) return 'csharp';
    if (code.includes('func ') || code.includes('package ')) return 'go';
    if (code.includes('fn ') || code.includes('let mut')) return 'rust';
    
    return 'javascript'; // default
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('Please enter some code to debug');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const response = await apiService.debugCode(code);
      console.log('Debug API Response:', response); // Debug log
      
      // The response should have debug_report field
      if (response && response.debug_report) {
        setResult(response.debug_report);
        // Auto-scroll to results section after a short delay
        setTimeout(() => {
          if (resultsSectionRef.current) {
            resultsSectionRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 300);
      } else if (typeof response === 'string') {
        setResult(response);
        // Auto-scroll to results section after a short delay
        setTimeout(() => {
          if (resultsSectionRef.current) {
            resultsSectionRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 300);
      } else {
        console.error('Unexpected response structure:', response);
        setError('Received invalid response format from server');
      }
    } catch (err) {
      console.error('Debug API Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while debugging the code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DebugContainer hasContent={!!(result || error)}>
      <ContentOverlay theme={theme}>
        <SectionContainer>
          <SplineSection theme={theme}>
            <Spline scene="https://prod.spline.design/lNpFtvX044HNCIuq/scene.splinecode" />
          </SplineSection>

          <InputSection>
            <SectionTitle>
              <Bug size={24} />
              Input Code
            </SectionTitle>
            
            <FormGroup>
              <Label>Paste your code here:</Label>
              <CodeInputContainer theme={theme}>
                <CodeInputHeader theme={theme}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Code2 size={16} />
                    Code Input
                  </div>
                  <TabContainer>
                    <Tab 
                      active={!isPreviewMode} 
                      onClick={() => setIsPreviewMode(false)}
                      theme={theme}
                    >
                      <Edit3 size={14} />
                      Editor
                    </Tab>
                    <Tab 
                      active={isPreviewMode} 
                      onClick={() => setIsPreviewMode(true)}
                      theme={theme}
                      disabled={!code.trim()}
                    >
                      <Eye size={14} />
                      Preview
                    </Tab>
                  </TabContainer>
                </CodeInputHeader>
                
                <CodeContainer>
                  <CodeEditor
                    theme={theme}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="// Enter your code here..."
                    spellCheck={false}
                    isVisible={!isPreviewMode}
                  />
                  <CodePreview
                    theme={theme}
                    isVisible={isPreviewMode}
                  >
                    {code ? (
                      <SyntaxHighlighter
                        language={detectLanguage(code)}
                        style={theme.name === 'dark' ? oneDark : oneLight}
                        customStyle={{
                          margin: 0,
                          borderRadius: 0,
                          background: 'transparent',
                          height: '100%',
                          padding: '1rem',
                        }}
                        className="syntax-highlighter"
                        showLineNumbers={true}
                        wrapLines={true}
                      >
                        {code}
                      </SyntaxHighlighter>
                    ) : (
                      <div style={{ 
                        padding: '1rem', 
                        color: '#666', 
                        fontStyle: 'italic',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%'
                      }}>
                        No code to preview...
                      </div>
                    )}
                  </CodePreview>
                </CodeContainer>
              </CodeInputContainer>
            </FormGroup>

            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !code.trim()}
              variant="primary"
            >
              {isLoading ? <LoadingSpinner /> : <Send size={20} />}
              {isLoading ? 'Debugging...' : 'Debug Code'}
            </Button>
          </InputSection>
        </SectionContainer>

        {/* Results section that appears below and auto-scrolls into view */}
        {(result || error) && (
          <ResultsSection ref={resultsSectionRef}>
            <OutputSection>
              <SectionTitle>
                <Bug size={24} />
                Debug Report
              </SectionTitle>

              <ResultContainer>
                {error ? (
                  <div style={{ color: 'var(--error-color)' }}>
                    Error: {error}
                  </div>
                ) : result ? (
                  <MarkdownRenderer content={result} theme={theme} />
                ) : (
                  <EmptyState>
                    Submit your code to see the debug analysis here...
                  </EmptyState>
                )}
              </ResultContainer>
            </OutputSection>
          </ResultsSection>
        )}
      </ContentOverlay>
    </DebugContainer>
  );
};

export default DebugSection;
