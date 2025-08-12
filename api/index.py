import os
import json
from google import genai
import traceback
import urllib.parse
import math
import random

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

from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
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
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            self._send_success({
                'success': True,
                'analysis': response.text
            })
        except Exception as e:
            self._send_error(500, f"Error analyzing code: {str(e)}")
    
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
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            self._send_success({
                'success': True,
                'debug_report': response.text
            })
        except Exception as e:
            self._send_error(500, f"Error debugging code: {str(e)}")
    
    def _handle_create(self, client, data):
        """Handle code generation"""
        problem_statement = data.get('problem_statement', '').strip()
        language = data.get('language', '').strip()
        
        if not problem_statement:
            self._send_error(400, "Problem statement is required")
            return
        if not language:
            self._send_error(400, "Programming language is required")
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
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            self._send_success({
                'success': True,
                'generated_code': response.text,
                'language': language
            })
        except Exception as e:
            self._send_error(500, f"Error generating code: {str(e)}")
    
    def _handle_graph_data(self, client, data):
        """Handle graph data generation"""
        complexity_type = data.get('complexity_type', '').strip()
        max_input_size = data.get('max_input_size', 50)
        
        if not complexity_type:
            self._send_error(400, "Complexity type is required")
            return
        
        # Generate fallback data mathematically (more reliable than AI for graph data)
        graph_data = generate_mathematical_data(complexity_type, max_input_size)
        
        self._send_success({
            'success': True,
            'graph_data': graph_data
        })
    
    def _send_success(self, data):
        """Send successful JSON response"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def _send_error(self, status_code, message):
        """Send error JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        error_response = {'error': message}
        self.wfile.write(json.dumps(error_response).encode('utf-8'))

def generate_mathematical_data(complexity_type, max_input_size):
    """Generate mathematical data for complexity graphs"""
    data = []
    for n in range(1, max_input_size + 1):
        if 'constant' in complexity_type.lower() or 'o(1)' in complexity_type.lower():
            operations = 1 + random.uniform(-0.1, 0.1)
        elif '!' in complexity_type.lower() or 'factorial' in complexity_type.lower():
            if n <= 7:
                operations = math.factorial(n) / 100 + random.uniform(-n*0.1, n*0.1)
            else:
                operations = (2 ** (n-3)) * 6 + random.uniform(-n*10, n*10)
            operations = max(1, operations)
        elif 'log' in complexity_type.lower() and 'nlog' not in complexity_type.lower():
            operations = math.log2(n) + random.uniform(-0.5, 0.5)
        elif 'nlog' in complexity_type.lower() or 'n log' in complexity_type.lower():
            operations = n * math.log2(n) + random.uniform(-n*0.1, n*0.1)
        elif 'n^2' in complexity_type.lower() or 'n²' in complexity_type.lower() or 'quadratic' in complexity_type.lower():
            operations = n * n + random.uniform(-n, n)
        elif 'n^3' in complexity_type.lower() or 'cubic' in complexity_type.lower():
            operations = n * n * n + random.uniform(-n*n*0.1, n*n*0.1)
        elif '2^n' in complexity_type.lower() or 'exponential' in complexity_type.lower():
            operations = 2 ** min(n, 20) + random.uniform(-10, 10)
        else:  # linear or default
            operations = n + random.uniform(-0.5, 0.5)
        
        data.append({
            "input_size": n,
            "operations": max(1, round(operations, 2))
        })
    
    return data
