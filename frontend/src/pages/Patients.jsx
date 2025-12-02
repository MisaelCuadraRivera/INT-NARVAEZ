import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-toastify'

const Patients = () => {
  const { isAdmin, isNurse } = useAuth()
  const [patients, setPatients] = useState([])
  const [beds, setBeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [formData, setFormData] = useState({
    userId: '',
    bedId: '',
    diagnosis: '',
    treatment: '',
    medicalRecordNumber: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Verificar que tenemos token antes de hacer las peticiones
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('No hay sesión activa. Por favor, inicia sesión nuevamente.')
        return
      }
      
      // Cargar pacientes primero
      let patientsRes
      try {
        patientsRes = await api.get('/patients')
        setPatients(patientsRes.data || [])
      } catch (error) {
        console.error('Error al cargar pacientes:', error)
        if (error.response?.status === 403) {
          toast.error('No tienes permisos para ver pacientes. Verifica tu sesión.')
          // Intentar recargar la página después de un momento
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
      
      // Cargar islas después
      let islandsRes
      try {
        islandsRes = await api.get('/islands')
        
        const allBeds = []
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
    try {
      if (editingPatient) {
        await api.put(`/patients/${editingPatient.id}`, formData)
        toast.success('Paciente actualizado exitosamente')
      } else {
        await api.post('/patients', formData)
        toast.success('Paciente creado exitosamente')
      }
      setShowModal(false)
      setFormData({
        userId: '',
        bedId: '',
        diagnosis: '',
        treatment: '',
        medicalRecordNumber: ''
      })
      setEditingPatient(null)
      // Recargar datos inmediatamente
      await fetchData()
    } catch (error) {
      console.error('Error al guardar paciente:', error)
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Error al guardar paciente'
      toast.error(errorMessage)
      // Aún así intentar recargar los datos
      fetchData()
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
                bedId: '',
                diagnosis: '',
                treatment: '',
                medicalRecordNumber: ''
              })
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

