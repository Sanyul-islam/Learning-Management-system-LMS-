'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { apiCourses, Course, Lecture, getEmbedVideoUrl } from '@/lib/api';
import {
  BookOpen,
  PlayCircle,
  CheckCircle,
  ArrowLeft,
  Share2,
  Clock,
  Layers,
  ChevronRight,
  AlertCircle,
  Tv,
  ListVideo,
  DollarSign,
  Maximize2,
} from 'lucide-react';

export default function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiCourses.getById(courseId);
        if (res.success && res.data) {
          setCourse(res.data);
          const lectures = res.data.lectures || [];
          if (lectures.length > 0) {
            setActiveLecture(lectures[0]);
          }
        } else {
          setError('Course could not be loaded.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const lectures = course?.lectures || [];
  const activeIndex = activeLecture
    ? lectures.findIndex((l) => l._id === activeLecture._id)
    : -1;

  const handleNextLecture = () => {
    if (activeIndex >= 0 && activeIndex < lectures.length - 1) {
      setActiveLecture(lectures[activeIndex + 1]);
    }
  };

  const handlePrevLecture = () => {
    if (activeIndex > 0) {
      setActiveLecture(lectures[activeIndex - 1]);
    }
  };

  const embedInfo = activeLecture
    ? getEmbedVideoUrl(activeLecture.videoUrl)
    : null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
          </div>
          <div className="space-y-3">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 mx-auto flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Unable to Load Course
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{error || 'Course not found.'}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-16 bg-slate-50/50 dark:bg-slate-950">
      {/* Breadcrumb Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <Link
              href="/"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Courses</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
              {course.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
              <DollarSign className="w-3 h-3 -mr-0.5" />
              {course.price === 0 ? 'Free Course' : `$${course.price.toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Embedded Video Player & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player Theater */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800">
              {activeLecture && embedInfo ? (
                embedInfo.type === 'video' ? (
                  <video
                    key={embedInfo.src}
                    src={embedInfo.src}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <iframe
                    key={embedInfo.src}
                    src={embedInfo.src}
                    title={activeLecture.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <Tv className="w-12 h-12 mb-3 text-slate-600" />
                  <p className="font-semibold text-slate-300">No Lectures Available Yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    The admin has not uploaded any video lectures for this course yet.
                  </p>
                </div>
              )}
            </div>

            {/* Video Player Controls & Info Bar */}
            {activeLecture && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 mb-2">
                      <span>Lecture {activeIndex + 1} of {lectures.length}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {activeLecture.title}
                    </h1>
                  </div>

                  {/* Previous / Next lecture switches */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      onClick={handlePrevLecture}
                      disabled={activeIndex <= 0}
                      className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    <button
                      onClick={handleNextLecture}
                      disabled={activeIndex >= lectures.length - 1}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next Lesson
                    </button>
                  </div>
                </div>

                {/* Lecture Description */}
                <div>
                  <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                    About this Lecture
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {activeLecture.description}
                  </p>
                </div>

                {/* Original Video URL preview badge */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate max-w-sm">Source: {activeLecture.videoUrl}</span>
                  <a
                    href={activeLecture.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Open external source ↗
                  </a>
                </div>
              </div>
            )}

            {/* Course Overview Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Course Syllabus & Overview
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {course.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <ListVideo className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{lectures.length} Total Lessons</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Full Lifetime Access</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>No Enrollment Required</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Lecture Playlist */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Course Content
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {lectures.length} {lectures.length === 1 ? 'lesson' : 'lessons'}
                </span>
              </div>

              {/* Lecture List */}
              <div className="mt-4 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {lectures.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No lectures added to this course yet.
                  </div>
                ) : (
                  lectures.map((lecture, idx) => {
                    const isPlaying = activeLecture?._id === lecture._id;
                    return (
                      <button
                        key={lecture._id}
                        type="button"
                        onClick={() => setActiveLecture(lecture)}
                        className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3 border ${
                          isPlaying
                            ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 shadow-sm'
                            : 'bg-slate-50/60 dark:bg-slate-800/40 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                            isPlaying
                              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                              : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          {isPlaying ? (
                            <PlayCircle className="w-4 h-4 fill-white text-indigo-600" />
                          ) : (
                            idx + 1
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-bold leading-snug line-clamp-2 ${
                              isPlaying
                                ? 'text-indigo-900 dark:text-indigo-200'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {lecture.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {lecture.description}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

