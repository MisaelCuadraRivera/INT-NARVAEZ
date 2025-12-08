import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(username, password)
    
    if (result.success) {
      toast.success('Inicio de sesión exitoso')
      try {
        // Obtener usuario almacenado (login guarda en localStorage)
        const stored = localStorage.getItem('user')
        const currentUser = stored ? JSON.parse(stored) : null

        // Si es paciente, buscar su registro y redirigir a la página pública del QR
        if (currentUser?.role === 'PATIENT') {
          try {
            const patientsRes = await api.get('/patients')
            const patients = patientsRes.data || []
            const myPatient = patients.find(p => p.userId === currentUser.id)

            if (myPatient && myPatient.bedId) {
              // Asegurar que exista token (genera si no existe)
              const tokenRes = await api.get(`/qr/token/bed/${myPatient.bedId}`)
              const token = tokenRes.data
              if (token) {
                navigate(`/qr/${token}`)
              } else {
                toast.error('No se pudo obtener el token QR del paciente')
                navigate('/')
              }
            } else {
              toast.info('No se encontró cama asignada al paciente')
              navigate('/')
            }
          } catch (err) {
            console.error('Error buscando paciente tras login:', err)
            toast.error('Error al obtener información del paciente')
            navigate('/')
          }
        } else {
          navigate('/')
        }
      } catch (err) {
        console.error('Error en redirect post-login:', err)
        navigate('/')
      }
    } else {
      toast.error(result.message || 'Error al iniciar sesión')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Control de Pacientes</h1>
            <p className="text-gray-600">Inicia sesión en tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="Ingresa tu usuario"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="Ingresa tu contraseña"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">Usuarios de prueba:</p>
            <div className="space-y-1 text-xs text-blue-800">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>Enfermero:</strong> enfermero / enfermero123</p>
              <p><strong>Paciente:</strong> paciente / paciente123</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link to="/register" className="text-primary-600 hover:underline text-sm">
              ¿No tienes cuenta? Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

