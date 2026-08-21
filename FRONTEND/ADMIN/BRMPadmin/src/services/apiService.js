/**
 * API Service Utility - BRMP DIY Admin & Internal Portal
 * Base URL dari environment variable (Vite: VITE_API_BASE_URL)
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '';

/**
 * Core wrapper untuk fetch API request dengan Interceptor Manual
 * @param {string} endpoint - Path API (contoh: '/api/internal/tracking/1')
 * @param {RequestInit} [options={}] - Opsi fetch standar (method, headers, body, dll.)
 * @returns {Promise<any>} Data respon JSON dari server
 */
export async function apiFetch(endpoint, options = {}) {
  // 1. Format URL endpoint
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  // 2. Default Headers
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const defaultHeaders = {
    Accept: 'application/json',
    ...(!isFormData && { 'Content-Type': 'application/json' }),
  };

  // -------------------------------------------------------------
  // 3. INTERCEPTOR MANUAL UNTUK RUTE INTERNAL (/api/internal/)
  // -------------------------------------------------------------
  const isInternalRoute = cleanEndpoint.startsWith('/api/internal/') || cleanEndpoint.startsWith('/internal/');

  // Ambil token dari localStorage atau sessionStorage
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('jwt_token') ||
    sessionStorage.getItem('token');

  if (isInternalRoute) {
    if (token) {
      // Sisipkan header Authorization Bearer secara otomatis
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn(`[Interceptor Warning] Akses ke rute internal '${cleanEndpoint}' tanpa token JWT.`);
    }
  } else if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Gabungkan custom headers jika ada
  const headers = {
    ...defaultHeaders,
    ...(options.headers || {}),
  };

  // 4. Siapkan request body
  let body = options.body;
  if (body && !isFormData && typeof body === 'object' && !(body instanceof Blob)) {
    body = JSON.stringify(body);
  }

  const fetchConfig = {
    ...options,
    headers,
    body,
  };

  try {
    const response = await fetch(url, fetchConfig);

    // Parse response
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const responseData = isJson ? await response.json() : await response.text();

    // -------------------------------------------------------------
    // 5. INTERCEPTOR ERROR HANDLING (401 Unauthorized / Token Expired)
    // -------------------------------------------------------------
    if (response.status === 401) {
      if (isInternalRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
      }

      const errorMessage =
        (typeof responseData === 'object' && (responseData.message || responseData.error)) ||
        'Sesi telah berakhir atau Anda belum login. Silakan login kembali.';

      const authError = new Error(errorMessage);
      authError.status = 401;
      authError.data = responseData;
      throw authError;
    }

    if (!response.ok) {
      const errorMessage =
        (typeof responseData === 'object' && (responseData.message || responseData.error)) ||
        `Request gagal dengan status ${response.status} (${response.statusText})`;

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = responseData;
      throw error;
    }

    return responseData;
  } catch (error) {
    console.error(`[API Error] ${options.method || 'GET'} ${url}:`, error);
    throw error;
  }
}

/**
 * Helper HTTP Method Shortcuts
 */
export const api = {
  get: (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => apiFetch(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => apiFetch(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => apiFetch(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: 'DELETE' }),
};

// =============================================================
// SERVICE API BRMP DIY
// =============================================================

// 1. Service Autentikasi (Login & Logout)
export const authService = {
  login: async (credentials) => {
    // credentials: { email, password }
    const response = await api.post('/api/auth/login', credentials);
    const token = response?.token || response?.data?.token;
    const user = response?.user || response?.data?.user;
    if (token) {
      localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    }
    return {
      ...response,
      user,
      data: {
        token,
        user,
      },
    };
  },
  getProfile: () => api.get('/api/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
  },
  getToken: () => localStorage.getItem('token') || sessionStorage.getItem('token'),
  getUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
};

// 2. Service Internal Laboratorium (PetugasLab & Admin)
export const internalLabService = {
  // GET /api/internal/tracking -> Mengambil daftar seluruh pengujian
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/internal/tracking${query ? `?${query}` : ''}`);
  },
  // GET /api/internal/tracking/:id -> Mengambil detail pengujian
  getById: (id) => api.get(`/api/internal/tracking/${id}`),
  // POST /api/internal/tracking -> Membuat permohonan baru
  create: (data) => api.post('/api/internal/tracking', data),
  // PUT /api/internal/tracking/:id -> Mengupdate status lab & hasil dokumen
  updateStatus: (id, updateData) => {
    // updateData: { status_uji, hasil_dokumen_url, keterangan, tanggal_selesai, nama_pemohon }
    return api.put(`/api/internal/tracking/${id}`, updateData);
  },
};

// 3. Service Internal Pengaduan (Admin & PetugasLayanan)
export const internalPengaduanService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/internal/pengaduan${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/api/internal/pengaduan/${id}`),
  tanggap: (id, data) => api.put(`/api/internal/pengaduan/${id}/tanggapan`, data),
  delete: (id) => api.delete(`/api/internal/pengaduan/${id}`),
};

// 4. Service Internal Benih (Admin & PetugasBenih)
export const internalBenihService = {
  getAll: () => api.get('/api/internal/benih'),
  create: (data) => api.post('/api/internal/benih', data),
  update: (id, data) => api.put(`/api/internal/benih/${id}`, data),
  delete: (id) => api.delete(`/api/internal/benih/${id}`),
};

// 5. Service Internal Manajemen User (Khusus Admin)
export const internalUserService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/internal/users${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/api/internal/users/${id}`),
  create: (data) => api.post('/api/internal/users', data),
  update: (id, data) => api.put(`/api/internal/users/${id}`, data),
  delete: (id) => api.delete(`/api/internal/users/${id}`),
};

// =============================================================
// KONFIGURASI ROLE SISTEM BRMP DIY
// =============================================================
export const ROLES = {
  ADMIN: 'Admin',
  PETUGAS_LAB: 'PetugasLab',
  PETUGAS_LAYANAN: 'PetugasLayanan',
  PETUGAS_BENIH: 'PetugasBenih',
};

export const ROLE_LIST = [
  'Admin',
  'PetugasLab',
  'PetugasLayanan',
  'PetugasBenih',
];

export const ROLE_DETAILS = {
  Admin: {
    label: 'Administrator',
    shortCode: 'ADM',
    desc: 'Akses penuh seluruh modul sistem & manajemen akun',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 border-emerald-300',
    color: '#0f9957',
  },
  PetugasLab: {
    label: 'Petugas Laboratorium',
    shortCode: 'LAB',
    desc: 'Pengujian sampel & tracking status laboratorium benih',
    badgeClass: 'bg-blue-500/15 text-blue-700 border-blue-300',
    color: '#2563eb',
  },
  PetugasLayanan: {
    label: 'Petugas Layanan & Pengaduan',
    shortCode: 'LYN',
    desc: 'Penerimaan permohonan & tindak lanjut aduan masyarakat',
    badgeClass: 'bg-amber-500/15 text-amber-700 border-amber-300',
    color: '#d97706',
  },
  PetugasBenih: {
    label: 'Petugas Perbenihan',
    shortCode: 'BNH',
    desc: 'Pengelolaan data jenis benih & monitoring stok gudang',
    badgeClass: 'bg-teal-500/15 text-teal-700 border-teal-300',
    color: '#0d9488',
  },
};

export default api;
