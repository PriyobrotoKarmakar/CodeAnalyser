import os
import json
from google import genai
import traceback
import math
import random
from http.server import HTTPServer, BaseHTTPRequestHandler

# Load environment variables from .env file for local development
try:
    from dotenv import load_dotenv
    # Try multiple paths for .env file
    env_loaded = load_dotenv('../.env')  # Load from parent directory
    if not env_loaded:
        env_loaded = load_dotenv('.env')  # Try current directory
    print(f"Environment file loaded: {env_loaded}")
except ImportError:
    # dotenv not available (production environment)
    print("dotenv not available, using system environment variables")
    pass

# Debug: Check if API key is loaded
api_key_check = os.environ.get('GEMINI_API_KEY')
print(f"API key loaded: {'Yes' if api_key_check else 'No'}")
if api_key_check:
    print(f"API key starts with: {api_key_check[:10]}...")  # Show first 10 chars for debugging

# Load multiple models for fallback system
GEMINI_MODELS = [
    os.environ.get('GEMINI_MODEL_1', 'gemini-1.5-flash'),
    os.environ.get('GEMINI_MODEL_2', 'gemini-1.0-pro'),
    os.environ.get('GEMINI_MODEL_3', 'gemini-1.5-flash-8b')
]
print(f"Loaded fallback models: {GEMINI_MODELS}")

def try_gemini_request(client, prompt, max_retries=3):
    """Try Gemini request with fallback models"""
    for i, model in enumerate(GEMINI_MODELS):
        try:
            print(f"Trying model {i+1}: {model}")
            response = client.models.generate_content(
                model=model,
                contents=prompt
            )
            print(f"✅ Success with model {i+1}: {model}")
            return response
        except Exception as e:
            error_msg = str(e).lower()
            print(f"❌ Model {i+1} ({model}) failed: {str(e)}")
            
            # Check if it's a rate limit error
            if 'quota' in error_msg or 'rate limit' in error_msg or '503' in error_msg or 'overloaded' in error_msg:
                if i < len(GEMINI_MODELS) - 1:  # Not the last model
                    print(f"🔄 Rate limit hit, switching to model {i+2}")
                    continue
            
            # If it's not a rate limit error or it's the last model, re-raise
            if i == len(GEMINI_MODELS) - 1:
                raise Exception(f"All models failed. Last error: {str(e)}")
            else:
                continue
    
    raise Exception("All fallback models exhausted")

class LocalAPIHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        """Set CORS headers for all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Max-Age', '86400')
    
    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests for API status"""
        try:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._set_cors_headers()
            self.end_headers()
            
            response = {
                "status": "API is running",
                "endpoints": [
                    "/api/create",
                    "/api/complexity", 
                    "/api/debug",
                    "/api/graph-data"
                ]
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
        except Exception as e:
            print(f"GET Error: {str(e)}")
            self._send_error(500, f"Internal server error: {str(e)}")
    
    def do_POST(self):
        """Handle all POST requests"""
        try:
            # Parse the request path and normalize it
            path = self.path.strip('/')
            
            # Remove 'api/' prefix if present
            if path.startswith('api/'):
                path = path[4:]
            
            # Remove any trailing slashes and normalize
            path = path.rstrip('/')
            
            print(f"Processing request for path: '{path}'")
            
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
            else:
                data = {}
            
            # Initialize Gemini API
            api_key = os.environ.get('GEMINI_API_KEY')
            if not api_key:
                self._send_error(500, "GEMINI_API_KEY not configured")
                return
            
            print(f"Using API key in request: {api_key[:10]}...")
            
            try:
                client = genai.Client(api_key=api_key)
                print("Gemini client initialized successfully")
            except Exception as gemini_error:
                print(f"Gemini initialization error: {str(gemini_error)}")
                self._send_error(500, f"Gemini API error: {str(gemini_error)}")
                return
            
            # Route to appropriate handler
            if path == 'complexity':
                self._handle_complexity(client, data)
            elif path == 'debug':
                self._handle_debug(client, data)
            elif path == 'create':
                self._handle_create(client, data)
            elif path == 'graph-data':
                self._handle_graph_data(client, data)
            else:
                self._send_error(404, f"Endpoint /{path} not found")
                
        except Exception as e:
            print(f"Error: {str(e)}")
            print(traceback.format_exc())
            self._send_error(500, f"Internal server error: {str(e)}")
    
    def _handle_complexity(self, client, data):
        """Handle complexity analysis"""
        code = data.get('code', '').strip()
        if not code:
            self._send_error(400, "Code is required")
            return
        
        prompt = f"""
        Analyze the time and space complexity of the following code snippet. 
        
        Format your response as:
        **Time Complexity:** O(notation)
        **Space Complexity:** O(notation)
        
        Use markdown formatting. Do not include any explanations, reasoning, or additional text.
        
        Code to analyze:
        ```
        {code}
        ```
        """
        
        try:
            response = try_gemini_request(client, prompt)
            analysis = response.text
            
            self._send_success({
                "success": True,
                "analysis": analysis
            })
        except Exception as e:
            print(f"Complexity analysis error: {str(e)}")
            self._send_error(500, f"Complexity analysis failed: {str(e)}")
    
    def _handle_debug(self, client, data):
        """Handle code debugging"""
        code = data.get('code', '').strip()
        if not code:
            self._send_error(400, "Code is required")
            return
        
        prompt = f"""
        As a code expert, analyze the following code for bugs, errors, and issues.
        
        Format your response with markdown:
        
        ### Issues Found:
        - **Error Type:** Description of the issue
        
        ### Suggested Fixes:
        - **Fix:** Specific solution for each issue
        
        ### Improved Code:
        ```python
        # Your improved code here
        ```
        
        Use markdown formatting with proper code blocks for code examples.
        
        Code to debug:
        ```
        {code}
        ```
        """
        
        try:
            response = try_gemini_request(client, prompt)
            analysis = response.text
            
            self._send_success({
                "success": True,
                "analysis": analysis
            })
        except Exception as e:
            print(f"Debug analysis error: {str(e)}")
            self._send_error(500, f"Debug analysis failed: {str(e)}")
    
    def _handle_create(self, client, data):
        """Handle code generation"""
        problem_statement = data.get('problem_statement', '').strip()
        language = data.get('language', '').strip()
        
        if not problem_statement:
            self._send_error(400, "Problem statement is required")
            return
        if not language:
            self._send_error(400, "Language is required")
            return
        
        prompt = f"""
        Generate a {language} code solution for the following problem:
        
        Problem: {problem_statement}
        
        Format your response with markdown:
        
        ### Solution:
        ```{language}
        // Your code solution here
        ```
        
        ### Explanation:
        Brief explanation of the approach
        
        ### Complexity:
        **Time:** O(notation)  
        **Space:** O(notation)
        
        Use proper markdown formatting with code blocks for the solution.
        """
        
        try:
            response = try_gemini_request(client, prompt)
            solution = response.text
            
            self._send_success({
                "success": True,
                "solution": solution
            })
        except Exception as e:
            print(f"Code generation error: {str(e)}")
            self._send_error(500, f"Code generation failed: {str(e)}")
    
    def _handle_graph_data(self, client, data):
        """Handle graph data generation"""
        complexity_type = data.get('complexity_type', '').strip()
        max_input_size = data.get('max_input_size', 50)
        
        if not complexity_type:
            self._send_error(400, "Complexity type is required")
            return
        
        try:
            graph_data = generate_mathematical_data(complexity_type, max_input_size)
            self._send_success({
                "success": True,
                "data": graph_data
            })
        except Exception as e:
            print(f"Graph data generation error: {str(e)}")
            self._send_error(500, f"Graph data generation failed: {str(e)}")
    
    def _send_success(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def _send_error(self, status_code, message):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        error_response = {"error": message}
        self.wfile.write(json.dumps(error_response).encode('utf-8'))

def generate_mathematical_data(complexity_type, max_input_size):
    """Generate mathematical data for complexity graphs"""
    data = []
    for n in range(1, max_input_size + 1):
        if 'o(1)' in complexity_type.lower() or 'constant' in complexity_type.lower():
            operations = 1 + random.uniform(-0.1, 0.1)
        elif 'o(log' in complexity_type.lower() or 'logarithmic' in complexity_type.lower():
            operations = math.log2(n) + random.uniform(-0.5, 0.5)
        elif 'o(n²)' in complexity_type.lower() or 'o(n^2)' in complexity_type.lower() or 'quadratic' in complexity_type.lower():
            operations = n * n + random.uniform(-n, n)
        elif 'o(n³)' in complexity_type.lower() or 'o(n^3)' in complexity_type.lower() or 'cubic' in complexity_type.lower():
            operations = n * n * n + random.uniform(-n*n, n*n)
        elif 'o(n log n)' in complexity_type.lower() or 'linearithmic' in complexity_type.lower():
            operations = n * math.log2(n) + random.uniform(-n/2, n/2)
        elif '2^n' in complexity_type.lower() or 'exponential' in complexity_type.lower():
            operations = 2 ** min(n, 20) + random.uniform(-10, 10)
        else:  # linear or default
            operations = n + random.uniform(-0.5, 0.5)
        
        data.append({
            "input_size": n,
            "operations": max(1, round(operations, 2))
        })
    
    return data

if __name__ == "__main__":
    port = 8000
    server = HTTPServer(('localhost', port), LocalAPIHandler)
    print(f"🚀 Local API server running at http://localhost:{port}")
    print(f"📋 API Status: http://localhost:{port}/api/")
    print(f"🔧 API Endpoints:")
    print(f"   POST http://localhost:{port}/api/complexity")
    print(f"   POST http://localhost:{port}/api/debug")
    print(f"   POST http://localhost:{port}/api/create")
    print(f"   POST http://localhost:{port}/api/graph-data")
    print(f"💡 Press Ctrl+C to stop the server")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped")
        server.server_close()
