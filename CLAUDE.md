# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a complete full-stack tutorial project demonstrating both frontend and backend development. It includes:

- **Backend**: Flask-based REST API for task management with full CRUD operations
- **Frontend**: Vanilla JavaScript application demonstrating DOM manipulation, Fetch API, and modern web development practices
- **Integration**: Complete communication between frontend and backend using REST principles

## Development Commands

### Environment activation

```bash
.\.venv\Scripts\Activate
```

### Installation and Setup

```bash
pip install -r requirements.txt
```

### Running the Application

```bash
python app.py
```

- Server runs on http://localhost:5000
- Debug mode enabled by default
- Auto-reload on code changes
- **Frontend accessible at**: http://localhost:5000 (main interface)
- **API documentation at**: http://localhost:5000/api/

### Testing the Application

#### Using the Web Interface
- Open http://localhost:5000 in your browser
- Use the web interface to create, update, and delete tasks
- Interactive frontend with real-time updates

#### Testing the API directly

Use curl commands for testing endpoints:

```bash
# Get all tasks
curl -X GET http://localhost:5000/tasks

# Create new task  
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test task", "description": "Description"}'

# Update task
curl -X PUT http://localhost:5000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete task
curl -X DELETE http://localhost:5000/tasks/1
```

## Architecture

### Core Components

#### Backend (Flask API)
- **app.py**: Single-file application containing all API logic and static file serving
- **In-memory storage**: Uses Python lists/dicts instead of database
- **Global variables**: `tasks` list and `next_id` counter for ID generation

#### Frontend (Static Files in /static/)
- **index.html**: Complete HTML structure with semantic markup and accessibility features
- **styles.css**: Modern CSS with variables, responsive design, and educational comments
- **app.js**: Vanilla JavaScript with DOM manipulation, Fetch API, and state management

### API Design Patterns

- Consistent JSON response format with `success`, `data`, `message` fields
- Proper HTTP status codes (200, 201, 404, 400, 405, 500)
- RESTful URL structure (`/tasks` for collection, `/tasks/<id>` for individual resources)
- Complete CRUD operations mapped to HTTP methods

### Error Handling
- Global error handlers for 404, 405, and 500 status codes
- Input validation for required fields and JSON format
- Consistent error response format across all endpoints

### Key Flask Features Used
- Route decorators with HTTP method specification
- URL parameter conversion (`<int:task_id>`)
- Request JSON parsing and validation
- JSON response generation with `jsonify()`
- Global error handlers

### Data Structure
Tasks are stored as dictionaries with fields:
- `id`: Unique integer identifier
- `title`: String (required)
- `description`: String (optional)
- `completed`: Boolean (default False)
- `created_at`: ISO format timestamp

## Frontend Architecture & Learning Concepts

### JavaScript Concepts Demonstrated
- **DOM Manipulation**: Element selection, creation, and modification
- **Event Handling**: Form submission, button clicks, event delegation
- **Async Programming**: Fetch API, Promises, async/await patterns
- **State Management**: Application state tracking and UI updates
- **Error Handling**: Try-catch blocks, user feedback, graceful degradation

### CSS Concepts Demonstrated
- **CSS Variables**: Centralized theming and maintainable colors
- **Responsive Design**: Mobile-first approach, media queries
- **Flexbox & Grid**: Modern layout techniques
- **Animations**: CSS transitions and keyframe animations
- **Component-based Styling**: Reusable button and card components

### HTML Concepts Demonstrated
- **Semantic HTML5**: Proper use of header, main, section, etc.
- **Accessibility**: ARIA labels, proper form labels, keyboard navigation
- **Progressive Enhancement**: Works without JavaScript, enhanced with it

## Development Notes

- This is an educational/tutorial codebase with extensive documentation
- **Full-stack learning**: Frontend and backend working together
- In-memory storage means data resets on server restart
- No authentication or authorization implemented
- **CORS configured**: Frontend and backend run on same origin (no CORS issues)
- Input sanitization demonstrated on both frontend (XSS prevention) and backend validation

### Project Structure
```
├── app.py                 # Flask backend with API and static file serving
├── static/               # Frontend files
│   ├── index.html       # Main HTML application
│   ├── styles.css       # CSS with educational comments
│   └── app.js           # JavaScript with comprehensive examples
├── requirements.txt      # Python dependencies
└── CLAUDE.md            # This documentation
```