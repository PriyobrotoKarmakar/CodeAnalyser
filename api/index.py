import os
import json
from google import genai
import traceback
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

def handler(request):
    """Main Vercel serverless function handler"""
    # Set CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    try:
        # Handle preflight CORS requests
        if request.method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': ''
            }
        
        # Handle GET requests for API status
        if request.method == 'GET':
            response = {
                "status": "API is running",
                "endpoints": [
                    "/api/create",
                    "/api/complexity", 
                    "/api/debug",
                    "/api/graph-data"
                ]
            }
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(response)
            }
        
        # Handle POST requests
        if request.method == 'POST':
            # Parse the request path and normalize it
            path = request.url.path.strip('/')
            
            # Remove 'api/' prefix if present
            if path.startswith('api/'):
                path = path[4:]
            
            # Remove any trailing slashes and normalize
            path = path.rstrip('/')
            
            print(f"Processing request for path: '{path}'")
            
            # Read request body
            try:
                data = json.loads(request.body) if request.body else {}
            except json.JSONDecodeError:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({"error": "Invalid JSON in request body"})
                }
            
            # Initialize Gemini API
            api_key = os.environ.get('GEMINI_API_KEY')
            if not api_key:
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({"error": "GEMINI_API_KEY not configured"})
                }
            
            print(f"Using API key in request: {api_key[:10]}...")
            
            try:
                client = genai.Client(api_key=api_key)
                print("Gemini client initialized successfully")
            except Exception as gemini_error:
                print(f"Gemini initialization error: {str(gemini_error)}")
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({"error": f"Gemini API error: {str(gemini_error)}"})
                }
            
            # Route to appropriate handler
            if path == 'complexity':
                return handle_complexity(client, data, headers)
            elif path == 'debug':
                return handle_debug(client, data, headers)
            elif path == 'create':
                return handle_create(client, data, headers)
            elif path == 'graph-data':
                return handle_graph_data(client, data, headers)
            else:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({"error": f"Endpoint /{path} not found"})
                }
        
        # Method not allowed
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({"error": "Method not allowed"})
        }
                
    except Exception as e:
        print(f"Error: {str(e)}")
        print(traceback.format_exc())
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({"error": f"Internal server error: {str(e)}"})
        }

def handle_complexity(client, data, headers):
    """Handle complexity analysis"""
    code = data.get('code', '').strip()
    if not code:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({"error": "Code is required"})
        }
    
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
            model='gemini-1.5-flash',
            contents=prompt
        )
        analysis = response.text
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                "success": True,
                "analysis": analysis
            })
        }
    except Exception as e:
        print(f"Complexity analysis error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({"error": f"Complexity analysis failed: {str(e)}"})
        }

def handle_debug(client, data, headers):
    """Handle code debugging"""
    code = data.get('code', '').strip()
    if not code:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({"error": "Code is required"})
        }
    
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
            model='gemini-1.5-flash',
            contents=prompt
        )
        analysis = response.text
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                "success": True,
                "analysis": analysis
            })
        }
    except Exception as e:
        print(f"Debug analysis error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({"error": f"Debug analysis failed: {str(e)}"})
        }

def handle_create(client, data, headers):
    """Handle code generation"""
    problem_statement = data.get('problem_statement', '').strip()
    language = data.get('language', '').strip()
    
    if not problem_statement:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({"error": "Problem statement is required"})
        }
    if not language:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({"error": "Language is required"})
        }
    
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
            model='gemini-1.5-flash',
            contents=prompt
        )
        solution = response.text
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                "success": True,
                "solution": solution
            })
        }
    except Exception as e:
        print(f"Code generation error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({"error": f"Code generation failed: {str(e)}"})
        }

def handle_graph_data(client, data, headers):
    """Handle graph data generation"""
    complexity_type = data.get('complexity_type', '').strip()
    max_input_size = data.get('max_input_size', 50)
    
    if not complexity_type:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({"error": "Complexity type is required"})
        }
    
    try:
        graph_data = generate_mathematical_data(complexity_type, max_input_size)
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                "success": True,
                "data": graph_data
            })
        }
    except Exception as e:
        print(f"Graph data generation error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({"error": f"Graph data generation failed: {str(e)}"})
        }

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
