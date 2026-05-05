# 📖 Scripture School

A full-stack web application for scripture learning and study, built with Next.js and Express.

---

## 🧱 Tech Stack

### Frontend (`/client`)

- **Framework**: [Next.js 15](https://nextjs.org/) with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives + shadcn/ui patterns
- **State Management**: TanStack React Query v5
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Drag & Drop**: @hello-pangea/dnd
- **Real-time**: Socket.IO client
- **Notifications**: Sonner
- **File Handling**: React Dropzone, XLSX

### Backend (`/server`)

- **Runtime**: Node.js
- **Framework**: Express v5
- **Language**: TypeScript
- **Database**: MongoDB via Mongoose
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.IO
- **File Uploads**: Multer + Cloudinary
- **Email**: Nodemailer
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: express-validator

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB instance (local or Atlas)
- Cloudinary account (for media uploads)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/scripture-school.git
cd scripture-school
```

### 2. Set up the Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=your_smtp_host
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
CLIENT_URL=http://localhost:3000
```

Start the development server:

```bash
npm run dev
```

### 3. Set up the Frontend

```bash
cd client
npm install
```

Create a `.env.local` file in the `client` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 📁 Project Structure

```
scripture-school/
├── client/                  # Next.js frontend
│   ├── app/                 # App router pages and layouts
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and config
│   └── public/              # Static assets
│
└── server/                  # Express backend
    └── src/
        ├── controllers/     # Route handlers
        ├── middleware/       # Auth, validation, etc.
        ├── models/          # Mongoose schemas
        ├── routes/          # API routes
        ├── migrations/      # Database migrations
        └── server.ts        # Entry point
```

---

## 📜 Available Scripts

### Frontend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

### Backend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with nodemon |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run compiled production build |
| `npm run lint` | Type-check with TypeScript |
| `npm run migrate` | Run database migrations |

---

## 🔐 Environment Variables

> Never commit `.env` files to version control. Use `.env.example` files as templates.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request


