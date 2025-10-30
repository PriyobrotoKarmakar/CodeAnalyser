const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODELS = [
    process.env.GEMINI_MODEL_1,
    process.env.GEMINI_MODEL_2,
    process.env.GEMINI_MODEL_3
];

async function tryGeminiRequest(prompt) {
    for (let i = 0; i < GEMINI_MODELS.length; i++) {
        const model = GEMINI_MODELS[i];
        
        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );
            
            return response.data.candidates[0].content.parts[0].text;
            
        } catch (error) {
            const errorMsg = error.message?.toLowerCase() || '';
            
            if (errorMsg.includes('quota') || errorMsg.includes('rate limit') || 
                errorMsg.includes('503') || errorMsg.includes('overload') || 
                error.response?.status === 503 || error.response?.status === 429) {
                
                if (i < GEMINI_MODELS.length - 1) {
                    continue;
                }
            }
            
            if (i === GEMINI_MODELS.length - 1) {
                throw new Error(`All models failed. Last error: ${error.message}`);
            }
        }
    }
    
    throw new Error('All fallback models exhausted');
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { problem_statement, language } = req.body;
        
        if (!problem_statement || !problem_statement.trim()) {
            return res.status(400).json({ error: 'Problem statement is required' });
        }
        
        if (!language || !language.trim()) {
            return res.status(400).json({ error: 'Language is required' });
        }
        
        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
        }
        
        const prompt = `
        Generate a ${language} code solution for the following problem:
        Problem: ${problem_statement}

        Format your response with markdown:

        ### Solution:
        \`\`\`${language}
        Your code solution here
        \`\`\`

        ### Explanation:
        Brief explanation of the approach

        ### Complexity:
        **Time:** O(notation)
        **Space:** O(notation)

        Use proper markdown formatting with code blocks for the solution.
        `;
        
        const solution = await tryGeminiRequest(prompt);
        
        res.json({
            success: true,
            solution: solution
        });
        
    } catch (error) {
        console.error('Code generation error:', error.message);
        res.status(500).json({ 
            error: 'Code generation failed', 
            details: error.message 
        });
    }
};
