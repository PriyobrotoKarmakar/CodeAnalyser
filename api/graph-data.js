function generateMathematicalData(complexityType, maxInputSize = 50) {
    const data = [];
    
    for (let n = 1; n <= maxInputSize; n++) {
        let operations;
        
        const type = complexityType.toLowerCase();
        
        if (type.includes('o(1)') || type.includes('constant')) {
            operations = 1 + (Math.random() - 0.5) * 0.2;
        } else if (type.includes('o(log') || type.includes('logarithmic')) {
            operations = Math.log2(n) + (Math.random() - 0.5);
        } else if (type.includes('o(n²)') || type.includes('o(n^2)') || type.includes('quadratic')) {
            operations = n * n + (Math.random() - 0.5) * n;
        } else if (type.includes('o(n³)') || type.includes('o(n^3)') || type.includes('cubic')) {
            operations = n * n * n + (Math.random() - 0.5) * n * n;
        } else if (type.includes('o(n log n)') || type.includes('linearithmic')) {
            operations = n * Math.log2(n) + (Math.random() - 0.5) * n / 2;
        } else if (type.includes('2^n') || type.includes('exponential')) {
            operations = Math.pow(2, Math.min(n, 20)) + (Math.random() - 0.5) * 10;
        } else {
            return null;
        }
        
        data.push({
            input_size: n,
            operations: Math.max(1, Math.round(operations * 100) / 100)
        });
    }
    
    return data;
}

const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODELS = [
    process.env.GEMINI_MODEL_1 || 'gemini-2.0-flash-lite',
    process.env.GEMINI_MODEL_2 || 'gemini-2.5-flash-lite',
    process.env.GEMINI_MODEL_3 || 'gemini-2.0-flash'
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

async function generateDataFromGemini(complexityType, maxInputSize = 50) {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
    }
    
    const prompt = `
    Generate mathematical data points for the complexity type: ${complexityType}
    
    I need exactly ${maxInputSize} data points for input sizes from 1 to ${maxInputSize}.
    
    Return ONLY a valid JSON array in this exact format:
    [
        {"input_size": 1, "operations": number},
        {"input_size": 2, "operations": number},
        ...
        {"input_size": ${maxInputSize}, "operations": number}
    ]
    
    Rules:
    - Operations should reflect the mathematical growth pattern of ${complexityType}
    - Add small random variations (±10%) to make it realistic
    - Keep numbers reasonable (no infinity or extremely large values)
    - For exponential complexities, cap at reasonable values to prevent overflow
    - Return ONLY the JSON array, no explanations or markdown formatting
    `;
    
    try {
        const response = await tryGeminiRequest(prompt);
        
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('No valid JSON array found in response');
        }
        
        const data = JSON.parse(jsonMatch[0]);
        
       
        
        return data.map(point => ({
            input_size: point.input_size,
            operations: Math.max(1, Math.round(point.operations * 100) / 100)
        }));
        
    } catch (error) {
        console.error('Gemini data generation error:', error.message);
        throw error;
    }
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
        const { complexity_type, max_input_size = 50 } = req.body;
        
        if (!complexity_type || !complexity_type.trim()) {
            return res.status(400).json({ error: 'Complexity type is required' });
        }
        
        let graphData = generateMathematicalData(complexity_type, max_input_size);
        
        if (!graphData) {
            try {
                graphData = await generateDataFromGemini(complexity_type, max_input_size);
            } catch (geminiError) {
                console.error('Gemini generation failed:', geminiError.message);
                return res.status(500).json({ 
                    error: 'Unable to generate data for this complexity type', 
                    details: `No pattern match found and Gemini generation failed: ${geminiError.message}`
                });
            }
        }
        
        res.json({
            success: true,
            data: graphData
        });
        
    } catch (error) {
        console.error('Graph data generation error:', error.message);
        res.status(500).json({ 
            error: 'Graph data generation failed', 
            details: error.message 
        });
    }
};
