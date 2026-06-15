import axios from 'axios'

// WHY: Single axios instance means API base URL is configured once.
// For dev, Vite proxies /api to localhost:5000.
// For production, set VITE_API_BASE_URL env var.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 90000, // 90s — Render free tier cold start can take up to 80s
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Network error'
    return Promise.reject(new Error(message))
  }
)

export default api
