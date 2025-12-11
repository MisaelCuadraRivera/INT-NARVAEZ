import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useRef, useState } from 'react' // <--- IMPORTANTE: useState agregado
import api, { API_BASE_URL } from '../services/api'
import { toast } from 'react-toastify'

const Layout = () => {
  const { user, logout, isAdmin, isNurse } = useAuth()
  const location = useLocation()
  
  // Estado para controlar si ya activamos el audio manualmente
  const [permissionsGranted, setPermissionsGranted] = useState(false)

  const isActive = (path) => location.pathname === path

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊', roles: ['ADMIN', 'NURSE', 'PATIENT'] },
    { path: '/islands', label: 'Islas', icon: '🏥', roles: ['ADMIN'] },
    { path: '/beds', label: 'Camas', icon: '🛏️', roles: ['ADMIN', 'NURSE'] },
    { path: '/patients', label: 'Pacientes', icon: '👤', roles: ['ADMIN', 'NURSE'] },
    { path: '/nurses', label: 'Enfermeros', icon: '👨‍⚕️', roles: ['ADMIN'] },
  ]

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  )

  // --- FUNCIÓN PARA ACTIVAR PERMISOS EN CELULAR ---
  const enableAlerts = () => {
    // 1. Pedir permiso de notificaciones nativas
    if (Notification) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notificaciones permitidas')
        }
      })
    }
    
    // 2. Desbloquear AudioContext (Truco para iOS/Android)
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, ctx.currentTime) // Volumen 0 (silencio)
      o.connect(g)
      g.connect(ctx.destination)
      o.start()
      o.stop(ctx.currentTime + 0.1) // Dura 0.1 segundos
      
      setPermissionsGranted(true) // Ocultamos el botón
      toast.success('¡Sonido y Alertas Activados!')
    } catch (e) {
      console.error('Error al activar audio', e)
      toast.error('No se pudo activar el audio')
    }
  }

  // Poll for incoming calls for nurses
  const seenCallsRef = useRef(new Set())
  useEffect(() => {
    let intervalId = null
    const startPolling = async () => {
      if (!user || !user.id) return
      try {
        const fetchCalls = async () => {
          try {
            const res = await api.get(`/calls/nurse/${user.id}`)
            const calls = res.data || []
            calls.forEach(call => {
              if (!seenCallsRef.current.has(call.id)) {
                seenCallsRef.current.add(call.id)
                
                // Texto de la notificación
                const bedNum = call.bed?.bedNumber || call.bed?.id || 'N/A'
                const patientName = call.patient?.user?.fullName || 'Paciente'
                const title = 'Llamado de emergencia'
                const body = `${patientName} en cama ${bedNum} está llamando.`

                // 1. Notificación Nativa (si hay permiso)
                if (Notification && Notification.permission === 'granted') {
                  try {
                    const n = new Notification(title, { body })
                    n.onclick = () => window.focus()
                  } catch (err) { console.error(err) }
                }

                // 2. Toast visible (siempre sale)
                toast.warn(body, { 
                  position: "top-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  style: { fontSize: '16px', fontWeight: 'bold' }
                })

                // 3. Sonido "Beep" fuerte
                try {
                  const ctx = new (window.AudioContext || window.webkitAudioContext)()
                  const o = ctx.createOscillator()
                  const g = ctx.createGain()
                  o.type = 'sine' // Tipo de onda (sine, square, sawtooth)
                  o.frequency.setValueAtTime(880, ctx.currentTime) // Tono agudo (A5)
                  g.gain.setValueAtTime(0.0001, ctx.currentTime)
                  g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.01) // Volumen
                  o.connect(g)
                  g.connect(ctx.destination)
                  o.start()
                  setTimeout(() => {
                    o.stop()
                    ctx.close()
                  }, 1000) // Duración 1 segundo
                } catch (e) {
                  console.warn('Audio not available', e)
                }
              }
            })
          } catch (err) {
            // silent fail
          }
        }

        // initial fetch
        await fetchCalls()
        intervalId = setInterval(fetchCalls, 3000) // Cada 3 segundos

      } catch (err) {
        console.error('Error polling calls', err)
      }
    }

    if (user?.role === 'NURSE') {
      startPolling()
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      
      {/* --- BOTÓN FLOTANTE PARA ACTIVAR ALERTAS EN MÓVIL --- */}
      {user?.role === 'NURSE' && !permissionsGranted && (
        <div className="bg-yellow-100 border-b border-yellow-300 p-3 sticky top-0 z-[60] text-center shadow-md">
          <p className="text-yellow-800 text-xs mb-2 font-medium">⚠️ Necesario para escuchar alarmas</p>
          <button 
            onClick={enableAlerts}
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-sm shadow active:bg-blue-700 transition-colors w-full max-w-xs"
          >
            🔔 ACTIVAR SONIDO
          </button>
        </div>
      )}

      {/* Header móvil */}
      <header className="bg-white shadow-sm sticky top-0 z-50 lg:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-600">Hospital</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.username}</span>
            <button
              onClick={logout}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar móvil */}
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <div className="flex justify-around">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center justify-center py-3 ${
                isActive(item.path)
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Layout desktop */}
      <div className="hidden lg:flex">
        <aside className="w-64 bg-white shadow-sm min-h-screen fixed left-0 top-0">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-primary-600">Hospital</h1>
            <p className="text-sm text-gray-500 mt-1">Sistema de Gestión</p>
          </div>
          
          <nav className="p-4">
            {filteredMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700">{user?.username}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
            <button
              onClick={logout}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </aside>

        <main className="flex-1 ml-64">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Contenido móvil */}
      <main className="lg:hidden p-4">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
