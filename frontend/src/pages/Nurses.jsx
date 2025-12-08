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
    username: '',
    fullName: '',
    email: '',
    password: '',
    licenseNumber: '',
    specialization: ''
  })
  const [createNewUser, setCreateNewUser] = useState(true)
  const [selectedIslands, setSelectedIslands] = useState([])
  const [selectedBeds, setSelectedBeds] = useState([])

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
    e.stopPropagation()
    console.log('=== ENVIANDO FORMULARIO ENFERMERO ===')
    console.log('Datos del formulario:', formData)
    console.log('Editando enfermero?', editingNurse)
    
    if (!editingNurse) {
      if (createNewUser) {
        if (!formData.username || formData.username.trim() === '') {
          toast.error('El nombre de usuario es requerido')
          return
        }
        if (!formData.fullName || formData.fullName.trim() === '') {
          toast.error('El nombre completo es requerido')
          return
        }
        if (!formData.email || formData.email.trim() === '') {
          toast.error('El email es requerido')
          return
        }
      } else {
        if (!formData.userId || formData.userId.toString().trim() === '') {
          toast.error('El ID de usuario es requerido')
          return
        }
      }
    }

    try {
      // preparar payload similar a Patients.jsx
      const submitData = {
        ...formData,
        userId: createNewUser ? null : (formData.userId ? Number(formData.userId) : null),
        password: createNewUser ? (formData.password || 'enfermero123') : undefined
      }

      if (!createNewUser) {
        delete submitData.username
        delete submitData.fullName
        delete submitData.email
        delete submitData.password
      } else {
        delete submitData.userId
      }

      if (editingNurse) {
        console.log('Actualizando enfermero:', editingNurse.id)
        await api.put(`/nurses/${editingNurse.id}`, submitData)
        // Asignar islas y camas si se seleccionaron
        if (selectedIslands.length > 0 || selectedBeds.length > 0) {
          await api.post(`/nurses/${editingNurse.id}/assign`, {
            islandIds: selectedIslands,
            bedIds: selectedBeds
          })
        }
        console.log('Enfermero actualizado exitosamente')
        toast.success('Enfermero actualizado exitosamente')
      } else {
        console.log('Creando nuevo enfermero')
        const response = await api.post('/nurses', submitData)
        console.log('Respuesta de creación:', response.data)
        toast.success('Enfermero creado exitosamente')
      }
      setShowModal(false)
      setFormData({ userId: '', username: '', fullName: '', email: '', password: '', licenseNumber: '', specialization: '' })
      setEditingNurse(null)
      setCreateNewUser(true)
      await fetchData()
    } catch (error) {
      console.error('=== ERROR AL GUARDAR ENFERMERO ===')
      console.error('Error completo:', error)
      console.error('Response:', error.response)
      console.error('Data:', error.response?.data)
      console.error('Status:', error.response?.status)
      const errorMessage = error.response?.data?.message || 
                          (typeof error.response?.data === 'string' ? error.response.data : null) ||
                          error.message || 
                          'Error al guardar enfermero'
      toast.error(`Error: ${errorMessage}`)
    }
  }

  const handleAssignIslands = async () => {
    try {
      await api.post(`/nurses/${selectedNurse.id}/assign`, {
        islandIds: selectedIslands,
        bedIds: selectedBeds
      })
      toast.success('Islas asignadas exitosamente')
      setShowAssignModal(false)
      setSelectedNurse(null)
      setSelectedIslands([])
      setSelectedBeds([])
      fetchData()
    } catch (error) {
      toast.error('Error al asignar islas')
    }
  }

  const handleEdit = (nurse) => {
    setEditingNurse(nurse)
    setFormData({
      userId: nurse.userId,
      username: '',
      fullName: '',
      email: '',
      password: '',
      licenseNumber: nurse.licenseNumber || '',
      specialization: nurse.specialization || ''
    })
    setCreateNewUser(false)
    setSelectedIslands(nurse.assignedIslands?.map(i => i.id) || [])
    setSelectedBeds(nurse.assignedBeds?.map(b => b.id) || [])
    setShowModal(true)
  }

  const handleOpenAssignModal = (nurse) => {
    setSelectedNurse(nurse)
    setSelectedIslands(nurse.assignedIslands?.map(i => i.id) || [])
    setSelectedBeds(nurse.assignedBeds?.map(b => b.id) || [])
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
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('Abriendo modal de nuevo enfermero')
            setEditingNurse(null)
              setFormData({ userId: '', username: '', fullName: '', email: '', password: '', licenseNumber: '', specialization: '' })
              setCreateNewUser(true)
            setShowModal(true)
          }}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors active:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false)
              setEditingNurse(null)
                setFormData({ userId: '', username: '', fullName: '', email: '', password: '', licenseNumber: '', specialization: '' })
                setCreateNewUser(true)
            }
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
            style={{ zIndex: 10001 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingNurse ? 'Editar Enfermero' : 'Nuevo Enfermero'}
            </h2>
            <form 
              onSubmit={handleSubmit} 
              className="space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {!editingNurse && (
                <>
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createNewUser}
                        onChange={(e) => setCreateNewUser(e.target.checked)}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Crear nuevo usuario automáticamente
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2 ml-6">
                      {createNewUser
                        ? 'Se creará un nuevo usuario con los datos que ingreses'
                        : 'Usar un usuario existente por su ID'}
                    </p>
                  </div>

                  {createNewUser ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de Usuario *</label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          required
                          placeholder="Ej: enfermero.juan"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          required
                          placeholder="Ej: Juan Pérez"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          placeholder="Ej: enfermero@example.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña (opcional)</label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Dejar vacío para usar 'enfermero123'"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">Si no ingresas una contraseña, se usará 'enfermero123' por defecto</p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ID de Usuario</label>
                      <input
                        type="number"
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      />
                    </div>
                  )}
                </>
              )}
              {/* Mostrar sección de islas y camas solo cuando se edita */}
              {editingNurse && (
                <div className="mt-6 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-3">Asignar Islas y Camas</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded p-3 bg-gray-50">
                    {islands.length > 0 ? (
                      islands.map((island) => (
                        <div key={island.id} className="border-b last:border-b-0 pb-2">
                          <label className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer">
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
                              className="w-4 h-4 text-primary-600"
                            />
                            <span className="text-sm font-medium text-gray-800">{island.name}</span>
                          </label>
                          {island.beds && island.beds.length > 0 && (
                            <div className="mt-1 ml-6 grid grid-cols-3 gap-1">
                              {island.beds.map((bed) => (
                                <label key={bed.id} className="flex items-center gap-1 text-xs p-1 hover:bg-white rounded">
                                  <input
                                    type="checkbox"
                                    checked={selectedBeds.includes(bed.id)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedBeds([...selectedBeds, bed.id])
                                      } else {
                                        setSelectedBeds(selectedBeds.filter(id => id !== bed.id))
                                      }
                                    }}
                                  />
                                  <span className="text-gray-600">{bed.bedNumber}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No hay islas disponibles</p>
                    )}
                  </div>
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
                  onClick={(e) => {
                    console.log('Botón Guardar enfermero clickeado')
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
                    setShowModal(false)
                    setEditingNurse(null)
                      setFormData({ userId: '', username: '', fullName: '', email: '', password: '', licenseNumber: '', specialization: '' })
                      setCreateNewUser(true)
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
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{island.name}</p>
                    {island.description && (
                      <p className="text-sm text-gray-600">{island.description}</p>
                    )}
                    {island.beds && island.beds.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {island.beds.map((bed) => (
                          <label key={bed.id} className="flex items-center gap-2 text-sm p-1">
                            <input
                              type="checkbox"
                              checked={selectedBeds.includes(bed.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBeds([...selectedBeds, bed.id])
                                } else {
                                  setSelectedBeds(selectedBeds.filter(id => id !== bed.id))
                                }
                              }}
                            />
                            <span className="text-gray-700">{bed.bedNumber}</span>
                          </label>
                        ))}
                      </div>
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


