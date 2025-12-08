import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'

const Islands = () => {
  const { isAdmin, user } = useAuth()
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

  const handleOpenModal = () => {
    console.log('=== ABRIENDO MODAL ===')
    console.log('Usuario:', user)
    console.log('Es admin:', isAdmin())
    setEditingIsland(null)
    setFormData({ name: '', description: '' })
    setShowModal(true)
    console.log('Modal abierto, showModal = true')
  }

  const handleCloseModal = () => {
    console.log('Cerrando modal')
    setShowModal(false)
    setEditingIsland(null)
    setFormData({ name: '', description: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('=== ENVIANDO FORMULARIO ===')
    console.log('Datos del formulario:', formData)
    console.log('Editando isla?', editingIsland)
    
    if (!formData.name || formData.name.trim() === '') {
      toast.error('El nombre es requerido')
      return
    }
    
    try {
      if (editingIsland) {
        console.log('Actualizando isla:', editingIsland.id)
        const response = await api.put(`/islands/${editingIsland.id}`, formData)
        console.log('Respuesta de actualización:', response.data)
        toast.success('Isla actualizada exitosamente')
      } else {
        console.log('Creando nueva isla')
        const response = await api.post('/islands', formData)
        console.log('Respuesta de creación:', response.data)
        toast.success('Isla creada exitosamente')
      }
      handleCloseModal()
      await fetchIslands()
    } catch (error) {
      console.error('=== ERROR AL GUARDAR ISLA ===')
      console.error('Error completo:', error)
      console.error('Response:', error.response)
      console.error('Data:', error.response?.data)
      console.error('Status:', error.response?.status)
      const errorMessage = error.response?.data?.message || 
                          (typeof error.response?.data === 'string' ? error.response.data : null) ||
                          error.message || 
                          'Error al guardar isla'
      toast.error(`Error: ${errorMessage}`)
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

  console.log('Render - showModal:', showModal, 'isAdmin:', isAdmin(), 'user:', user)

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Islas</h1>
          <p className="text-gray-600 mt-1">Gestiona las islas del hospital</p>
        </div>
        {isAdmin() && (
          <button
            type="button"
            onClick={handleOpenModal}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors active:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            style={{ zIndex: 1 }}
          >
            + Nueva Isla
          </button>
        )}
        {!isAdmin() && (
          <div className="text-sm text-gray-500">
            Rol: {user?.role || 'No definido'}
          </div>
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
                    type="button"
                    onClick={() => handleEdit(island)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ 
            position: 'fixed',
            zIndex: 10000,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
            style={{ zIndex: 10001 }}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingIsland ? 'Editar Isla' : 'Nueva Isla'}
            </h2>
            <form 
              onSubmit={handleSubmit} 
              className="space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    console.log('Cambiando nombre:', e.target.value)
                    setFormData({ ...formData, name: e.target.value })
                  }}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Ej: Isla A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value })
                  }}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Descripción opcional de la isla"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  onClick={(e) => {
                    console.log('Botón Guardar clickeado')
                    e.stopPropagation()
                  }}
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors active:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleCloseModal()
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
