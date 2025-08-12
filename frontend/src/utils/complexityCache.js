    // Cache manager for complexity graph data
export class ComplexityCacheManager {
  constructor() {
    this.cache = null;
    this.cacheLoaded = false;
  }

  // Load cache from JSON file
  async loadCache() {
    if (this.cacheLoaded) return this.cache;
    
    try {
      console.log('🔄 Loading complexity cache from /complexity-cache.json');
      const response = await fetch('/complexity-cache.json');
      if (!response.ok) {
        throw new Error(`Failed to load cache: ${response.status}`);
      }
      this.cache = await response.json();
      this.cacheLoaded = true;
      console.log('✅ Complexity cache loaded successfully', Object.keys(this.cache).length, 'entries');
      console.log('🔍 Sample keys:', Object.keys(this.cache).slice(0, 5));
      return this.cache;
    } catch (error) {
      console.error('❌ Failed to load complexity cache:', error);
      this.cache = {};
      this.cacheLoaded = true;
      return this.cache;
    }
  }

  // Normalize complexity string for consistent matching
  normalizeComplexity(complexity) {
    if (!complexity) return '';
    
    return complexity
      .toLowerCase()
      .replace(/\s+/g, '')           // Remove spaces
      .replace(/[^a-z0-9()^+\-*!/.]/g, '') // Keep more characters for complex expressions
      .replace(/√/g, 'sqrt')         // Convert √ to sqrt
      .replace(/\*\*/g, '^')         // Convert ** to ^ (Python style to standard)
      .trim();
  }

  // Get complexity data from cache
  async getComplexityData(complexity) {
    if (!this.cacheLoaded) {
      await this.loadCache();
    }

    const normalized = this.normalizeComplexity(complexity);
    console.log(`🔍 Looking for complexity: "${complexity}" -> normalized: "${normalized}"`);
    console.log(`📋 Cache keys available:`, Object.keys(this.cache || {}));
    console.log(`🎯 Does cache contain key "${normalized}"?`, this.cache && this.cache[normalized] ? 'YES' : 'NO');

    // Direct match
    if (this.cache[normalized]) {
      console.log(`✅ Cache HIT for: ${normalized}`);
      return {
        found: true,
        data: this.cache[normalized].data,
        name: this.cache[normalized].name,
        description: this.cache[normalized].description
      };
    }

    // Try alternative patterns
    const alternatives = this.getAlternativePatterns(normalized);
    for (const alt of alternatives) {
      if (this.cache[alt]) {
        console.log(`✅ Cache HIT for alternative: ${alt}`);
        return {
          found: true,
          data: this.cache[alt].data,
          name: this.cache[alt].name,
          description: this.cache[alt].description
        };
      }
    }

    console.log(`❌ Cache MISS for: ${normalized}`);
    return { found: false };
  }

  // Generate alternative patterns for better matching
  getAlternativePatterns(normalized) {
    const patterns = [];
    
    // Remove 'o' prefix variations
    if (normalized.startsWith('o(') && normalized.endsWith(')')) {
      const inner = normalized.slice(2, -1);
      patterns.push(inner);
      patterns.push(`o(${inner})`);
    }

    // Handle different notation styles
    const variations = {
      'n2': 'n^2',
      'n^2': 'n^2', 
      'n**2': 'n^2',
      'n3': 'n^3',
      'n^3': 'n^3',
      'n**3': 'n^3',
      'n4': 'n^4',
      'n^4': 'n^4',
      'n**4': 'n^4',
      'sqrt(n)': 'sqrt(n)',
      '√n': 'sqrt(n)',
      'logn': 'log n',
      'log(n)': 'log n',
      'nlogn': 'n log n',
      'n*logn': 'n log n',
      'n*log(n)': 'n log n',
      '2^n': '2^n',
      '2**n': '2^n',
      '3^n': '3^n',
      '3**n': '3^n',
      '4^n': '4^n',
      '4**n': '4^n',
      '4^(n*n)': '4^(n*n)',
      '4^(n^2)': '4^(n*n)',
      '4**(n*n)': '4^(n*n)',
      '4**(n^2)': '4^(n*n)',
      'factorial': 'n!',
      'fact': 'n!',
      'constant': '1',
      'linear': 'n',
      'quadratic': 'n^2',
      'cubic': 'n^3',
      'exponential': '2^n'
    };

    Object.entries(variations).forEach(([key, value]) => {
      if (normalized.includes(key)) {
        patterns.push(normalized.replace(key, value));
        patterns.push(`o(${normalized.replace(key, value)})`);
      }
    });

    return [...new Set(patterns)]; // Remove duplicates
  }

  // Save new complexity data to cache (for future enhancement)
  async saveToCache(complexity, data, name, description) {
    const normalized = this.normalizeComplexity(complexity);
    
    if (!this.cache) {
      await this.loadCache();
    }

    this.cache[normalized] = {
      name: name || `${complexity} Time`,
      description: description || `Operations for ${complexity} complexity`,
      data: data,
      cached_at: new Date().toISOString()
    };

    console.log(`💾 Saved new complexity to cache: ${normalized}`);
    
    // Note: In a real app, you'd want to persist this back to the server
    // For now, it's just stored in memory for the current session
  }

  // Get all cached complexities
  getAllCachedComplexities() {
    return this.cache ? Object.keys(this.cache) : [];
  }

  // Clear cache (for debugging)
  clearCache() {
    this.cache = {};
    this.cacheLoaded = false;
    console.log('🗑️ Cache cleared');
  }
}

// Export singleton instance
export const complexityCache = new ComplexityCacheManager();
