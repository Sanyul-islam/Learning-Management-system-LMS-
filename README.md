# EduStream LMS - Full-Stack Learning Management System

EduStream LMS is a modern, full-stack Learning Management System built using the **MERN** stack (**MongoDB, Express.js, React / Next.js with TypeScript, and Node.js**) styled with **Tailwind CSS**. It provides a role-based architecture featuring an **Admin Dashboard** for complete Course & Lecture management and an interactive **Student Panel** with responsive video streaming.

---

## 🚀 Key Features

### 1. Student Panel
- **Course Catalog (`/`)**:
  - Live database-backed course feed with real-time keyword search and category topic pills (*Web Development, Next.js, Python, Design*).
  - Displays course thumbnail, title, description, price (or Free badge), and lecture count.
  - Complete with loading skeleton state, empty search fallbacks, and error boundaries with retry buttons.
- **Course Details & Interactive Lecture Player (`/courses/[id]`)**:
  - Embedded video player supporting YouTube embeds (`watch?v=` & `youtu.be/` automatically converted to responsive embeds), Vimeo, and direct HTML5 `.mp4` video playback.
  - Structured syllabus playlist with active lesson indicators.
  - Previous / Next lesson navigation controls and course summary details.

### 2. Admin Dashboard
- **Authentication & Security (`/admin/login`)**:
  - Secure JWT authentication with bcrypt password hashing.
  - Pre-filled **"1-Click Fill"** test credentials button for immediate evaluation.
  - Protected admin routes with token verification middleware.
- **Course Management (`/admin`)**:
  - System overview metrics (*Total Courses, Total Lectures, Admin Session*).
  - Search and filter existing courses.
  - **Create Course Modal**: Title, description, price, and thumbnail URL with real-time preview.
  - **Edit Course Modal**: Modify existing courses.
  - **Delete Course**: Cascading deletion that removes both the course and all its associated lectures.
- **Lecture Management (`/admin/courses/[id]/lectures`)**:
  - Add lectures with title, description, video URL, and order index.
  - Display lectures associated with the specific course.
  - Built-in **"Test Video Player" modal** to verify embedded video playback.
  - Edit and delete existing lectures.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS + Lucide Icons.
- **Backend**: Node.js + Express.js following a clean **MVC** (Model-View-Controller) structure:
  - `server/src/models/`: Admin, Course, Lecture Mongoose schemas.
  - `server/src/controllers/`: `authController`, `courseController`, `lectureController`.
  - `server/src/routes/`: Modular REST API route handlers.
  - `server/src/middleware/`: JWT verification (`authMiddleware`) and global error handlers (`errorMiddleware`).
  - `server/src/services/dataService.js`: Unified data layer supporting MongoDB / Mongoose with instant local persistent storage fallback.
- **Database**:
  - **MongoDB** with Mongoose when `MONGODB_URI` is provided (e.g. MongoDB Atlas or local MongoDB).
  - **Auto-Sanitizer for Special Characters**: Automatically URL-encodes special characters in passwords (such as `@` converted to `%40`) to prevent MongoDB SRV parsing errors.
  - **Automatic Persistent Store Fallback**: If MongoDB is not running, the server seamlessly operates in zero-config persistent mode (`server/data/db.json`), ensuring the application starts immediately without external dependencies.

---

## 🔑 Test Credentials for Evaluation

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@lms.com` | `adminpassword123` |

*(Note: The Admin Login page also includes a **"1-Click Fill"** button for quick test evaluation)*

---

## 📦 Getting Started & Running Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Installation

Install dependencies for both frontend and backend:

```bash
# Install root (frontend) dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Environment Configuration

The backend environment file is configured at `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/Learning_management_system?retryWrites=true&w=majority
JWT_SECRET=lms_super_secret_jwt_key_2026_eval
ADMIN_EMAIL=admin@lms.com
ADMIN_PASSWORD=adminpassword123
CLIENT_URL=http://localhost:3000
```

> **Note on MongoDB Atlas URI:**
> If your password contains special characters (like `@`), our connection handler automatically URL-encodes them (`%40`) before connecting. If you don't have MongoDB installed locally, the server automatically starts in zero-setup persistent storage mode (`server/data/db.json`).

### 3. Database Seeding

To seed or reset the database with the default admin and 4 comprehensive sample courses with 12 lectures:

```bash
npm run seed
```

### 4. Running the Application

You can start both servers simultaneously:

**Terminal 1 (Backend API):**
```bash
npm run dev:server
# Server runs at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev
# Next.js app runs at http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 REST API Documentation

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System status and database mode check |
| `POST` | `/api/auth/login` | Public | Admin login (returns JWT token) |
| `POST` | `/api/auth/create-admin` | Backend API | **Create a new admin account (Backend only)** |
| `POST` | `/api/auth/register-admin` | Backend API | Alias for creating a new admin account |
| `GET` | `/api/auth/me` | Admin | Get authenticated admin profile |
| `GET` | `/api/auth/admins` | Admin | Get list of all registered admins |
| `GET` | `/api/courses` | Public | List all courses (supports `?search=...`) |
| `GET` | `/api/courses/:id` | Public | Get course details with all lectures |
| `POST` | `/api/courses` | Admin | Create a new course |
| `PUT` | `/api/courses/:id` | Admin | Update existing course details |
| `DELETE` | `/api/courses/:id` | Admin | Delete course & cascade-delete lectures |
| `GET` | `/api/courses/:courseId/lectures` | Public | List lectures for a course |
| `POST` | `/api/courses/:courseId/lectures` | Admin | Add a lecture to a course |
| `GET` | `/api/lectures/:id` | Public | Get single lecture |
| `PUT` | `/api/lectures/:id` | Admin | Update a lecture |
| `DELETE` | `/api/lectures/:id` | Admin | Delete a lecture |

---

### 🔒 Creating a New Admin via API (Backend-Only)

As per system specifications, the route to register new administrators is accessible strictly via backend API calls and is **not exposed or linked on the frontend UI**.

To create a new admin, send a `POST` request to `/api/auth/create-admin`:

```bash
curl -X POST http://localhost:5000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Co-Instructor",
    "email": "instructor@lms.com",
    "password": "instructorpassword123"
  }'
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "New admin account created successfully",
  "data": {
    "_id": "0f41a8e5c7478d69313bbf08",
    "name": "Co-Instructor",
    "email": "instructor@lms.com",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## ☁️ Deployment on Vercel

The project includes pre-configured `vercel.json` files for both frontend and backend deployments:

### 1. Frontend Deployment (Root [`vercel.json`](./vercel.json))
- **Root Directory**: `.` (Root)
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: Your deployed backend URL (e.g. `https://your-api.vercel.app/api` or `https://your-api.onrender.com/api`).
  - `BACKEND_URL`: (Optional) Next.js reverse-proxy destination if you wish to proxy `/api/*` through Next.js.

### 2. Backend Deployment ([`server/vercel.json`](./server/vercel.json))
- **Root Directory**: `server`
- **Builds**: `@vercel/node` targeting `src/index.js`
- **Environment Variables**:
  - `MONGODB_URI`: Your MongoDB Atlas connection string.
  - `JWT_SECRET`: Secret key for JWT token signing.
  - `CLIENT_URL`: Your deployed frontend URL (e.g. `https://your-lms.vercel.app`).
- The Express app is serverless-ready and automatically skips port binding when `process.env.VERCEL` is detected.
