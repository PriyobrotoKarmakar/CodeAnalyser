// API configuration - automatically detects environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Same domain - no CORS needed!
  : 'http://localhost:3000';  // Local development server

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`API Response for ${endpoint}:`, data); // Debug log
    return data;
  }

  async analyzeComplexity(code) {
    return this.request('/api/complexity', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async debugCode(code) {
    return this.request('/api/debug', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async createCode(params) {
    return this.request('/api/create', {
      method: 'POST',
      body: JSON.stringify({ 
        problem_statement: params.prompt, 
        language: params.language 
      }),
    });
  }

  async getComplexityGraphData(complexityType, maxInputSize = 50) {
    return this.request('/api/graph-data', {
      method: 'POST',
      body: JSON.stringify({ 
        complexity_type: complexityType, 
        max_input_size: maxInputSize 
      }),
    });
  }
}

export const apiService = new ApiService();
