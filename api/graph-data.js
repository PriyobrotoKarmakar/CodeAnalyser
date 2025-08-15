// Generate mathematical complexity data
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
        } else { // linear or default
            operations = n + (Math.random() - 0.5);
        }
        
        data.push({
            input_size: n,
            operations: Math.max(1, Math.round(operations * 100) / 100)
        });
    }
    
    return data;
}

module.exports = async (req, res) => {
    // Set CORS headers
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
        
        const graphData = generateMathematicalData(complexity_type, max_input_size);
        
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
