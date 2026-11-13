// API Client for LMS

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  lecturesCount?: number;
  lectures?: Lecture[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Lecture {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
  };
}

// Token helper
export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lms_admin_token');
};

export const setStoredAuth = (token: string, user: AdminUser) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('lms_admin_token', token);
  localStorage.setItem('lms_admin_user', JSON.stringify(user));
};

export const clearStoredAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('lms_admin_token');
  localStorage.removeItem('lms_admin_user');
};

export const getStoredUser = (): AdminUser | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('lms_admin_user');
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

// Generic fetch wrapper
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth: boolean = false
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        `Unable to reach backend server at ${API_BASE_URL}. Ensure the backend is running on port 5000.`
      );
    }
    throw err;
  }
}

// Auth API
export const apiAuth = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getMe: async (): Promise<{ success: boolean; data: AdminUser }> => {
    return request<{ success: boolean; data: AdminUser }>(
      '/auth/me',
      { method: 'GET' },
      true
    );
  },
};

// Courses API
export const apiCourses = {
  getAll: async (search?: string): Promise<{ success: boolean; count: number; data: Course[] }> => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<{ success: boolean; count: number; data: Course[] }>(`/courses${query}`);
  },

  getById: async (id: string): Promise<{ success: boolean; data: Course }> => {
    return request<{ success: boolean; data: Course }>(`/courses/${id}`);
  },

  create: async (courseData: Partial<Course>): Promise<{ success: boolean; data: Course }> => {
    return request<{ success: boolean; data: Course }>(
      '/courses',
      {
        method: 'POST',
        body: JSON.stringify(courseData),
      },
      true
    );
  },

  update: async (
    id: string,
    courseData: Partial<Course>
  ): Promise<{ success: boolean; data: Course }> => {
    return request<{ success: boolean; data: Course }>(
      `/courses/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(courseData),
      },
      true
    );
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(
      `/courses/${id}`,
      {
        method: 'DELETE',
      },
      true
    );
  },
};

// Lectures API
export const apiLectures = {
  getByCourse: async (
    courseId: string
  ): Promise<{ success: boolean; count: number; data: Lecture[] }> => {
    return request<{ success: boolean; count: number; data: Lecture[] }>(
      `/courses/${courseId}/lectures`
    );
  },

  getById: async (id: string): Promise<{ success: boolean; data: Lecture }> => {
    return request<{ success: boolean; data: Lecture }>(`/lectures/${id}`);
  },

  create: async (
    courseId: string,
    lectureData: Partial<Lecture>
  ): Promise<{ success: boolean; data: Lecture }> => {
    return request<{ success: boolean; data: Lecture }>(
      `/courses/${courseId}/lectures`,
      {
        method: 'POST',
        body: JSON.stringify(lectureData),
      },
      true
    );
  },

  update: async (
    id: string,
    lectureData: Partial<Lecture>
  ): Promise<{ success: boolean; data: Lecture }> => {
    return request<{ success: boolean; data: Lecture }>(
      `/lectures/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(lectureData),
      },
      true
    );
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(
      `/lectures/${id}`,
      {
        method: 'DELETE',
      },
      true
    );
  },
};

// Helper: Convert video URL to embeddable iframe / player source
export function getEmbedVideoUrl(url: string): { type: 'youtube' | 'vimeo' | 'video' | 'embed'; src: string } {
  if (!url) return { type: 'video', src: '' };

  const trimmed = url.trim();

  // YouTube standard watch or shorts URL
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
    };
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }

  // Direct MP4 / WebM / OGG video file
  if (/\.(mp4|webm|ogg)($|\?)/i.test(trimmed)) {
    return {
      type: 'video',
      src: trimmed,
    };
  }

  // Fallback to embed or iframe
  return {
    type: 'embed',
    src: trimmed,
  };
}

