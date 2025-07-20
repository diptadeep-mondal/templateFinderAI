# Template Finder Assistant

A modern AI-powered chatbot interface for discovering automation templates. Features a dark theme design with intelligent message classification and API integration.

## 🚀 Deployment Options

### Option 1: Replit (Recommended)
- Full functionality with Flask backend
- API proxy handles CORS issues
- Click "Deploy" in Replit for instant hosting

### Option 2: GitHub Pages
- Static hosting (frontend only)
- Direct API calls (may have CORS limitations)
- Upload files to GitHub repository and enable Pages

### Option 3: Local Development
1. Install Python 3.11+
2. Install dependencies: `pip install flask requests`
3. Run: `python main.py`
4. Open `http://localhost:5000`

## 📁 Files

- `index.html` - Main chat interface
- `style.css` - Dark theme styling and responsive design  
- `script.js` - Chat functionality with smart environment detection
- `main.py` - Flask backend with API proxy (for server deployments)
- `pyproject.toml` - Python dependencies

## ✨ Features

- **Smart Message Classification**: Distinguishes between search queries and casual conversation
- **Environment Detection**: Automatically uses the best API approach for each hosting platform
- **Responsive Design**: Works perfectly on mobile and desktop
- **Typing Animations**: Realistic bot interaction with typing indicators
- **Template Cards**: Beautiful display of search results with metadata

## 🔧 Configuration

The app automatically detects the hosting environment:
- **Replit/Localhost**: Uses Flask proxy at `/api/search-templates`
- **GitHub Pages/Static**: Direct API calls with CORS handling

## 🎯 Usage

Try these example queries:
- "Find email automation templates"
- "Show me Slack workflows"
- "I need CRM templates"

For casual conversation:
- "Hello"
- "How are you?"
- "Thanks"

The bot intelligently determines whether to search for templates or respond conversationally.