import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styled from 'styled-components';

const MarkdownContainer = styled.div`
  color: ${props => props.theme.text};
  line-height: 1.6;
  
  h1, h2, h3, h4, h5, h6 {
    color: ${props => props.theme.primary};
    margin: 1.5rem 0 0.75rem 0;
    font-weight: 600;
    line-height: 1.3;
  }
  
  h1 { font-size: 1.75rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }
  h4 { font-size: 1.1rem; }
  h5 { font-size: 1rem; }
  h6 { font-size: 0.9rem; }
  
  p {
    margin: 0.75rem 0;
    line-height: 1.6;
  }
  
  strong, b {
    color: ${props => props.theme.text};
    font-weight: 700;
  }
  
  em, i {
    font-style: italic;
    color: ${props => props.theme.textSecondary};
  }
  
  code {
    background: ${props => props.theme.background};
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 0.85rem;
    color: ${props => props.theme.text};
    border: 1px solid ${props => props.theme.border};
  }

  ul, ol {
    margin: 0.75rem 0;
    padding-left: 1.5rem;
  }

  ul {
    list-style-type: disc;
  }

  ol {
    list-style-type: decimal;
  }

  ul ul {
    list-style-type: circle;
    margin: 0.25rem 0;
  }

  ol ol {
    list-style-type: lower-alpha;
    margin: 0.25rem 0;
  }

  li {
    margin: 0.5rem 0;
    line-height: 1.6;
    color: ${props => props.theme.text};
    padding-left: 0.25rem;
  }

  li strong {
    color: ${props => props.theme.primary};
    font-weight: 700;
  }

  li code {
    background: ${props => props.theme.background};
    border: 1px solid ${props => props.theme.border};
    border-radius: 3px;
    padding: 0.1rem 0.3rem;
    font-size: 0.8rem;
  }

  /* Better spacing for nested content in list items */
  li p {
    margin: 0.25rem 0;
  }

  li ul, li ol {
    margin: 0.5rem 0;
  }
  
  .code-block-wrapper {
    margin: 1rem 0;
    border: 1px solid ${props => props.theme.border};
    border-radius: 8px;
    overflow: hidden;
  }
  
  .code-block-header {
    background: ${props => props.theme.surface};
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: ${props => props.theme.textSecondary};
    border-bottom: 1px solid ${props => props.theme.border};
  }
  
  .code-block {
    background: ${props => props.theme.background};
    padding: 1rem;
    margin: 0;
    overflow-x: auto;
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 0.85rem;
    line-height: 1.4;
    color: ${props => props.theme.text};
  }
  
  .code-block code {
    background: none;
    padding: 0;
    border: none;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
  }
`;

const CodeBlockWrapper = styled.div`
  background: ${props => props.theme.cardBackground};
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  margin: 1rem 0;
  overflow: hidden;
`;

const CodeBlockHeader = styled.div`
  background: ${props => props.theme.background};
  padding: 0.5rem 1rem;
  border-bottom: 1px solid ${props => props.theme.border};
  font-size: 0.9rem;
  color: ${props => props.theme.textSecondary};
  font-weight: 500;
`;

const MarkdownRenderer = ({ content, theme }) => {
  if (!content || typeof content !== 'string') {
    return <div>No content available</div>;
  }

  // Simple markdown parsing with syntax highlighting
  const processContent = (text) => {
    // Replace markdown headings
    text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Replace bold and italic
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle inline code first (to avoid conflicts with code blocks)
    text = text.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    
    // Handle bullet points and numbered lists
    const lines = text.split('\n');
    let inUnorderedList = false;
    let inOrderedList = false;
    const processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Check for unordered list (bullet points)
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        // Close ordered list if open
        if (inOrderedList) {
          processedLines.push('</ol>');
          inOrderedList = false;
        }
        
        if (!inUnorderedList) {
          processedLines.push('<ul>');
          inUnorderedList = true;
        }
        const listItemContent = trimmedLine.substring(2); // Remove "- " or "* "
        processedLines.push(`<li>${listItemContent}</li>`);
      }
      // Check for ordered list (numbered points)
      else if (/^\d+\.\s/.test(trimmedLine)) {
        // Close unordered list if open
        if (inUnorderedList) {
          processedLines.push('</ul>');
          inUnorderedList = false;
        }
        
        if (!inOrderedList) {
          processedLines.push('<ol>');
          inOrderedList = true;
        }
        const listItemContent = trimmedLine.replace(/^\d+\.\s/, ''); // Remove "1. ", "2. ", etc.
        processedLines.push(`<li>${listItemContent}</li>`);
      }
      else {
        // Close any open lists
        if (inUnorderedList && trimmedLine !== '') {
          processedLines.push('</ul>');
          inUnorderedList = false;
        }
        if (inOrderedList && trimmedLine !== '') {
          processedLines.push('</ol>');
          inOrderedList = false;
        }
        processedLines.push(line);
      }
    }
    
    // Close any open lists
    if (inUnorderedList) {
      processedLines.push('</ul>');
    }
    if (inOrderedList) {
      processedLines.push('</ol>');
    }
    
    text = processedLines.join('\n');
    
    // Handle line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
  };

  // Extract and render code blocks separately with syntax highlighting
  const renderContentWithCodeBlocks = () => {
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textPart = content.substring(lastIndex, match.index);
        if (textPart.trim()) {
          parts.push({
            type: 'text',
            content: processContent(textPart),
            key: `text-${parts.length}`
          });
        }
      }

      // Add code block
      const language = match[1] || 'text';
      const code = match[2].trim();
      parts.push({
        type: 'code',
        language: language,
        content: code,
        key: `code-${parts.length}`
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last code block
    if (lastIndex < content.length) {
      const textPart = content.substring(lastIndex);
      if (textPart.trim()) {
        parts.push({
          type: 'text',
          content: processContent(textPart),
          key: `text-${parts.length}`
        });
      }
    }

    // If no code blocks found, just process as text
    if (parts.length === 0) {
      parts.push({
        type: 'text',
        content: processContent(content),
        key: 'text-only'
      });
    }

    return parts.map(part => {
      if (part.type === 'code') {
        const isDark = theme.name === 'dark';
        return (
          <CodeBlockWrapper key={part.key}>
            <CodeBlockHeader>
              Code ({part.language})
            </CodeBlockHeader>
            <SyntaxHighlighter
              language={part.language}
              style={isDark ? oneDark : oneLight}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                background: 'transparent',
                padding: '1rem',
              }}
              showLineNumbers={true}
              wrapLines={true}
            >
              {part.content}
            </SyntaxHighlighter>
          </CodeBlockWrapper>
        );
      } else {
        return (
          <div 
            key={part.key}
            dangerouslySetInnerHTML={{ __html: part.content }} 
          />
        );
      }
    });
  };

  return (
    <MarkdownContainer theme={theme}>
      {renderContentWithCodeBlocks()}
    </MarkdownContainer>
  );
};

export default MarkdownRenderer;
