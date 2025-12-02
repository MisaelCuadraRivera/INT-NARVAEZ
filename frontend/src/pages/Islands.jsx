import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'

const Islands = () => {
  const { isAdmin } = useAuth()
  const [islands, setIslands] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingIsland, setEditingIsland] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  useEffect(() => {
    fetchIslands()
  }, [])

  const fetchIslands = async () => {
    try {
      const response = await api.get('/islands')
      setIslands(response.data)
    } catch (error) {
      toast.error('Error al cargar islas')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingIsland) {
        await api.put(`/islands/${editingIsland.id}`, formData)
        toast.success('Isla actualizada exitosamente')
      } else {
        await api.post('/islands', formData)
        toast.success('Isla creada exitosamente')
      }
      setShowModal(false)
      setFormData({ name: '', description: '' })
      setEditingIsland(null)
      fetchIslands()
    } catch (error) {
      toast.error(error.response?.data || 'Error al guardar isla')
    }
  }

  const handleEdit = (island) => {
    setEditingIsland(island)
    setFormData({ name: island.name, description: island.description || '' })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta isla?')) return
    
    try {
      await api.delete(`/islands/${id}`)
      toast.success('Isla eliminada exitosamente')
      fetchIslands()
    } catch (error) {
      toast.error('Error al eliminar isla')
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Islas</h1>
          <p className="text-gray-600 mt-1">Gestiona las islas del hospital</p>
        </div>
        {isAdmin() && (
          <button
            onClick={() => {
              setEditingIsland(null)
              setFormData({ name: '', description: '' })
              setShowModal(true)
            }}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Nueva Isla
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {islands.map((island) => (
          <div key={island.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{island.name}</h3>
                {island.description && (
                  <p className="text-sm text-gray-600 mt-1">{island.description}</p>
                )}
              </div>
              {isAdmin() && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(island)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(island.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Total Camas</p>
                <p className="text-2xl font-bold text-gray-800">{island.totalBeds || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Ocupadas</p>
                <p className="text-2xl font-bold text-yellow-600">{island.occupiedBeds || 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingIsland ? 'Editar Isla' : 'Nueva Isla'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
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
                    setEditingIsland(null)
                    setFormData({ name: '', description: '' })
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

export default Islands

