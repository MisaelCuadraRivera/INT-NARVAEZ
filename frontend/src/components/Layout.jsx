import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useRef } from 'react'
import api, { API_BASE_URL } from '../services/api'
import { toast } from 'react-toastify'

const Layout = () => {
  const { user, logout, isAdmin, isNurse } = useAuth()
  const location = useLocation()

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

  // Poll for incoming calls for nurses and show browser notifications
  const seenCallsRef = useRef(new Set())
  useEffect(() => {
    let intervalId = null
    const startPolling = async () => {
      if (!user || !user.id) return
      try {
        // Request notification permission (if not yet granted/denied)
        if (Notification && Notification.permission === 'default') {
          Notification.requestPermission().then(p => {
            if (p !== 'granted') {
              console.warn('Notificaciones no permitidas por el usuario')
            }
          })
        }

        const fetchCalls = async () => {
          try {
            const res = await api.get(`/calls/nurse/${user.id}`)
            const calls = res.data || []
            calls.forEach(call => {
              if (!seenCallsRef.current.has(call.id)) {
                seenCallsRef.current.add(call.id)
                // Build notification text
                const bedNum = call.bed?.bedNumber || call.bed?.id || 'N/A'
                const patientName = call.patient?.fullName || call.patient?.username || 'Paciente'
                const title = 'Llamado de emergencia'
                const body = `${patientName} en cama ${bedNum} está llamando.`

                // Show browser notification if permitted
                if (Notification && Notification.permission === 'granted') {
                  try {
                    const n = new Notification(title, { body })
                    n.onclick = () => window.focus()
                  } catch (err) {
                    console.error('No se pudo mostrar notificación:', err)
                  }
                }

                // Also show in-app toast
                toast.warn(body, { autoClose: 10000 })

                // Play a short beep via Web Audio
                try {
                  const ctx = new (window.AudioContext || window.webkitAudioContext)()
                  const o = ctx.createOscillator()
                  const g = ctx.createGain()
                  o.type = 'sine'
                  o.frequency.setValueAtTime(880, ctx.currentTime)
                  g.gain.setValueAtTime(0.0001, ctx.currentTime)
                  g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01)
                  o.connect(g)
                  g.connect(ctx.destination)
                  o.start()
                  setTimeout(() => {
                    o.stop()
                    ctx.close()
                  }, 600)
                } catch (e) {
                  console.warn('Audio not available', e)
                }
              }
            })
          } catch (err) {
            // silent
          }
        }

        const registerPushSubscription = async () => {
          try {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
            const permission = await Notification.requestPermission()
            if (permission !== 'granted') return

            // register service worker
            const registration = await navigator.serviceWorker.register('/sw.js')

            // get existing subscription
            let subscription = await registration.pushManager.getSubscription()
            if (!subscription) {
              // fetch VAPID public key
              const vapidRes = await api.get('/push/vapidPublicKey')
              const publicKey = vapidRes.data.publicKey
              const applicationServerKey = urlBase64ToUint8Array(publicKey)
              subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey
              })
            }

            // send subscription to backend for this nurse
            if (subscription) {
              await api.post(`/push/subscribe/${user.id}`, { subscription: subscription.toJSON() })
            }
          } catch (err) {
            console.warn('Push subscription failed', err)
          }
        }

        function urlBase64ToUint8Array(base64String) {
          const padding = '='.repeat((4 - base64String.length % 4) % 4)
          const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
          const rawData = window.atob(base64)
          const outputArray = new Uint8Array(rawData.length)
          for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i)
          }
          return outputArray
        }

        // initial fetch
        await fetchCalls()
        // CAMBIO: Acelerado a 3000ms (3 segundos)
        intervalId = setInterval(fetchCalls, 3000)

        // CAMBIO: SSE comentado para evitar error 504 y CORS en AWS
        /*
          // Try SSE for real-time push
          if (window.EventSource) {
            try {
              // Use API_BASE_URL so SSE connects to the actual backend URL (works with ngrok)
              const sseBase = API_BASE_URL.replace(/\/$/, '')
              const sseUrl = `${sseBase}/calls/stream/${user.id}`
              const es = new EventSource(sseUrl)
              es.onopen = () => console.log('SSE connected to', sseUrl)
              es.onmessage = (ev) => {
                try {
                  const call = JSON.parse(ev.data)
                  if (!seenCallsRef.current.has(call.id)) {
                    seenCallsRef.current.add(call.id)
                    const bedNum = call.bed?.bedNumber || call.bed?.id || 'N/A'
                    const patientName = call.patient?.fullName || call.patient?.username || 'Paciente'
                    const title = 'Llamado de emergencia'
                    const body = `${patientName} en cama ${bedNum} está llamando.`
                    if (Notification && Notification.permission === 'granted') {
                      new Notification(title, { body })
                    }
                    toast.warn(body, { autoClose: 10000 })
                  }
                } catch (err) {
                  console.error('Error processing SSE message', err)
                }
              }
              es.onerror = (err) => {
                try { es.close() } catch (e) {}
              }
              // store EventSource on window so we can close it on unmount
              window.__callsEventSource = es
            } catch (e) {
              console.warn('SSE not available', e)
            }
            // register push subscription for nurses
            try {
              await registerPushSubscription()
            } catch (e) {
              // ignore
            }
          }
        */
      } catch (err) {
        console.error('Error polling calls', err)
      }
    }

    if (user?.role === 'NURSE') {
      startPolling()
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
        try {
          const es = window.__callsEventSource
          if (es) es.close()
        } catch (e) {}
    }
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50">
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
      <main className="lg:hidden pb-20">
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout