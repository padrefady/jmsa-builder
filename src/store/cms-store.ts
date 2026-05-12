import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ViewName =
  | 'dashboard'
  | 'sites'
  | 'statistics'
  | 'settings';

export type UserStatus = 'pending' | 'analyzing' | 'beta_ready' | 'active';

export type UserRole = 'admin' | 'editor' | 'author' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  token: string;
  status?: UserStatus;
  plan?: string;
  planStartDate?: string;
  domain?: string;
  betaUrl?: string;
  businessName?: string;
  businessType?: string;
  businessCity?: string;
  businessCountry?: string;
  phone?: string;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  twitter?: string;
  linkedin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  authorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  categoryId?: string;
  status: 'draft' | 'published' | 'archived';
  authorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  alt?: string;
  uploadedBy?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  createdAt: number;
}

export interface DashboardStats {
  totalPages: number;
  totalPosts: number;
  totalCategories: number;
  totalMedia: number;
  recentActivity: ActivityItem[];
  viewsOverTime: { date: string; views: number }[];
}

export interface ActivityItem {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  userId?: string;
}

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface CMSState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;

  // Navigation
  currentView: ViewName;
  sidebarOpen: boolean;

  // Content
  pages: Page[];
  posts: Post[];
  categories: Category[];
  media: MediaItem[];
  settings: Record<string, string>;

  // UI
  selectedItem: Record<string, unknown> | null;
  isLoading: boolean;
  notifications: Notification[];
  welcomeShown: boolean;

  // Dashboard
  dashboardStats: DashboardStats | null;
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------

export interface CMSActions {
  // Auth
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, string>) => Promise<void>;
  logout: () => void;
  checkSession: () => Promise<void>;

  // Navigation
  setView: (view: ViewName) => void;
  toggleSidebar: () => void;

  // Pages
  fetchPages: () => Promise<void>;
  createPage: (data: Partial<Page>) => Promise<Page>;
  updatePage: (id: string, data: Partial<Page>) => Promise<Page>;
  deletePage: (id: string) => Promise<void>;

  // Posts
  fetchPosts: () => Promise<void>;
  createPost: (data: Partial<Post>) => Promise<Post>;
  updatePost: (id: string, data: Partial<Post>) => Promise<Post>;
  deletePost: (id: string) => Promise<void>;

  // Categories
  fetchCategories: () => Promise<void>;
  createCategory: (data: Partial<Category>) => Promise<Category>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;

  // Media
  fetchMedia: () => Promise<void>;
  uploadMedia: (file: File) => Promise<MediaItem>;
  deleteMedia: (id: string) => Promise<void>;

  // Settings
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Record<string, string>) => Promise<void>;

  // Dashboard
  fetchDashboard: () => Promise<void>;

  // UI
  setSelectedItem: (item: Record<string, unknown> | null) => void;
  addNotification: (message: string, type: Notification['type']) => void;
  dismissWelcome: () => void;

  // Helpers
  isPendingUser: () => boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TOKEN_KEY = 'jmsa_token';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(token?: string): HeadersInit {
  const t = token ?? getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
}

