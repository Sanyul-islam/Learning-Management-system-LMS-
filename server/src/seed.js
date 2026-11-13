require('dotenv').config();
const { connectDB } = require('./config/db');
const dataService = require('./services/dataService');

const seedData = async () => {
  try {
    console.log('[Seed] Initializing database connection...');
    await connectDB();

    console.log('[Seed] Clearing existing courses, lectures, and admin accounts...');
    await dataService.admin.deleteAll();
    await dataService.course.deleteAll();
    await dataService.lecture.deleteAll();

    // 1. Create Default Admin
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@lms.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';

    const admin = await dataService.admin.create({
      name: 'System Administrator',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    console.log(`[Seed] Created admin account: ${admin.email}`);

    // 2. Sample Courses
    const coursesData = [
      {
        title: 'Modern Full-Stack Web Development (MERN)',
        description:
          'Master MongoDB, Express.js, React, and Node.js from the ground up. Build production-ready, full-stack web applications with modern patterns, clean architecture, REST APIs, and state management.',
        price: 49.99,
        thumbnail:
          'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
        lectures: [
          {
            title: 'Introduction to MERN Architecture',
            description:
              'A complete high-level overview of the MERN stack, client-server communication, JSON data flow, and setting up the development environment.',
            videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
            order: 1,
          },
          {
            title: 'Building RESTful APIs with Express & Mongoose',
            description:
              'Design modular MVC controllers, configure Mongoose schemas and relationships, and structure reusable route handlers.',
            videoUrl: 'https://www.youtube.com/watch?v=-0exw-9YJCE',
            order: 2,
          },
          {
            title: 'Authentication & JWT Security',
            description:
              'Secure your backend using JSON Web Tokens (JWT), password hashing with bcrypt, and protect administrative endpoints.',
            videoUrl: 'https://www.youtube.com/watch?v=mbsmsi7l3r4',
            order: 3,
          },
          {
            title: 'Connecting React Frontend to Backend',
            description:
              'Connecting the client to the server, handling asynchronous API requests, loading states, and error handling.',
            videoUrl: 'https://www.youtube.com/watch?v=fnpmR6Q5lEc',
            order: 4,
          },
        ],
      },
      {
        title: 'Next.js 16 & React 19 Mastery',
        description:
          'Learn the Next.js App Router, React Server Components, Server Actions, Turbopack, and Tailwind CSS. The ultimate modern course for building blazing fast web apps.',
        price: 69.99,
        thumbnail:
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
        lectures: [
          {
            title: 'Next.js App Router Core Fundamentals',
            description:
              'Understanding the directory layout conventions, dynamic routes, layout nesting, and page rendering in Next.js.',
            videoUrl: 'https://www.youtube.com/watch?v=wm5gMKuwSYk',
            order: 1,
          },
          {
            title: 'Server Components vs Client Components',
            description:
              'Deep dive into React Server Components, hydration boundaries, and optimizing client-side bundle size.',
            videoUrl: 'https://www.youtube.com/watch?v=843nec-IvW0',
            order: 2,
          },
          {
            title: 'Styling with Tailwind CSS 4',
            description:
              'Modern CSS utility workflow with Tailwind CSS, custom design tokens, dark mode, and responsive layouts.',
            videoUrl: 'https://www.youtube.com/watch?v=pFa938WBljo',
            order: 3,
          },
        ],
      },
      {
        title: 'Python for Artificial Intelligence & Data Science',
        description:
          'Comprehensive introduction to Python programming, NumPy, Pandas, Data Visualization, and foundational Machine Learning models for modern developers.',
        price: 39.99,
        thumbnail:
          'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        lectures: [
          {
            title: 'Python Fundamentals for Data Science',
            description:
              'Core Python syntax, list comprehensions, data structures, and essential standard libraries.',
            videoUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
            order: 1,
          },
          {
            title: 'Data Analysis with Pandas and NumPy',
            description:
              'Reading CSV and JSON datasets, dataframe transformations, filtering, aggregations, and cleaning missing data.',
            videoUrl: 'https://www.youtube.com/watch?v=vmEHCJofslg',
            order: 2,
          },
          {
            title: 'Building Your First Machine Learning Model',
            description:
              'Training, evaluating, and predicting using supervised regression and classification models with scikit-learn.',
            videoUrl: 'https://www.youtube.com/watch?v=7eh4d6sabA0',
            order: 3,
          },
        ],
      },
      {
        title: 'UI/UX Design Systems with Figma',
        description:
          'Design responsive web and mobile interfaces, master auto-layout, build reusable Figma design systems, and export production assets for developers.',
        price: 29.99,
        thumbnail:
          'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
        lectures: [
          {
            title: 'Design Principles & Visual Hierarchy',
            description:
              'Typography scale, contrast ratios, whitespace, visual hierarchy, and creating accessible color palettes.',
            videoUrl: 'https://www.youtube.com/watch?v=c9Wg6Cb_YlU',
            order: 1,
          },
          {
            title: 'Mastering Auto-Layout & Component Variants',
            description:
              'Building responsive components in Figma that stretch, wrap, and behave like real web elements.',
            videoUrl: 'https://www.youtube.com/watch?v=Nk_XwP6e51E',
            order: 2,
          },
        ],
      },
    ];

    let totalLecturesCount = 0;
    for (const c of coursesData) {
      const { lectures, ...courseFields } = c;
      const createdCourse = await dataService.course.create(courseFields);

      for (const lec of lectures) {
        await dataService.lecture.create({
          ...lec,
          courseId: createdCourse._id,
        });
        totalLecturesCount++;
      }
    }

    console.log('==============================================');
    console.log(
      `[Seed] Successfully seeded ${coursesData.length} courses and ${totalLecturesCount} lectures!`
    );
    console.log('ADMIN TEST CREDENTIALS:');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('==============================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
