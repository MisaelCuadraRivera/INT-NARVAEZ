import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'

const Dashboard = () => {
  const { isAdmin, isNurse } = useAuth()
  const [stats, setStats] = useState({
    totalIslands: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    totalPatients: 0,
    totalNurses: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [islandsRes, patientsRes, nursesRes] = await Promise.all([
        api.get('/islands'),
        api.get('/patients'),
        isAdmin() ? api.get('/nurses') : Promise.resolve({ data: [] })
      ])

      const islands = islandsRes.data
      const patients = patientsRes.data
      const nurses = nursesRes.data

      const totalBeds = islands.reduce((sum, island) => sum + (island.totalBeds || 0), 0)
      const occupiedBeds = islands.reduce((sum, island) => sum + (island.occupiedBeds || 0), 0)

      setStats({
        totalIslands: islands.length,
        totalBeds,
        occupiedBeds,
        totalPatients: patients.length,
        totalNurses: nurses.length
      })
    } catch (error) {
      toast.error('Error al cargar estadísticas')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const statCards = [
    { label: 'Islas', value: stats.totalIslands, icon: '🏥', color: 'bg-blue-500', link: '/islands' },
    { label: 'Camas Totales', value: stats.totalBeds, icon: '🛏️', color: 'bg-green-500', link: '/beds' },
    { label: 'Camas Ocupadas', value: stats.occupiedBeds, icon: '📊', color: 'bg-yellow-500', link: '/beds' },
    { label: 'Pacientes', value: stats.totalPatients, icon: '👤', color: 'bg-purple-500', link: '/patients' },
  ]

  if (isAdmin()) {
    statCards.push({ label: 'Enfermeros', value: stats.totalNurses, icon: '👨‍⚕️', color: 'bg-red-500', link: '/nurses' })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Resumen del sistema hospitalario</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-16 h-16 rounded-lg flex items-center justify-center text-3xl`}>
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/islands"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <span className="text-2xl mb-2 block">🏥</span>
            <span className="text-gray-700 font-medium">Gestionar Islas</span>
          </Link>
          <Link
            to="/beds"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <span className="text-2xl mb-2 block">🛏️</span>
            <span className="text-gray-700 font-medium">Gestionar Camas</span>
          </Link>
          <Link
            to="/patients"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <span className="text-2xl mb-2 block">👤</span>
            <span className="text-gray-700 font-medium">Gestionar Pacientes</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

