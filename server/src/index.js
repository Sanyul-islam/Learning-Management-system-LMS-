require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getDBStatus } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const dataService = require('./services/dataService');

// Route imports
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const lectureRoutes = require('./routes/lectureRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Automatic quick bootstrap check to seed initial admin & sample courses if empty
const bootstrapInitialData = async () => {
  try {
    const adminCount = await dataService.admin.count();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@lms.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';

    if (adminCount === 0) {
      await dataService.admin.create({
        name: 'System Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`[Auto-Bootstrap] Created default admin account: ${adminEmail}`);
    }

    const courseCount = await dataService.course.count();
    if (courseCount === 0) {
      console.log('[Auto-Bootstrap] No courses found. Seeding initial starter courses...');
      const sampleCourse1 = await dataService.course.create({
        title: 'Modern Full-Stack Web Development (MERN)',
        description:
          'Master MongoDB, Express.js, React, and Node.js from the ground up. Build production-ready, full-stack web applications with modern patterns, clean architecture, REST APIs, and state management.',
        price: 49.99,
        thumbnail:
          'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
      });

      await dataService.lecture.create({
        courseId: sampleCourse1._id,
        title: 'Introduction to MERN Architecture',
        description:
          'A complete high-level overview of the MERN stack, client-server communication, JSON data flow, and setting up the development environment.',
        videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
        order: 1,
      });

      await dataService.lecture.create({
        courseId: sampleCourse1._id,
        title: 'Building RESTful APIs with Express & Mongoose',
        description:
          'Design modular MVC controllers, configure Mongoose schemas and relationships, and structure reusable route handlers.',
        videoUrl: 'https://www.youtube.com/watch?v=-0exw-9YJCE',
        order: 2,
      });

      await dataService.lecture.create({
        courseId: sampleCourse1._id,
        title: 'Authentication & JWT Security',
        description:
          'Secure your backend using JSON Web Tokens (JWT), password hashing with bcrypt, and protect administrative endpoints.',
        videoUrl: 'https://www.youtube.com/watch?v=mbsmsi7l3r4',
        order: 3,
      });

      const sampleCourse2 = await dataService.course.create({
        title: 'Next.js 16 & React 19 Mastery',
        description:
          'Learn Next.js App Router, React Server Components, Server Actions, Turbopack, and Tailwind CSS. The ultimate modern course for building blazing fast web apps.',
        price: 69.99,
        thumbnail:
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
      });

      await dataService.lecture.create({
        courseId: sampleCourse2._id,
        title: 'Next.js App Router Core Fundamentals',
        description:
          'Understanding the directory layout conventions, dynamic routes, layout nesting, and page rendering in Next.js.',
        videoUrl: 'https://www.youtube.com/watch?v=wm5gMKuwSYk',
        order: 1,
      });

      await dataService.lecture.create({
        courseId: sampleCourse2._id,
        title: 'Server Components vs Client Components',
        description:
          'Deep dive into React Server Components, hydration boundaries, and optimizing client-side bundle size.',
        videoUrl: 'https://www.youtube.com/watch?v=843nec-IvW0',
        order: 2,
      });

      console.log('[Auto-Bootstrap] Seeded default courses with sample lectures.');
    }
  } catch (err) {
    console.warn('[Auto-Bootstrap] Could not complete auto-seed:', err.message);
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  const status = getDBStatus();
  res.json({
    status: 'ok',
    message: 'LMS API Server is healthy and running',
    database: status,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/courses/:courseId/lectures', lectureRoutes);
app.use('/api/lectures', lectureRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Connect DB and Start Server
const startServer = async () => {
  await connectDB();
  await bootstrapInitialData();

  app.listen(PORT, () => {
    const dbStatus = getDBStatus();
    console.log(`==============================================`);
    console.log(` LMS API Backend running on port ${PORT}`);
    console.log(` Database Mode: ${dbStatus.type}`);
    console.log(` Health Check:  http://localhost:${PORT}/api/health`);
    console.log(` Courses API:   http://localhost:${PORT}/api/courses`);
    console.log(` Admin Login:   http://localhost:${PORT}/api/auth/login`);
    console.log(`==============================================`);
  });
};

startServer();

module.exports = app;
