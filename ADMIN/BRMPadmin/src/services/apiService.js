/**
 * API Service Utility - BRMP DIY Admin & Internal Portal
 * Base URL dari environment variable (Vite: VITE_API_BASE_URL)
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.API_BASE_URL ||
  'http://localhost:5000';

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
    if (response && response.data && response.data.token) {
      // Simpan token dan data user ke localStorage
      localStorage.setItem('token', response.data.token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    return response;
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

// 3. Service Internal Pengaduan (Khusus Admin)
export const internalPengaduanService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/internal/pengaduan${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/api/internal/pengaduan/${id}`),
  tanggap: (id, data) => api.put(`/api/internal/pengaduan/${id}/tanggapan`, data),
  delete: (id) => api.delete(`/api/internal/pengaduan/${id}`),
};

// 4. Service Internal Benih (Khusus Admin)
export const internalBenihService = {
  getAll: () => api.get('/api/internal/benih'),
  create: (data) => api.post('/api/internal/benih', data),
  update: (id, data) => api.put(`/api/internal/benih/${id}`, data),
  delete: (id) => api.delete(`/api/internal/benih/${id}`),
};

export default api;
