import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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


