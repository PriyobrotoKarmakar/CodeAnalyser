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

def handler(request):
    """Main Vercel serverless function handler"""
    # Set CORS headers for all responses
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    # Handle OPTIONS (preflight) requests
    if request.method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    # Handle GET requests for API status
    if request.method == 'GET':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                "status": "API is running",
                "endpoints": [
                    "/api/create",
                    "/api/complexity", 
                    "/api/debug",
                    "/api/graph-data"
                ]
            })
        }
    
    # Handle POST requests
    if request.method == 'POST':
        try:
            # Parse request data
            if hasattr(request, 'get_json'):
                data = request.get_json()
            else:
                # Fallback for different request formats
                body = request.body if hasattr(request, 'body') else request.data
                if isinstance(body, bytes):
                    body = body.decode('utf-8')
                data = json.loads(body) if body else {}
            
            # Get the endpoint from URL path
            path = request.path if hasattr(request, 'path') else request.url
            path = path.strip('/').split('/')[-1]  # Get last part of path
            
            print(f"Processing request for endpoint: '{path}'")
            
            # Initialize Gemini API
            api_key = os.environ.get('GEMINI_API_KEY')
            if not api_key:
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({'error': 'GEMINI_API_KEY not configured'})
                }
            
            try:
                client = genai.Client(api_key=api_key)
                print("Gemini client initialized successfully")
            except Exception as gemini_error:
                print(f"Gemini initialization error: {str(gemini_error)}")
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({'error': f'Gemini API error: {str(gemini_error)}'})
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
                    'body': json.dumps({'error': f'Endpoint /{path} not found'})
                }
                
        except Exception as e:
            print(f"Error: {str(e)}")
            print(traceback.format_exc())
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': f'Internal server error: {str(e)}'})
            }
    
    # Method not allowed
    return {
        'statusCode': 405,
        'headers': headers,
        'body': json.dumps({'error': 'Method not allowed'})
    }

def handle_complexity(client, data, headers):
    """Handle complexity analysis"""
    code = data.get('code', '').strip()
    if not code:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Code is required'})
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
            model="gemini-2.5-flash",
            contents=prompt
        )
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'analysis': response.text
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Error analyzing code: {str(e)}'})
        }

def handle_debug(client, data, headers):
    """Handle code debugging"""
    code = data.get('code', '').strip()
    if not code:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Code is required'})
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
            model="gemini-2.5-flash",
            contents=prompt
        )
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'debug_report': response.text
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Error debugging code: {str(e)}'})
        }

def handle_create(client, data, headers):
    """Handle code generation"""
    problem_statement = data.get('problem_statement', '').strip()
    language = data.get('language', '').strip()
    
    if not problem_statement:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Problem statement is required'})
        }
    if not language:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Programming language is required'})
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
            model="gemini-2.5-flash",
            contents=prompt
        )
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'generated_code': response.text,
                'language': language
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Error generating code: {str(e)}'})
        }

def handle_graph_data(client, data, headers):
    """Handle graph data generation"""
    complexity_type = data.get('complexity_type', '').strip()
    max_input_size = data.get('max_input_size', 50)
    
    if not complexity_type:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Complexity type is required'})
        }
    
    # Generate fallback data mathematically (more reliable than AI for graph data)
    graph_data = generate_mathematical_data(complexity_type, max_input_size)
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'success': True,
            'graph_data': graph_data
        })
    }

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
