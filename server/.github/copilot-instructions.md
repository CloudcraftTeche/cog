# Scripture School Backend - Project Guidelines

## Project Overview

This is a **Node.js/Express/TypeScript backend** for "Scripture School" - a school management system handling students, teachers, admins, assignments, attendance, and real-time chat.

## Technology Stack

| Technology | Purpose |
|------------|---------|
| Express 5 | HTTP server and routing |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database with ODM |
| Socket.IO | Real-time features (chat, notifications) |
| JWT | Authentication (access + refresh tokens) |
| Cloudinary | File storage (images, videos, PDFs) |
| Nodemailer | Email notifications |
| express-validator | Request validation |
| bcrypt | Password hashing |

## Architecture

```
src/
├── server.ts           # Entry point - Express setup, Socket.IO, graceful shutdown
├── config/             # Environment config, Cloudinary setup
├── routes/v1/          # API endpoint definitions (Router)
├── controllers/v1/     # Business logic handlers
├── middleware/         # Auth, validation, error handling, file upload
├── models/             # Mongoose schemas
├── lib/                # Shared utilities (DB connection, Socket.IO, email)
└── utils/              # Helpers (JWT, ApiError, cascading deletes)
```

## Key Patterns

### Request Flow
```
Route → Middleware(s) → Controller → Model → Response
```

### Error Handling
Always use try/catch with `next(err)` pattern:
```typescript
try {
  // logic
} catch (err) {
  next(err);
}
```

Use `ApiError` class for custom errors:
```typescript
throw new ApiError(404, "Resource not found");
throw new ApiError(401, "Invalid credentials");
```

### Authentication
- Use `authenticate` middleware for protected routes
- Use `authorizeRoles("admin", "teacher")` for role-based access
- JWT tokens: access (7d) + refresh (30d) stored in HTTP-only cookies

### Validation
Use express-validator in route files:
```typescript
const validation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 6 }),
];
router.post("/create", validation, validate, controllerFn);
```

### File Uploads
Use `upload` middleware from `middleware/upload.ts` with Cloudinary storage.

## User Roles

| Role | Access Level |
|------|--------------|
| superAdmin | Full system access, manage admins |
| admin | Manage teachers, students, assignments in their scope |
| teacher | View students, create assignments, mark attendance |
| student | View/submit assignments, view attendance |

## Database Models

### User Inheritance (Discriminator Pattern)
- `User` - Base model (name, email, password, role)
- `Student` - Extends User (rollNumber, parentContact, gradeId)
- `Teacher` - Extends User (subjects, qualifications, gradeIds)
- `Admin` - Extends User (permissions)

### Key Collections
- `grades` - Grade levels with units
- `chapters` - Curriculum content within units
- `assignments` - Homework/tests with questions
- `submissions` - Student assignment responses
- `attendance` / `teacherAttendance` - Daily attendance records
- `chats` / `messages` - Real-time messaging
- `announcements` - School-wide notifications
- `queries` - Support tickets

## API Structure

All routes prefixed with `/api/v1/`:

| Endpoint | Purpose |
|----------|---------|
| `/auth` | Login, logout, password reset, profile |
| `/students` | Student CRUD |
| `/teachers` | Teacher CRUD |
| `/admin` | Admin operations |
| `/grades` | Grade management |
| `/chapters` | Curriculum chapters |
| `/assignments` | Assignment CRUD |
| `/submissions` | Student submissions |
| `/attendance` | Student attendance |
| `/teacher-attendance` | Teacher attendance |
| `/announcements` | School announcements |
| `/chat` | Messaging |
| `/queries` | Support tickets |

## Code Conventions

### Naming
- Files: `kebab-case.ts` or `PascalCase.model.ts` for models
- Variables/functions: `camelCase`
- Interfaces: `IUser`, `IStudent` prefix
- Types: `PascalCase`

### Imports Order
1. External packages
2. Config
3. Models
4. Middleware
5. Utils
6. Types

### Controller Pattern
```typescript
export const getResource = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Extract params/body
    // 2. Validate/authorize
    // 3. Database operation
    // 4. Return response
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
```

### Response Format
```typescript
// Success
{ success: true, message: "...", data: {...} }

// Error (handled by errorHandler middleware)
{ success: false, message: "..." }
```

## Build & Run

```bash
npm run dev      # Development with nodemon
npm run build    # Compile TypeScript
npm start        # Production
npm run lint     # Type check
npm run migrate  # Run migrations
```

## Environment Variables

Required in `.env`:
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_ACCESS_SECRET` - Access token secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `CLOUDINARY_*` - Cloudinary credentials
- `EMAIL_*` - SMTP email config
- `WHITELISTORIGINS` - Comma-separated allowed origins

## Common Tasks

### Adding a New Endpoint
1. Create controller in `controllers/v1/<feature>/index.ts`
2. Create route in `routes/v1/<feature>/index.ts`
3. Register route in `routes/v1/index.ts`
4. Add validation rules in route file

### Adding a New Model
1. Create schema in `models/<category>/<Name>.model.ts`
2. Export and register with mongoose
3. Add TypeScript interface with `I` prefix

### Adding Middleware
1. Create in `middleware/<name>.ts`
2. Follow `(req, res, next)` signature
3. Call `next()` on success, `next(err)` on failure

## Real-Time Features

Socket.IO handles:
- User online/offline status
- Typing indicators
- Live chat messages
- Grade-based rooms for broadcasts

Authentication via token in handshake:
```typescript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // verify and attach user
});
```

## Testing Notes

- Use Postman or similar for API testing
- Set cookies for authenticated requests
- Health check: `GET /health`
