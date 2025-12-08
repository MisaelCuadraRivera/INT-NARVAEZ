import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'

const Patients = () => {
  const { isAdmin, isNurse, user } = useAuth()
  const [patients, setPatients] = useState([])
  const [beds, setBeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [formData, setFormData] = useState({
    userId: '',
    username: '',
    fullName: '',
    email: '',
    password: '',
    bedId: '',
    diagnosis: '',
    treatment: '',
    medicalRecordNumber: ''
  })
  const [createNewUser, setCreateNewUser] = useState(true)

  useEffect(() => {
    fetchData()
  }, [user?.id, user?.role])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Verificar que tenemos token antes de hacer las peticiones
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('No hay sesión activa. Por favor, inicia sesión nuevamente.')
        return
      }
      
      // Cargar pacientes
      let patientsRes
      try {
        if (isAdmin()) {
          // Admin ve todos los pacientes
          patientsRes = await api.get('/patients')
        } else {
          // Enfermero solo ve sus pacientes asignados
          patientsRes = await api.get(`/nurses/${user?.id}/patients`)
        }
        setPatients(patientsRes.data || [])
      } catch (error) {
        console.error('Error al cargar pacientes:', error)
        if (error.response?.status === 403) {
          toast.error('No tienes permisos para ver pacientes. Verifica tu sesión.')
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        } else if (error.response?.status === 401) {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
        } else {
          toast.error('Error al cargar pacientes')
        }
        setPatients([])
      }
      
      // Cargar camas disponibles
      let allBeds = []
      try {
        if (isAdmin()) {
          // Admin carga todas las islas para ver todas las camas
          const islandsRes = await api.get('/islands')
          if (islandsRes.data && Array.isArray(islandsRes.data)) {
            islandsRes.data.forEach(island => {
              if (island.beds && Array.isArray(island.beds)) {
                island.beds.forEach(bed => {
                  if (!bed.occupied) {
                    allBeds.push({ ...bed, islandName: island.name })
                  }
                })
              }
            })
          }
        } else {
          // Enfermero solo ve sus camas asignadas (incluso las ocupadas)
          const nurseBeds = await api.get(`/nurses/${user?.id}/beds`)
          allBeds = (nurseBeds.data || []).map(bed => ({
            ...bed,
            islandName: bed.islandName
          }))
        }
        setBeds(allBeds)
      } catch (error) {
        console.error('Error al cargar islas:', error)
        if (error.response?.status === 403) {
          toast.error('No tienes permisos para ver islas')
        } else if (error.response?.status === 401) {
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
        } else {
          toast.error('Error al cargar islas')
        }
        setBeds([])
      }
    } catch (error) {
      console.error('Error general al cargar datos:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar datos según el modo de creación
    if (!editingPatient) {
      if (createNewUser) {
        // Validar datos para crear nuevo usuario
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
        // Validar que el userId esté presente si se usa usuario existente
        if (!formData.userId || formData.userId.trim() === '') {
          toast.error('El ID de usuario es requerido')
          return
        }
      }
    }
    
    // Preparar datos para enviar
    const submitData = {
      ...formData,
      userId: createNewUser ? null : (formData.userId ? Number(formData.userId) : null),
      bedId: formData.bedId ? Number(formData.bedId) : null,
      password: createNewUser ? (formData.password || 'paciente123') : undefined
    }
    
    // Limpiar campos no necesarios según el modo
    if (!createNewUser) {
      delete submitData.username
      delete submitData.fullName
      delete submitData.email
      delete submitData.password
    } else {
      delete submitData.userId
    }
    
    try {
      if (editingPatient) {
        await api.put(`/patients/${editingPatient.id}`, submitData)
        toast.success('Paciente actualizado exitosamente')
      } else {
        await api.post('/patients', submitData)
        toast.success('Paciente creado exitosamente')
      }
      setShowModal(false)
      setFormData({
        userId: '',
        username: '',
        fullName: '',
        email: '',
        password: '',
        bedId: '',
        diagnosis: '',
        treatment: '',
        medicalRecordNumber: ''
      })
      setCreateNewUser(true)
      setEditingPatient(null)
      // Recargar datos inmediatamente
      await fetchData()
    } catch (error) {
      console.error('Error al guardar paciente:', error)
      console.error('Error completo:', error.response)
      
      let errorMessage = 'Error al guardar paciente'
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Mensajes más específicos para errores comunes
      if (errorMessage.includes('Usuario no encontrado') || errorMessage.includes('Usuario no encontrado con ID')) {
        errorMessage = `El usuario con ID ${formData.userId} no existe. Por favor, verifica el ID o crea el usuario primero.`
      } else if (errorMessage.includes('Cama no encontrada')) {
        errorMessage = 'La cama seleccionada no existe. Por favor, selecciona otra cama.'
      } else if (errorMessage.includes('ya está ocupada')) {
        errorMessage = 'La cama seleccionada ya está ocupada. Por favor, selecciona otra cama disponible.'
      }
      
      toast.error(errorMessage)
      // No recargar datos si hay error, para que el usuario pueda corregir
    }
  }

  const handleEdit = (patient) => {
    setEditingPatient(patient)
    setFormData({
      userId: patient.userId,
      bedId: patient.bedId || '',
      diagnosis: patient.diagnosis || '',
      treatment: patient.treatment || '',
      medicalRecordNumber: patient.medicalRecordNumber || ''
    })
    setShowModal(true)
  }

  const handleDischarge = async (id) => {
    if (!window.confirm('¿Estás seguro de dar de alta a este paciente?')) return
    
    try {
      await api.post(`/patients/${id}/discharge`)
      toast.success('Paciente dado de alta exitosamente')
      fetchData()
    } catch (error) {
      toast.error('Error al dar de alta al paciente')
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Pacientes</h1>
          <p className="text-gray-600 mt-1">Gestiona los pacientes del hospital</p>
        </div>
        {isAdmin() && (
          <button
            onClick={() => {
              setEditingPatient(null)
            setFormData({
              userId: '',
              username: '',
              fullName: '',
              email: '',
              password: '',
              bedId: '',
              diagnosis: '',
              treatment: '',
              medicalRecordNumber: ''
            })
            setCreateNewUser(true)
            setShowModal(true)
            }}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            + Nuevo Paciente
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {patients.map((patient) => (
          <div key={patient.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{patient.fullName}</h3>
                <p className="text-sm text-gray-600 mt-1">@{patient.username}</p>
                {patient.bedNumber && (
                  <p className="text-sm text-gray-600">Cama: {patient.bedNumber}</p>
                )}
              </div>
              {(isAdmin() || isNurse()) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(patient)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    ✏️
                  </button>
                  {patient.bedId && (
                    <button
                      onClick={() => handleDischarge(patient.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      ✅
                    </button>
                  )}
                </div>
              )}
            </div>

            {patient.diagnosis && (
              <div className="mb-3 p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Diagnóstico:</p>
                <p className="text-sm text-gray-800">{patient.diagnosis}</p>
              </div>
            )}

            {patient.treatment && (
              <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Tratamiento:</p>
                <p className="text-sm text-gray-800">{patient.treatment}</p>
              </div>
            )}

            {patient.medicalRecordNumber && (
              <p className="text-xs text-gray-500">Expediente: {patient.medicalRecordNumber}</p>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-md my-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingPatient && (
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de Usuario *
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          required
                          placeholder="Ej: juan.perez"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre Completo *
                        </label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          placeholder="Ej: juan@example.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contraseña (opcional)
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Dejar vacío para usar 'paciente123'"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Si no ingresas una contraseña, se usará 'paciente123' por defecto
                        </p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID de Usuario Existente *
                      </label>
                      <input
                        type="number"
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        required
                        min="1"
                        placeholder="Ingresa el ID del usuario (ej: 1, 2, 3...)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Usa esta opción si el usuario ya existe en el sistema
                      </p>
                    </div>
                  )}
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cama
                </label>
                <select
                  value={formData.bedId}
                  onChange={(e) => setFormData({ ...formData, bedId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="">Sin cama asignada</option>
                  {beds.map((bed) => (
                    <option key={bed.id} value={bed.id}>
                      {bed.bedNumber} - {bed.islandName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnóstico
                </label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tratamiento
                </label>
                <textarea
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Expediente
                </label>
                <input
                  type="text"
                  value={formData.medicalRecordNumber}
                  onChange={(e) => setFormData({ ...formData, medicalRecordNumber: e.target.value })}
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
                    setEditingPatient(null)
                    setFormData({
                      userId: '',
                      bedId: '',
                      diagnosis: '',
                      treatment: '',
                      medicalRecordNumber: ''
                    })
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

export default Patients

