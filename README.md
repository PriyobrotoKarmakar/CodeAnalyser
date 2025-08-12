# Code Analyzer - Full Stack Application

A modern, full-stack web application for code analysis and generation featuring complexity analysis, debugging, and AI-powered code generation.

## Features

🔍 **Complexity Analysis**: Analyze time and space complexity of your code with detailed explanations
🐛 **Debug Code**: Find bugs and get suggestions for fixes in your code
🚀 **Code Generation**: Generate code solutions from natural language descriptions
🌙 **Dark/Light Mode**: Toggle between beautiful dark and light themes
📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
🎨 **Modern UI**: Clean, aesthetic interface with smooth animations

## Tech Stack

### Frontend
- **React.js** with TypeScript
- **Styled Components** for styling
- **Lucide React** for icons
- **Context API** for state management

### Backend
- **Django REST Framework**
- **Google Gemini AI** for code analysis
- **CORS** enabled for frontend communication
- **Environment-based configuration**

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

6. Run migrations:
```bash
python manage.py migrate
```

7. Start the Django development server:
```bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### POST /api/complexity/
Analyze code complexity
```json
{
  "code": "your code here"
}
```

### POST /api/debug/
Debug code and get suggestions
```json
{
  "code": "your code here"
}
```

### POST /api/create/
Generate code from description
```json
{
  "problem_statement": "description of the problem",
  "language": "python"
}
```

## Project Structure

```
├── backend/
│   ├── api/
│   │   ├── views.py          # API endpoints
│   │   ├── urls.py           # URL routing
│   │   └── gemini_service.py # Gemini AI integration
│   ├── code_analyzer/
│   │   ├── settings.py       # Django settings
│   │   └── urls.py           # Main URL configuration
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts
│   │   ├── services/         # API services
│   │   ├── styles/           # Styled components
│   │   └── App.tsx           # Main app component
│   ├── package.json          # Node dependencies
│   └── public/               # Static files
└── README.md
```

## Usage

1. **Complexity Analysis**: Paste your code in the input area and click "Analyze Complexity" to get detailed time and space complexity analysis.

2. **Debug Code**: Submit problematic code to get detailed debugging reports with suggested fixes.

3. **Generate Code**: Describe a programming problem in natural language, select your preferred programming language, and get a complete solution.

4. **Theme Toggle**: Click the sun/moon icon in the header to switch between light and dark modes.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powerful code analysis capabilities
- [React](https://reactjs.org/) for the frontend framework
- [Django](https://www.djangoproject.com/) for the backend framework
- [Styled Components](https://styled-components.com/) for component styling
- [Lucide](https://lucide.dev/) for beautiful icons
