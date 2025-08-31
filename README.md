# Todo API - Backend CRUD Features

A TypeScript REST API for managing todo items with JWT authentication.

## Features

- CRUD operations for todos
- JWT authentication
- Owner-based authorization
- Advanced filtering (category, priority, completion, due date, search, ownerId)
- Comprehensive test coverage

## Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Jest** - Testing framework
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## Setup


1. Change to the project directory:
```bash
cd Backend-CRUD-todoItems
```

2. Install dependencies:
```bash
npm install
```


3. Create environment files:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

5. Run tests:
```bash
npm test
```

## Demo Users

| Email | Password |
|-------|----------|
| user1@example.com | password123 |
| user2@example.com | password456 |

## Demo Todos

The application comes with 3 pre-loaded todos for `user1@example.com`:

| ID | Title | Category | Priority | Completed | Due Date |
|----|-------|----------|----------|-----------|----------|
| todo_1 | Complete backend API | work | high | false | 2024-09-01 |
| todo_2 | Buy groceries | personal | medium | true | 2024-09-02 |
| todo_3 | Plan weekend trip | personal | low | false | 2024-09-05 |

## API Endpoints

### Authentication
```http
POST /api/auth/login         # User login
POST /api/auth/register      # Create new user
```

### Todos
```http
GET    /api/todos           # Get all todos with advanced filtering support (no auth required)
                             # Available filters: category, priority, completed, dueDate, ownerId
                             # search filter: searches title and description fields
GET    /api/todos/:id       # Get specific todo (no auth required)
POST   /api/todos           # Create todo (requires authentication)
PATCH  /api/todos/:id       # Update todo (requires authentication, owner only)
DELETE /api/todos/:id       # Delete todo (requires authentication, owner only)
```


## API Documentation (Swagger)

Interactive API docs are available via Swagger UI:

**URL:** [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

- Explore and try out all endpoints directly in your browser.
- For protected endpoints, click the "Authorize" button and enter your JWT token as `Bearer <token>`.
- All request/response schemas, query parameters, and error types are documented.

---

## Example Usage

1. Login to get token:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"password123"}'
```

2. Create todo:
```bash
curl -X POST http://localhost:4000/api/todos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Todo","category":"work","priority":"high"}'
```

3. Filter todos:
```bash
curl "http://localhost:4000/api/todos?category=work&priority=high"
```

4. Update todo:
```bash
curl -X PATCH http://localhost:4000/api/todos/todo_1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"completed":true,"priority":"medium"}'
```

5. Delete todo:
```bash
curl -X DELETE http://localhost:4000/api/todos/todo_1 \
  -H "Authorization: Bearer <token>"
```

## Testing

- 57 comprehensive tests covering all functionality
- Run with `npm test`

### Latest Test Results

```
PASS  __tests__/todo.test.ts
PASS  __tests__/auth.test.ts

Test Suites: 2 passed, 2 total
Tests:       57 passed, 57 total
Snapshots:   0 total
Time:        ~2 s

Example HTTP status codes observed during tests:
  200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found
```

