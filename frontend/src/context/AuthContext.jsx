import { createContext, useState, useContext, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
        authAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await authAPI.post('/auth/login', { username, password })
      const { token, username: userUsername, role, userId } = response.data
      
      const userData = { id: userId, username: userUsername, role, userId }
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete authAPI.defaults.headers.common['Authorization']
    setUser(null)
  }

  const isAdmin = () => user?.role === 'ADMIN'
  const isNurse = () => user?.role === 'NURSE'
  const isPatient = () => user?.role === 'PATIENT'

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      isAdmin,
      isNurse,
      isPatient
    }}>
      {children}
    </AuthContext.Provider>
  )
}



