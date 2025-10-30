// Utility function to extract time and space complexity from analysis text
export const extractComplexities = (analysisText) => {
  if (!analysisText || typeof analysisText !== 'string') {
    return { timeComplexity: 'O(n)', spaceComplexity: 'O(1)' };
  }

  //console.log('Raw analysis text:', analysisText); // Debug log

  const text = analysisText.toLowerCase();
  
  // More comprehensive complexity patterns - order matters!
  const complexityPatterns = [
    /time complexity[:\s]*o\s*\(\s*([^)]+)\s*\)/gi,
    /time[:\s]*o\s*\(\s*([^)]+)\s*\)/gi,
    /runtime[:\s]*o\s*\(\s*([^)]+)\s*\)/gi,
    /temporal complexity[:\s]*o\s*\(\s*([^)]+)\s*\)/gi,
    // Also match just O(...) patterns near "time" keywords
    /time[^.]*?o\s*\(\s*([^)]+)\s*\)/gi,
    /complexity[:\s]*o\s*\(\s*([^)]+)\s*\)/gi
  ];
  
  const spacePatterns = [
    /space complexity[:\s]*o\s*\(\s*([^)]+)\s*\)/gi,
    /space[:\s]*o\s*\(\s*([^)]+)\s*\)/gi,
    /memory[:\s]*o\s*\(\s*([^)]+)\s*\)/gi,
    /auxiliary space[:\s]*o\s*\(\s*([^)]+)\s*\)/gi,
    // Also match just O(...) patterns near "space" keywords
    /space[^.]*?o\s*\(\s*([^)]+)\s*\)/gi
  ];
  
  let timeComplexity = 'O(n)'; // default
  let spaceComplexity = 'O(1)'; // default
  
  // Extract time complexity
  for (const pattern of complexityPatterns) {
    pattern.lastIndex = 0; // Reset regex
    const match = pattern.exec(text);
    if (match && match[1]) {
      timeComplexity = `O(${match[1].trim()})`;
      //console.log('Found time complexity:', timeComplexity); // Debug log
      break;
    }
  }
  
  // Extract space complexity
  for (const pattern of spacePatterns) {
    pattern.lastIndex = 0; // Reset regex
    const match = pattern.exec(text);
    if (match && match[1]) {
      spaceComplexity = `O(${match[1].trim()})`;
      //console.log('Found space complexity:', spaceComplexity); // Debug log
      break;
    }
  }
  
  // Clean up common variations and normalize
  const cleanComplexity = (complexity) => {
    return complexity
      .replace(/\s+/g, ' ')
      .replace(/log\s*\(\s*n\s*\)/gi, 'log n')
      .replace(/n\s*\*\s*log\s*\(\s*n\s*\)/gi, 'n log n')
      .replace(/n\s*log\s*n/gi, 'n log n')
      .replace(/n\s*\^\s*2/gi, 'n²')
      .replace(/n\s*\*\s*n/gi, 'n²')
      .replace(/n2/gi, 'n²')
      .replace(/2\s*\^\s*n/gi, '2^n')
      .replace(/O\s*\(\s*/gi, 'O(')
      .replace(/\s*\)/gi, ')')
      // Handle m+n patterns
      .replace(/m\s*\+\s*n/gi, 'm+n')
      .replace(/n\s*\+\s*m/gi, 'm+n');
  };
  
  const result = {
    timeComplexity: cleanComplexity(timeComplexity),
    spaceComplexity: cleanComplexity(spaceComplexity)
  };
  
  //console.log('Final complexities:', result); // Debug log
  return result;
};

// Function to determine if the analysis contains valid complexity information
export const hasComplexityInfo = (analysisText) => {
  if (!analysisText || typeof analysisText !== 'string') {
    return false;
  }
  
  const text = analysisText.toLowerCase();
  return text.includes('complexity') || 
         text.includes('o(') || 
         text.includes('time:') || 
         text.includes('space:');
};
