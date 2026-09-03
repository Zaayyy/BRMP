import { useEffect, useRef, useCallback } from 'react';

// Default timeout: 30 menit (dalam milidetik)
const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000;
const STORAGE_ACTIVITY_KEY = 'brmp_last_activity_time';

export function useAutoLogout({ isLoggedIn, onLogout, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  const lastActivityRef = useRef(Date.now());
  const throttleTimerRef = useRef(null);

  // Update waktu aktivitas lokal dan sinkronkan ke localStorage
  const updateActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;

    // Throttle penulisan ke localStorage setiap 3 detik
    if (!throttleTimerRef.current) {
      throttleTimerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_ACTIVITY_KEY, String(Date.now()));
        } catch {
          // Ignore storage errors
        }
        throttleTimerRef.current = null;
      }, 3000);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    // Inisialisasi waktu aktivitas saat login
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      localStorage.setItem(STORAGE_ACTIVITY_KEY, String(now));
    } catch {}

    // Event listener untuk mendeteksi interaksi pengguna
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    const handleUserActivity = () => {
      updateActivity();
    };

    events.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // Pengecekan berkala setiap 10 detik
    const intervalId = setInterval(() => {
      const currentTime = Date.now();
      let lastActivity = lastActivityRef.current;

      try {
        const storedActivity = localStorage.getItem(STORAGE_ACTIVITY_KEY);
        if (storedActivity) {
          const parsed = parseInt(storedActivity, 10);
          if (!isNaN(parsed) && parsed > lastActivity) {
            lastActivity = parsed;
            lastActivityRef.current = parsed;
          }
        }
      } catch {}

      if (currentTime - lastActivity >= timeoutMs) {
        // Waktu tidak aktif melebihi batas -> Trigger Auto-Logout
        sessionStorage.setItem(
          'logout_notice',
          `Sesi Anda telah berakhir secara otomatis karena tidak ada aktivitas selama ${Math.round(
            timeoutMs / 60000
          )} menit.`
        );
        if (onLogout) {
          onLogout();
        }
      }
    }, 10000);

    // Sinkronisasi logout antar tab browser
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        // Token dihapus di tab lain
        if (onLogout) onLogout();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Listener custom event jika menerima 401 Unauthorized dari API
    const handleUnauthorized = (e) => {
      sessionStorage.setItem(
        'logout_notice',
        e.detail || 'Sesi Anda telah berakhir. Silakan login kembali.'
      );
      if (onLogout) onLogout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, [isLoggedIn, onLogout, timeoutMs, updateActivity]);
}
