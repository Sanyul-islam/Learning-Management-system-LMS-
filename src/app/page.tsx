'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiCourses, Course } from '@/lib/api';
import {
  Search,
  BookOpen,
  PlayCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Clock,
  DollarSign,
} from 'lucide-react';

export default function StudentHomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Web Development', 'Next.js', 'Python', 'Design'];

  const fetchCourses = async (searchQuery?: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiCourses.getAll(searchQuery);
      if (res.success) {
        setCourses(res.data);
      } else {
        setError('Failed to fetch courses from server.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle Search submit / filter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses(searchTerm);
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      setSearchTerm('');
      fetchCourses();
    } else {
      setSearchTerm(cat);
      fetchCourses(cat);
    }
  };

  return (
    <div className="flex-1 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 border border-indigo-400/20 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Student Panel & Learning Hub</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
            Master In-Demand Skills with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-teal-300">
              Curated Video Courses
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
            Browse structured courses, watch embedded video lessons, and elevate your software engineering
            and design craft at your own pace.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto flex items-center bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-2xl focus-within:border-indigo-400 transition-all"
          >
            <div className="pl-3.5 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search courses by title or keywords (e.g., MERN, Next.js, Python)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2.5 bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/30 whitespace-nowrap"
            >
              Search
            </button>
          </form>

          {/* Quick Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            <span className="text-xs text-slate-400 mr-1">Popular Topics:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`text-xs px-3 py-1 rounded-full transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 font-semibold shadow'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Course Listing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                Available Courses
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {loading
                  ? 'Fetching courses from the database...'
                  : `Showing ${courses.length} course${courses.length === 1 ? '' : 's'} ready for enrollment.`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchCourses(searchTerm)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Loading Skeleton State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm animate-pulse"
                >
                  <div className="h-48 bg-slate-200 dark:bg-slate-800" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="py-16 text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 mx-auto flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Unable to load courses
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => fetchCourses()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && courses.length === 0 && (
            <div className="py-16 text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 mx-auto flex items-center justify-center mb-4">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                No courses found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {searchTerm
                  ? `No courses matching "${searchTerm}". Try a different search query.`
                  : 'There are currently no courses in the database. Log in as Admin to create your first course or run the database seed script.'}
              </p>
              {searchTerm ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    fetchCourses('');
                  }}
                  className="px-4 py-2 bg-slate-800 text-white dark:bg-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-900 transition"
                >
                  Clear Search Filter
                </button>
              ) : (
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                >
                  Go to Admin Dashboard
                </Link>
              )}
            </div>
          )}

          {/* Course Grid */}
          {!loading && !error && courses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={
                        course.thumbnail ||
                        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback image if user provided broken URL
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 dark:bg-slate-900/95 text-indigo-700 dark:text-indigo-400 shadow-md backdrop-blur-sm flex items-center gap-1">
                        <DollarSign className="w-3 h-3 -mr-0.5" />
                        {course.price === 0 ? 'Free' : course.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-black/75 text-white backdrop-blur-sm flex items-center gap-1.5 shadow">
                        <PlayCircle className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{course.lecturesCount || 0} Lectures</span>
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {course.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Self-Paced</span>
                      </div>

                      <Link
                        href={`/courses/${course._id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-sm shadow-indigo-600/20 group-hover:gap-2"
                      >
                        <span>View Lectures</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
