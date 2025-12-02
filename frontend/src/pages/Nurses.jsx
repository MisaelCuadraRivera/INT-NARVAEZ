import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'

const Nurses = () => {
  const { isAdmin } = useAuth()
  const [nurses, setNurses] = useState([])
  const [islands, setIslands] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [editingNurse, setEditingNurse] = useState(null)
  const [selectedNurse, setSelectedNurse] = useState(null)
  const [formData, setFormData] = useState({
    userId: '',
    licenseNumber: '',
    specialization: ''
  })
  const [selectedIslands, setSelectedIslands] = useState([])

  useEffect(() => {
    if (isAdmin()) {
      fetchData()
    }
  }, [isAdmin])

  const fetchData = async () => {
    try {
      const [nursesRes, islandsRes] = await Promise.all([
        api.get('/nurses'),
        api.get('/islands')
      ])
      setNurses(nursesRes.data)
      setIslands(islandsRes.data)
    } catch (error) {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingNurse) {
        await api.put(`/nurses/${editingNurse.id}`, formData)
        toast.success('Enfermero actualizado exitosamente')
      } else {
        await api.post('/nurses', formData)
        toast.success('Enfermero creado exitosamente')
      }
      setShowModal(false)
      setFormData({ userId: '', licenseNumber: '', specialization: '' })
      setEditingNurse(null)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data || 'Error al guardar enfermero')
    }
  }

  const handleAssignIslands = async () => {
    try {
      await api.post(`/nurses/${selectedNurse.id}/assign-islands`, selectedIslands)
      toast.success('Islas asignadas exitosamente')
      setShowAssignModal(false)
      setSelectedNurse(null)
      setSelectedIslands([])
      fetchData()
    } catch (error) {
      toast.error('Error al asignar islas')
    }
  }

  const handleEdit = (nurse) => {
    setEditingNurse(nurse)
    setFormData({
      userId: nurse.userId,
      licenseNumber: nurse.licenseNumber || '',
      specialization: nurse.specialization || ''
    })
    setShowModal(true)
  }

  const handleOpenAssignModal = (nurse) => {
    setSelectedNurse(nurse)
    setSelectedIslands(nurse.assignedIslands?.map(i => i.id) || [])
    setShowAssignModal(true)
  }

  if (!isAdmin()) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No tienes permisos para ver esta página</p>
      </div>
    )
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Enfermeros</h1>
          <p className="text-gray-600 mt-1">Gestiona los enfermeros del hospital</p>
        </div>
        <button
          onClick={() => {
            setEditingNurse(null)
            setFormData({ userId: '', licenseNumber: '', specialization: '' })
            setShowModal(true)
          }}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Nuevo Enfermero
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {nurses.map((nurse) => (
          <div key={nurse.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{nurse.fullName}</h3>
                <p className="text-sm text-gray-600 mt-1">@{nurse.username}</p>
                {nurse.licenseNumber && (
                  <p className="text-sm text-gray-600">Licencia: {nurse.licenseNumber}</p>
                )}
                {nurse.specialization && (
                  <p className="text-sm text-gray-600">Especialización: {nurse.specialization}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(nurse)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  ✏️
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Islas Asignadas:</p>
              {nurse.assignedIslands && nurse.assignedIslands.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {nurse.assignedIslands.map((island) => (
                    <span
                      key={island.id}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs"
                    >
                      {island.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sin islas asignadas</p>
              )}
            </div>

            <button
              onClick={() => handleOpenAssignModal(nurse)}
              className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Asignar Islas
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingNurse ? 'Editar Enfermero' : 'Nuevo Enfermero'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingNurse && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID de Usuario
                  </label>
                  <input
                    type="number"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Licencia
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialización
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
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
                    setEditingNurse(null)
                    setFormData({ userId: '', licenseNumber: '', specialization: '' })
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

      {showAssignModal && selectedNurse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Asignar Islas a {selectedNurse.fullName}
            </h2>
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {islands.map((island) => (
                <label key={island.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIslands.includes(island.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIslands([...selectedIslands, island.id])
                      } else {
                        setSelectedIslands(selectedIslands.filter(id => id !== island.id))
                      }
                    }}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{island.name}</p>
                    {island.description && (
                      <p className="text-sm text-gray-600">{island.description}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAssignIslands}
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedNurse(null)
                  setSelectedIslands([])
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Nurses

