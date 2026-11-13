'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, Code2, Database, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-10 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span>
                Edu<span className="text-indigo-600 dark:text-indigo-400">Stream</span> LMS
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-md text-xs leading-relaxed">
              A modern, production-structured Learning Management System built with the MERN stack
              (MongoDB, Express.js, React / Next.js with TypeScript, and Tailwind CSS). Featuring
              complete Course & Lecture CRUD management and student-facing interactive video playback.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Code2 className="w-3 h-3" /> Next.js 16 + React 19
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Database className="w-3 h-3" /> Express + MongoDB MVC
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                <Shield className="w-3 h-3" /> JWT Auth Guard
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-xs uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Course Catalog
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Admin Authentication
                </Link>
              </li>
            </ul>
          </div>

          {/* Evaluation Credentials */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-xs uppercase tracking-wider">
              Evaluation Credentials
            </h4>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div>
                <span className="text-slate-400">Email:</span>{' '}
                <code className="text-indigo-600 dark:text-indigo-400 font-mono select-all">admin@lms.com</code>
              </div>
              <div>
                <span className="text-slate-400">Password:</span>{' '}
                <code className="text-indigo-600 dark:text-indigo-400 font-mono select-all">adminpassword123</code>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 EduStream LMS. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built for full-stack engineering practical evaluation.</p>
        </div>
      </div>
    </footer>
  );
}
