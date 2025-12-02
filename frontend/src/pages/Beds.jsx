import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'

const Beds = () => {
  const { isAdmin } = useAuth()
  const [beds, setBeds] = useState([])
  const [islands, setIslands] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedIsland, setSelectedIsland] = useState('')
  const [bedNumber, setBedNumber] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const islandsRes = await api.get('/islands')
      setIslands(islandsRes.data)
      
      const allBeds = []
      islandsRes.data.forEach(island => {
        if (island.beds) {
          island.beds.forEach(bed => {
            allBeds.push({ ...bed, islandName: island.name })
          })
        }
      })
      setBeds(allBeds)
    } catch (error) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBed = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/islands/${selectedIsland}/beds`, { bedNumber })
      toast.success('Cama agregada exitosamente')
      setShowModal(false)
      setBedNumber('')
      setSelectedIsland('')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data || 'Error al agregar cama')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Camas</h1>
          <p className="text-gray-600 mt-1">Gestiona las camas del hospital</p>
        </div>
        {isAdmin() && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Nueva Cama
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {beds.map((bed) => (
          <div
            key={bed.id}
            className={`bg-white rounded-xl shadow-sm p-6 border-2 ${
              bed.occupied ? 'border-yellow-400' : 'border-green-400'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Cama {bed.bedNumber}</h3>
                <p className="text-sm text-gray-600 mt-1">Isla: {bed.islandName}</p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  bed.occupied
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {bed.occupied ? 'Ocupada' : 'Disponible'}
              </div>
            </div>

            {bed.patient && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Paciente:</p>
                <p className="font-medium text-gray-800">{bed.patient.fullName}</p>
              </div>
            )}

            <Link
              to={`/qr/${bed.id}`}
              className="block w-full bg-primary-600 text-white text-center py-2 rounded-lg hover:bg-primary-700 transition-colors mt-4"
            >
              Ver QR
            </Link>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nueva Cama</h2>
            <form onSubmit={handleAddBed} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Isla
                </label>
                <select
                  value={selectedIsland}
                  onChange={(e) => setSelectedIsland(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="">Selecciona una isla</option>
                  {islands.map((island) => (
                    <option key={island.id} value={island.id}>
                      {island.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Cama
                </label>
                <input
                  type="text"
                  value={bedNumber}
                  onChange={(e) => setBedNumber(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Ej: C-101"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setBedNumber('')
                    setSelectedIsland('')
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Beds