function uid(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export type CMSStore = CMSState & CMSActions;

export const useCMSStore = create<CMSStore>((set, get) => ({
  // ----- Initial state -----------------------------------------------------
  user: null,
  isAuthenticated: false,
  currentView: 'dashboard',
  sidebarOpen: true,
  pages: [],
  posts: [],
  categories: [],
  media: [],
  settings: {},
  selectedItem: null,
  isLoading: false,
  notifications: [],
  welcomeShown: false,
  dashboardStats: null,

  // =========================================================================
  // AUTH
  // =========================================================================

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const err = new Error(body.error ?? body.message ?? 'Login failed') as Error & { code?: string };
        err.code = body.code;
        throw err;
      }

      const { user, token } = await res.json();
      storeToken(token);
      // Check if first login (welcome)
      const wasWelcomeShown = typeof window !== 'undefined' ? localStorage.getItem('jmsa_welcome_shown') : null;
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        welcomeShown: !!wasWelcomeShown,
      });
      if (!wasWelcomeShown) {
        get().addNotification(`Bienvenue, ${user.name} !`, 'success');
      }
    } catch (error) {
      set({ isLoading: false });
      const message =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      const code = (error as Error & { code?: string }).code;
      // Message convivial en cas de base de donnees indisponible
      if (code === 'DB_UNAVAILABLE') {
        get().addNotification(
          'Service indisponible. Veuillez reessayer dans quelques instants.',
          'warning',
        );
      } else {
        get().addNotification(message, 'error');
      }
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const err = new Error(body.error ?? body.message ?? 'Registration failed') as Error & { code?: string };
        err.code = body.code;
        throw err;
      }

      const { user, token } = await res.json();
      storeToken(token);
      set({ user, isAuthenticated: true, isLoading: false, welcomeShown: false });
      get().addNotification('Compte cree avec succes ! En attente de validation par JMSA.', 'success');
    } catch (error) {
      set({ isLoading: false });
      const message =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      const code = (error as Error & { code?: string }).code;
      // Message convivial en cas de base de donnees indisponible
      if (code === 'DB_UNAVAILABLE') {
        get().addNotification(
          'Service indisponible. Veuillez reessayer dans quelques instants.',
          'warning',
        );
      } else {
        get().addNotification(message, 'error');
      }
      throw error;
    }
  },

  logout: () => {
    removeToken();
    set({
      user: null,
      isAuthenticated: false,
      currentView: 'dashboard',
      pages: [],
      posts: [],
      categories: [],
      media: [],
      settings: {},
      selectedItem: null,
      dashboardStats: null,
      notifications: [],
    });
    // Notify the main page to switch back to landing
    window.dispatchEvent(new CustomEvent('cms-logout'));
    get().addNotification('You have been logged out.', 'info');
  },

  checkSession: async () => {
    const token = getStoredToken();
    if (!token) return;

    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/session', {
        headers: authHeaders(token),
      });

      if (!res.ok) {
        removeToken();
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const { user } = await res.json();
      const wasWelcomeShown = typeof window !== 'undefined' ? localStorage.getItem('jmsa_welcome_shown') : null;
      set({ user, isAuthenticated: true, isLoading: false, welcomeShown: !!wasWelcomeShown });
    } catch {
      removeToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // =========================================================================
  // NAVIGATION
  // =========================================================================

  setView: (view) => set({ currentView: view }),

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  // =========================================================================
  // PAGES
  // =========================================================================

  fetchPages: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/pages', {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch pages');
      const data = await res.json();
      const pages: Page[] = Array.isArray(data) ? data : (data.pages || []);
      set({ pages, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      get().addNotification(
        error instanceof Error ? error.message : 'Failed to load pages',
        'error',
      );
    }
  },

  createPage: async (data) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to create page');
      }
      const resData = await res.json();
      const page: Page = resData.page || resData;
      set((s) => ({ pages: [page, ...s.pages], isLoading: false }));
      get().addNotification('Page created successfully.', 'success');
      return page;
    } catch (error) {
      set({ isLoading: false });
      const message =
        error instanceof Error ? error.message : 'Failed to create page';
      get().addNotification(message, 'error');
      throw error;
    }
  },

  updatePage: async (id, data) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to update page');
      }
      const resData = await res.json();
      const updated: Page = resData.page || resData;
      set((s) => ({
        pages: s.pages.map((p) => (p.id === id ? updated : p)),
        isLoading: false,
      }));
      get().addNotification('Page updated successfully.', 'success');
      return updated;
    } catch (error) {
      set({ isLoading: false });
      const message =
        error instanceof Error ? error.message : 'Failed to update page';
      get().addNotification(message, 'error');
      throw error;
    }
  },

  deletePage: async (id) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to delete page');
      }
      set((s) => ({
        pages: s.pages.filter((p) => p.id !== id),
        selectedItem: s.selectedItem?.id === id ? null : s.selectedItem,
        isLoading: false,
      }));
      get().addNotification('Page deleted.', 'success');
    } catch (error) {
      set({ isLoading: false });
      const message =
        error instanceof Error ? error.message : 'Failed to delete page';
      get().addNotification(message, 'error');
      throw error;
    }
  },

  // =========================================================================
  // POSTS
  // =========================================================================

  fetchPosts: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/posts', {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      const posts: Post[] = Array.isArray(data) ? data : (data.posts || []);
      set({ posts, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      get().addNotification(
        error instanceof Error ? error.message : 'Failed to load posts',
        'error',
      );
    }
  },

  createPost: async (data) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to create post');
      }
      const resData = await res.json();
      const post: Post = resData.post || resData;
      set((s) => ({ posts: [post, ...s.posts], isLoading: false }));
      get().addNotification('Post created successfully.', 'success');
      return post;
    } catch (error) {
      set({ isLoading: false });
      const message =
        error instanceof Error ? error.message : 'Failed to create post';
      get().addNotification(message, 'error');
      throw error;
    }
  },

  updatePost: async (id, data) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to update post');
      }
      const resData = await res.json();
      const updated: Post = resData.post || resData;
      set((s) => ({
        posts: s.posts.map((p) => (p.id === id ? updated : p)),
        isLoading: false,
      }));
      get().addNotification('Post updated successfully.', 'success');
      return updated;
    } catch (error) {
      set({ isLoading: false });
      const message =
        error instanceof Error ? error.message : 'Failed to update post';
      get().addNotification(message, 'error');
      throw error;
    }
  },

  deletePost: async (id) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to delete post');
      }
      set((s) => ({
        posts: s.posts.filter((p) => p.id !== id),
        selectedItem: s.selectedItem?.id === id ? null : s.selectedItem,
        isLoading: false,
      }));
      get().addNotification('Post deleted.', 'success');
    } catch (error) {
      set({ isLoading: false });
      const message =
        error instanceof Error ? error.message : 'Failed to delete post';
      get().addNotification(message, 'error');
      throw error;
    }
  },

  // =========================================================================
  // CATEGORIES
  // =========================================================================

  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/categories', {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      const categories: Category[] = Array.isArray(data) ? data : (data.categories || []);
      set({ categories, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      get().addNotification(
        error instanceof Error ? error.message : 'Failed to load categories',
        'error',
      );
    }
  },

  createCategory: async (data) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to create category');
      }
      const category: Category = await res.json();
      set((s) => ({
        categories: [...s.categories, category],
        isLoading: false,
      }));
      get().addNotification('Category created successfully.', 'success');
      return category;
    } catch (error) {
      set({ isLoading: false });
      const message =
        error instanceof Error ? error.message : 'Failed to create category';
      get().addNotification(message, 'error');
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to update category');
      }
      const updated: Category = await res.json();
      set((s) => ({
        categories: s.categories.map((c) => (c.id === id ? updated : c)),
        isLoading: false,
      }));
      get().addNotification('Category updated successfully.', 'success');
      return updated;
    } catch (error) {
      set({ isLoading: false });
      const message =
        error instanceof Error ? error.message : 'Failed to update category';
      get().addNotification(message, 'error');
      throw error;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to delete category');
      }
      set((s) => ({
        categories: s.categories.filter((c) => c.id !== id),
        selectedItem: s.selectedItem?.id === id ? null : s.selectedItem,
        isLoading: false,
      }));
      get().addNotification('Category deleted.', 'success');
    } catch (error) {
      set({ isLoading: false });
      const message =
        error instanceof Error ? error.message : 'Failed to delete category';
      get().addNotification(message, 'error');
      throw error;
    }
  },

  // =========================================================================
  // MEDIA
  // =========================================================================

  fetchMedia: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/media', {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch media');
      const data = await res.json();
      const rawMedia = Array.isArray(data) ? data : (data.media || []);
      // Mapper les champs de l'API vers le type MediaItem
      const media: MediaItem[] = rawMedia.map((m: Record<string, unknown>) => ({
        id: m.id,
        filename: m.filename,
        url: m.url,
        mimeType: m.mimeType,
        size: m.size,
        alt: m.alt,
        uploadedBy: m.author?.name ?? (m.authorId as string) ?? undefined,
        createdAt: m.createdAt,
      }));
      set({ media, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      get().addNotification(
        error instanceof Error ? error.message : 'Failed to load media',
        'error',
      );
    }
  },

  uploadMedia: async (file) => {
    set({ isLoading: true });
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = getStoredToken();
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to upload media');
      }
      const resData = await res.json();
      // L'API retourne { message, media: {...} }
      const raw = resData.media || resData;
      const item: MediaItem = {
        id: raw.id,
        filename: raw.filename,
        url: raw.url,
        mimeType: raw.mimeType,
        size: raw.size,
        alt: raw.alt,
        uploadedBy: raw.author?.name ?? raw.authorId ?? undefined,
        createdAt: raw.createdAt,
      };
      set((s) => ({ media: [item, ...s.media], isLoading: false }));
      get().addNotification('Media uploaded successfully.', 'success');
      return item;
    } catch (error) {
      set({ isLoading: false });
      const message =
        error instanceof Error ? error.message : 'Failed to upload media';
      get().addNotification(message, 'error');
      throw error;
    }
  },

  deleteMedia: async (id) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to delete media');
      }
      set((s) => ({
        media: s.media.filter((m) => m.id !== id),
        isLoading: false,
      }));
      get().addNotification('Media deleted.', 'success');
    } catch (error) {
      set({ isLoading: false });
      const message =
        error instanceof Error ? error.message : 'Failed to delete media';
      get().addNotification(message, 'error');
      throw error;
    }
  },

  // =========================================================================
  // SETTINGS
  // =========================================================================

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/settings', {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      const settings: Record<string, string> = data.settings || data || {};
      set({ settings, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      get().addNotification(
        error instanceof Error ? error.message : 'Failed to load settings',
        'error',
      );
    }
  },

  updateSettings: async (settings) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Failed to update settings');
      }
      const updated: Record<string, string> = await res.json();
      set((s) => ({
        settings: { ...s.settings, ...updated },
        isLoading: false,
      }));
      get().addNotification('Settings updated successfully.', 'success');
    } catch (error) {
      set({ isLoading: false });
      const message =
        error instanceof Error ? error.message : 'Failed to update settings';
      get().addNotification(message, 'error');
      throw error;
    }
  },

  // =========================================================================
  // DASHBOARD
  // =========================================================================

  fetchDashboard: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/dashboard', {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      const data = await res.json();
      const dashboardStats: DashboardStats = {
        totalPages: data.pages ?? 0,
        totalPosts: data.posts ?? 0,
        totalCategories: data.categories ?? 0,
        totalMedia: data.media ?? 0,
        recentActivity: data.recentPosts?.map((p: any) => ({
          id: p.id,
          action: 'Nouvel article',
          description: p.title,
          timestamp: p.createdAt,
        })) ?? [],
        viewsOverTime: [],
      };
      set({ dashboardStats, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      get().addNotification(
        error instanceof Error ? error.message : 'Failed to load dashboard',
        'error',
      );
    }
  },

  // =========================================================================
  // UI
  // =========================================================================

  setSelectedItem: (item) => set({ selectedItem: item }),

  dismissWelcome: () => {
    if (typeof window !== 'undefined') localStorage.setItem('jmsa_welcome_shown', '1');
    set({ welcomeShown: true });
  },

  isPendingUser: () => {
    const status = get().user?.status;
    return !status || status === 'pending' || status === 'analyzing' || status === 'beta_ready';
  },

  addNotification: (message, type) => {
    const notification: Notification = {
      id: uid(),
      message,
      type,
      createdAt: Date.now(),
    };
    set((s) => ({
      notifications: [...s.notifications, notification],
    }));

    // Auto-remove after 4 seconds
    setTimeout(() => {
      set((s) => ({
        notifications: s.notifications.filter((n) => n.id !== notification.id),
      }));
    }, 4000);
  },
}));
