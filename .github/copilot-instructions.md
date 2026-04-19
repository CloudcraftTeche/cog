# LOGOS - Smart Scripture School
## Church of God (Full Gospel) in India - Dubai

## Project Overview

A full-stack **Learning Management System (LMS)** for managing Sunday school operations including students, teachers, assignments, attendance tracking, grades, and real-time communication.

---

## Quick Start

```bash
# Start both client and server
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm run dev
```

**URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Base: http://localhost:5000/api/v1

---

## Project Structure

```
cog/
├── client/                 # Next.js 15 Frontend
│   ├── app/               # Pages & Routes (App Router)
│   ├── components/        # UI Components
│   ├── hooks/             # Custom React Hooks
│   ├── lib/               # API client, utilities
│   ├── providers/         # React Context
│   ├── types/             # TypeScript types
│   └── utils/             # Services & helpers
│
├── server/                 # Express.js Backend
│   └── src/
│       ├── controllers/   # Business logic
│       ├── routes/        # API endpoints
│       ├── models/        # MongoDB schemas
│       ├── middleware/    # Auth, validation
│       └── lib/           # Database, sockets, email
│
└── docker-compose.yml      # Container orchestration
```

---

## Technology Stack

### Frontend (client/)
| Tech | Purpose |
|------|---------|
| Next.js 15 | React framework (App Router) |
| React 19 | UI library |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Radix UI | Accessible components |
| TanStack Query | Data fetching & caching |
| React Hook Form + Zod | Forms & validation |
| Socket.IO Client | Real-time features |
| Axios | HTTP requests |

### Backend (server/)
| Tech | Purpose |
|------|---------|
| Express 5 | HTTP server |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database |
| Socket.IO | Real-time (chat, notifications) |
| JWT | Authentication |
| Cloudinary | File storage |
| Nodemailer | Email service |

---

## User Roles & Access

| Role | Description | Access Level |
|------|-------------|--------------|
| **superAdmin** | System administrator | Full access, manage admins |
| **admin** | Grade/class administrator | Manage teachers, students, curriculum |
| **teacher** | Instructor | Assignments, attendance, chapters |
| **student** | Learner | View content, submit work |

---

## Core Features

### 📚 Academic
- **Grades & Units** - Curriculum organization
- **Chapters** - Learning content with videos/PDFs
- **Assignments** - Homework with various question types
- **Submissions** - Student work with grading

### 👥 User Management
- **Students** - Registration, profiles, progress
- **Teachers** - Management, chapter assignments
- **Admins** - Administrative operations

### ✅ Attendance
- **Student Attendance** - Daily tracking
- **Teacher Attendance** - Staff tracking

### 💬 Communication
- **Real-time Chat** - Socket.IO powered messaging
- **Announcements** - School-wide notifications
- **Queries** - Support ticket system

### 📊 Reporting
- **Grade Reports** - Student performance
- **Attendance Reports** - CSV exports
- **Dashboard Analytics** - Overview statistics

---

## API Structure

All endpoints: `http://localhost:5000/api/v1/`

| Endpoint | Description |
|----------|-------------|
| `/auth` | Login, logout, password reset |
| `/students` | Student CRUD operations |
| `/teachers` | Teacher management |
| `/grades` | Grade/class management |
| `/chapters` | Curriculum content |
| `/assignments` | Homework/tests |
| `/submissions` | Student submissions |
| `/attendance` | Student attendance |
| `/teacher-attendance` | Teacher attendance |
| `/announcements` | Notifications |
| `/chat` | Real-time messaging |
| `/queries` | Support tickets |
| `/dashboard` | Analytics data |

---

## Authentication Flow

```
1. User submits credentials → /auth/login
2. Server returns { accessToken, refreshToken, user }
3. Client stores in localStorage
4. All requests include: Authorization: Bearer <accessToken>
5. On 401 → Auto-refresh using refreshToken
6. On refresh fail → Redirect to /login
```

---

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Server    │────▶│   MongoDB   │
│  (Next.js)  │◀────│  (Express)  │◀────│  Database   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │    Socket.IO      │
       └───────────────────┘
            Real-time
```

---

## Environment Variables

### Client (.env.local)
```
NEXT_PUBLIC_SERVERURL=http://localhost:5000/api/v1
```

### Server (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/scripture-school
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-app-password
WHITELISTORIGINS=http://localhost:3000
```

---

## Development Commands

### Client
```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run lint     # ESLint check
```

### Server
```bash
npm run dev      # Start with nodemon
npm run build    # Compile TypeScript
npm start        # Production mode
npm run migrate  # Run migrations
```

---

## Docker

```bash
# Build and run all services
docker-compose up --build

# Stop services
docker-compose down
```

---

## Folder-Specific Documentation

- **Frontend details**: See `client/.github/copilot-instructions.md`
- **Backend details**: See `server/.github/copilot-instructions.md`

---

## Common Development Tasks

### Adding a New Feature

1. **Backend:**
   - Create model in `server/src/models/`
   - Create controller in `server/src/controllers/v1/<feature>/`
   - Create routes in `server/src/routes/v1/<feature>/`
   - Register in `server/src/routes/v1/index.ts`

2. **Frontend:**
   - Create types in `client/types/`
   - Create service in `client/utils/`
   - Create hook in `client/hooks/`
   - Create components in `client/components/`
   - Create page in `client/app/dashboard/<role>/<feature>/`

### Debugging

1. **Frontend**: Browser DevTools (F12) → Console & Network tabs
2. **Backend**: Check terminal logs, use `console.log()`
3. **Database**: MongoDB Compass or `mongosh`

---

## Contact / Organization

**Church of God (Full Gospel) in India - Dubai**

Project: LOGOS - Smart Scripture School
