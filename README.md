# EduStream LMS - Full-Stack Learning Management System

EduStream LMS is a full-stack Learning Management System built using the **MERN** stack (**MongoDB, Express.js, React / Next.js with TypeScript, and Node.js**) styled with **Tailwind CSS**. It provides a role-based architecture featuring an **Admin Dashboard** for complete Course & Lecture management and an interactive **Student Panel** with responsive video streaming.

---

## 🚀 Key Features

### 1. Student Panel
- **Course Catalog (`/`)**:
  - Live database-backed course feed with real-time keyword search and category tags.
  - Displays thumbnail, course title, description, price (or Free badge), and lecture count.
  - Responsive cards with animated skeleton loading states, empty search fallbacks, and error boundaries.
- **Course Details & Interactive Lecture Player (`/courses/[id]`)**:
  - Embedded video player supporting YouTube embeds, Vimeo, and HTML5 video (`.mp4`).
  - Interactive lesson syllabus playlist with active playing indicator.
  - Previous / Next lesson navigation controls and course summary details.

### 2. Admin Dashboard
- **Authentication & Security (`/admin/login`)**:
  - Secure JWT authentication with bcrypt password hashing.
  - Pre-filled 1-Click test credentials button for instant evaluation.
  - Protected admin routes with token verification middleware.
- **Course Management (`/admin`)**:
  - High-level metric statistics (Total Courses, Total Lectures, Admin Session).
  - Search and filter existing courses.
  - **Create Course Modal**: Title, description, price, thumbnail URL with real-time preview.
  - **Edit Course Modal**: Modify existing course information.
  - **Delete Course**: Cascading deletion that removes both the course and all associated lectures.
- **Lecture Management (`/admin/courses/[id]/lectures`)**:
  - Add lectures with title, description, video URL, and order index.
  - Display lectures associated with the specific course.
  - Embedded video test preview modal directly inside the dashboard.
  - Edit and delete existing lectures.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS + Lucide Icons.
- **Backend**: Node.js + Express.js following a clean **MVC** (Model-View-Controller) structure:
  - `server/src/models/`: Admin, Course, Lecture schemas.
  - `server/src/controllers/`: `authController`, `courseController`, `lectureController`.
  - `server/src/routes/`: Modular REST API route handlers.
  - `server/src/middleware/`: JWT verification and global error handlers.
  - `server/src/services/dataService.js`: Unified data layer supporting MongoDB / Mongoose with instant local persistent storage fallback.
- **Database**:
  - **MongoDB** with Mongoose when `MONGODB_URI` is provided (e.g. MongoDB Atlas or local MongoDB).
  - **Automatic Persistent Store Fallback**: If MongoDB is not running locally, the server seamlessly operates in zero-config persistent mode (`server/data/db.json`), allowing instant evaluation without external database setup.

---

## 🔑 Test Credentials for Evaluation

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@lms.com` | `adminpassword123` |

*(Note: The Admin Login page also includes a "1-Click Fill" button to test instantly)*

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
MONGODB_URI=mongodb://127.0.0.1:27017/lms_db
JWT_SECRET=lms_super_secret_jwt_key_2026_eval
ADMIN_EMAIL=admin@lms.com
ADMIN_PASSWORD=adminpassword123
CLIENT_URL=http://localhost:3000
```

*(If you have MongoDB Atlas, set `MONGODB_URI` to your Atlas connection string. If MongoDB is not running, the application starts with zero setup).*

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
| `GET` | `/api/auth/me` | Admin | Get authenticated admin profile |
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
