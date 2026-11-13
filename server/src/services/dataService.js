const bcrypt = require('bcryptjs');
const { getDBStatus } = require('../config/db');
const { readStore, writeStore, generateId } = require('../config/store');
const Admin = require('../models/Admin');
const Course = require('../models/Course');
const Lecture = require('../models/Lecture');

// Helper to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

const dataService = {
  // ADMIN SERVICE
  admin: {
    findByEmail: async (email) => {
      const { isMongo } = getDBStatus();
      const normalizedEmail = email.toLowerCase().trim();

      if (isMongo) {
        return await Admin.findOne({ email: normalizedEmail });
      } else {
        const store = readStore();
        return (
          store.admins.find(
            (a) => a.email.toLowerCase().trim() === normalizedEmail
          ) || null
        );
      }
    },

    findById: async (id) => {
      const { isMongo } = getDBStatus();
      if (isMongo) {
        return await Admin.findById(id).select('-password');
      } else {
        const store = readStore();
        const admin = store.admins.find((a) => a._id === id);
        if (!admin) return null;
        const { password, ...rest } = admin;
        return rest;
      }
    },

    create: async ({ name, email, password, role = 'admin' }) => {
      const { isMongo } = getDBStatus();
      if (isMongo) {
        return await Admin.create({ name, email, password, role });
      } else {
        const store = readStore();
        const hashedPassword = await hashPassword(password);
        const newAdmin = {
          _id: generateId(),
          name: name || 'System Administrator',
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        store.admins.push(newAdmin);
        writeStore(store);
        return newAdmin;
      }
    },

    count: async () => {
      const { isMongo } = getDBStatus();
      if (isMongo) {
        return await Admin.countDocuments();
      } else {
        const store = readStore();
        return store.admins.length;
      }
    },

    findAll: async () => {
      const { isMongo } = getDBStatus();
      if (isMongo) {
        return await Admin.find({}).select('-password').sort({ createdAt: -1 });
      } else {
        const store = readStore();
        return store.admins.map((a) => {
          const { password, ...rest } = a;
          return rest;
        });
      }
    },

    deleteAll: async () => {
      const { isMongo } = getDBStatus();
      if (isMongo) {
        return await Admin.deleteMany({});
      } else {
        const store = readStore();
        store.admins = [];
        writeStore(store);
      }
    },

    matchPassword: async (admin, enteredPassword) => {
      if (typeof admin.matchPassword === 'function') {
        return await admin.matchPassword(enteredPassword);
      }
      return await comparePassword(enteredPassword, admin.password);
    },
  },

  // COURSE SERVICE
  course: {
    findAll: async (search) => {
      const { isMongo } = getDBStatus();
      if (isMongo) {
        let query = {};
        if (search && search.trim() !== '') {
          query = {
            $or: [
              { title: { $regex: search.trim(), $options: 'i' } },
              { description: { $regex: search.trim(), $options: 'i' } },
            ],
          };
        }
        const courses = await Course.find(query).sort({ createdAt: -1 }).lean();
        const courseIds = courses.map((c) => c._id);
        const counts = await Lecture.aggregate([
          { $match: { courseId: { $in: courseIds } } },
          { $group: { _id: '$courseId', count: { $sum: 1 } } },
        ]);
        const map = {};
        counts.forEach((c) => {
          map[c._id.toString()] = c.count;
        });

        return courses.map((c) => ({
          ...c,
          lecturesCount: map[c._id.toString()] || 0,
        }));
      } else {
        const store = readStore();
        let courses = store.courses;

        if (search && search.trim() !== '') {
          const s = search.trim().toLowerCase();
          courses = courses.filter(
            (c) =>
              c.title.toLowerCase().includes(s) ||
              c.description.toLowerCase().includes(s)
          );
        }

        // Sort by createdAt desc
        courses = [...courses].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        return courses.map((c) => {
          const lecturesCount = store.lectures.filter(
            (l) => l.courseId === c._id
          ).length;
          return {
            ...c,
            lecturesCount,
          };
        });
      }
    },

    findById: async (id) => {
      const { isMongo } = getDBStatus();
      if (isMongo) {
        const course = await Course.findById(id);
        if (!course) return null;
        const lectures = await Lecture.find({ courseId: course._id }).sort({
          order: 1,
          createdAt: 1,
        });
        return {
          ...course.toObject(),
          lectures,
        };
      } else {
        const store = readStore();
        const course = store.courses.find((c) => c._id === id);
        if (!course) return null;
        const lectures = store.lectures
          .filter((l) => l.courseId === id)
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        return {
          ...course,
          lectures,
        };
      }
    },

    create: async ({ title, description, price, thumbnail }) => {
      const { isMongo } = getDBStatus();
      if (isMongo) {
        return await Course.create({
          title,
          description,
          price: Number(price),
          thumbnail,
        });
      } else {
        const store = readStore();
        const newCourse = {
          _id: generateId(),
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          thumbnail: thumbnail.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        store.courses.push(newCourse);
        writeStore(store);
        return newCourse;
      }
    },

    update: async (id, updates) => {
      const { isMongo } = getDBStatus();
      if (isMongo) {
        const course = await Course.findById(id);
        if (!course) return null;

        if (updates.title !== undefined) course.title = updates.title.trim();
        if (updates.description !== undefined)
          course.description = updates.description.trim();
        if (updates.price !== undefined) course.price = Number(updates.price);
        if (updates.thumbnail !== undefined)
          course.thumbnail = updates.thumbnail.trim();

        return await course.save();
      } else {
        const store = readStore();
        const index = store.courses.findIndex((c) => c._id === id);
        if (index === -1) return null;

        const current = store.courses[index];
        const updatedCourse = {
          ...current,
          ...(updates.title !== undefined && { title: updates.title.trim() }),
          ...(updates.description !== undefined && {
            description: updates.description.trim(),
          }),
          ...(updates.price !== undefined && {
            price: Number(updates.price),
          }),
          ...(updates.thumbnail !== undefined && {
            thumbnail: updates.thumbnail.trim(),
          }),
          updatedAt: new Date().toISOString(),
        };

        store.courses[index] = updatedCourse;
        writeStore(store);
        return updatedCourse;
      }
    },

    delete: async (id) => {
      const { isMongo } = getDBStatus();
      if (isMongo) {
        const course = await Course.findById(id);
        if (!course) return null;
        const deletedLectures = await Lecture.deleteMany({ courseId: course._id });
        await course.deleteOne();
        return { deletedCount: 1, deletedLecturesCount: deletedLectures.deletedCount };
      } else {
        const store = readStore();
        const index = store.courses.findIndex((c) => c._id === id);
        if (index === -1) return null;

        store.courses.splice(index, 1);
        const initialLecturesCount = store.lectures.length;
        store.lectures = store.lectures.filter((l) => l.courseId !== id);
        const deletedLecturesCount = initialLecturesCount - store.lectures.length;

        writeStore(store);
        return { deletedCount: 1, deletedLecturesCount };
      }
    },

    count: async () => {
      const { isMongo } = getDBStatus();
      if (isMongo) {
        return await Course.countDocuments();
      } else {
        const store = readStore();
        return store.courses.length;
      }
    },

    deleteAll: async () => {
      const { isMongo } = getDBStatus();
      if (isMongo) {
        return await Course.deleteMany({});
      } else {
        const store = readStore();
        store.courses = [];
        writeStore(store);
      }
    },
  },

  // LECTURE SERVICE
  lecture: {
    findByCourse: async (courseId) => {
      const { isMongo } = getDBStatus();
      if (isMongo) {
        return await Lecture.find({ courseId }).sort({ order: 1, createdAt: 1 });
      } else {
        const store = readStore();
        return store.lectures
          .filter((l) => l.courseId === courseId)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    },

    findById: async (id) => {
      const { isMongo } = getDBStatus();
      if (isMongo) {
        return await Lecture.findById(id);
      } else {
        const store = readStore();
        return store.lectures.find((l) => l._id === id) || null;
      }
    },

    create: async ({ courseId, title, description, videoUrl, order }) => {
      const { isMongo } = getDBStatus();
      if (isMongo) {
        let lectureOrder = order;
        if (lectureOrder === undefined || lectureOrder === null) {
          const highestOrder = await Lecture.findOne({ courseId }).sort({
            order: -1,
          });
          lectureOrder = highestOrder ? highestOrder.order + 1 : 1;
        }

        return await Lecture.create({
          courseId,
          title: title.trim(),
          description: description.trim(),
          videoUrl: videoUrl.trim(),
          order: Number(lectureOrder),
        });
      } else {
        const store = readStore();
        let lectureOrder = order;
        if (lectureOrder === undefined || lectureOrder === null) {
          const courseLectures = store.lectures.filter(
            (l) => l.courseId === courseId
          );
          const maxOrder = courseLectures.reduce(
            (max, l) => Math.max(max, l.order || 0),
            0
          );
          lectureOrder = maxOrder + 1;
        }

        const newLecture = {
          _id: generateId(),
          courseId,
          title: title.trim(),
          description: description.trim(),
          videoUrl: videoUrl.trim(),
          order: Number(lectureOrder),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        store.lectures.push(newLecture);
        writeStore(store);
        return newLecture;
      }
    },

    update: async (id, updates) => {
      const { isMongo } = getDBStatus();
      if (isMongo) {
        const lecture = await Lecture.findById(id);
        if (!lecture) return null;

        if (updates.title !== undefined) lecture.title = updates.title.trim();
        if (updates.description !== undefined)
          lecture.description = updates.description.trim();
        if (updates.videoUrl !== undefined)
          lecture.videoUrl = updates.videoUrl.trim();
        if (updates.order !== undefined) lecture.order = Number(updates.order);

        return await lecture.save();
      } else {
        const store = readStore();
        const index = store.lectures.findIndex((l) => l._id === id);
        if (index === -1) return null;

        const current = store.lectures[index];
        const updatedLecture = {
          ...current,
          ...(updates.title !== undefined && { title: updates.title.trim() }),
          ...(updates.description !== undefined && {
            description: updates.description.trim(),
          }),
          ...(updates.videoUrl !== undefined && {
            videoUrl: updates.videoUrl.trim(),
          }),
          ...(updates.order !== undefined && { order: Number(updates.order) }),
          updatedAt: new Date().toISOString(),
        };

        store.lectures[index] = updatedLecture;
        writeStore(store);
        return updatedLecture;
      }
    },

    delete: async (id) => {
      const { isMongo } = getDBStatus();
      if (isMongo) {
        const lecture = await Lecture.findById(id);
        if (!lecture) return null;
        await lecture.deleteOne();
        return true;
      } else {
        const store = readStore();
        const index = store.lectures.findIndex((l) => l._id === id);
        if (index === -1) return null;

        store.lectures.splice(index, 1);
        writeStore(store);
        return true;
      }
    },

    deleteManyByCourse: async (courseId) => {
      const { isMongo } = getDBStatus();
      if (isMongo) {
        return await Lecture.deleteMany({ courseId });
      } else {
        const store = readStore();
        const initialCount = store.lectures.length;
        store.lectures = store.lectures.filter((l) => l.courseId !== courseId);
        writeStore(store);
        return { deletedCount: initialCount - store.lectures.length };
      }
    },

    deleteAll: async () => {
      const { isMongo } = getDBStatus();
      if (isMongo) {
        return await Lecture.deleteMany({});
      } else {
        const store = readStore();
        store.lectures = [];
        writeStore(store);
      }
    },
  },
};

module.exports = dataService;

