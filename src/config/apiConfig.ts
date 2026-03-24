// ── API Base URL ───────────────────────────────────────────────
// export const BASE_URL = 'http://192.168.31.104:5000/api';
// export const BASE_URL = 'https://mount-backend-sr1s.onrender.com/api';
export const BASE_URL = "https://admin.devasahayammountshrine.com/"
// ── Auth token helpers ─────────────────────────────────────────
export const getToken = () => localStorage.getItem('admin_token');

export const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});