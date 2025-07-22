# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Flask-based REST API for task management, designed as a comprehensive tutorial demonstrating RESTful principles and Flask framework concepts. The API implements full CRUD operations for tasks with in-memory data storage.

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

### Testing the API

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

- **app.py**: Single-file application containing all API logic
- **In-memory storage**: Uses Python lists/dicts instead of database
- **Global variables**: `tasks` list and `next_id` counter for ID generation

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

## Development Notes

- This is an educational/tutorial codebase with extensive documentation
- In-memory storage means data resets on server restart
- No authentication or authorization implemented
- CORS not configured (add Flask-CORS if needed for browser requests)
- No input sanitization beyond basic validation