import axios from 'axios'

// Detecta la URL base de la API de forma inteligente:
// 1. Si VITE_API_URL está configurada, úsala
// 2. Si no, usa el mismo host que el frontend (reemplaza puerto 3000/5173 con 8080)
// 3. Si todo falla, usa localhost:8080/api como último recurso
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  // Automático: reemplaza el puerto del frontend con 8080 (puerto del backend)
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  return `https://backend-production-7df8.up.railway.app/api`
}

export const API_BASE_URL = getApiBaseUrl()

export const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Token enviado en petición a:', config.url)
    } else {
      console.warn('No hay token disponible para la petición a:', config.url)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Error 401 - No autenticado')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      console.error('Error 403 - Acceso denegado:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        response: error.response
      })
      // No redirigir automáticamente en 403, solo mostrar el error
    }
    return Promise.reject(error)
  }
)

export default api

