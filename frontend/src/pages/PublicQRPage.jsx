import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

// For public pages, create separate axios instance with configurable API URL
const getPublicApi = () => {
  let apiUrl = import.meta.env.VITE_API_URL
  if (!apiUrl) {
    // Auto-detect: use same hostname as frontend but port 8080 (backend port)
    const protocol = window.location.protocol
    const hostname = window.location.hostname
    apiUrl = `${protocol}//${hostname}:8080/api`
  }
  return axios.create({
    baseURL: apiUrl,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

const PublicQRPage = () => {
  const { qrCode } = useParams()
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [apiUrl, setApiUrl] = useState('')
  const [error, setError] = useState(null)
  const [calling, setCalling] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    fetchData()
  }, [qrCode])

  const fetchData = async () => {
    try {
      const publicApi = getPublicApi()
      const finalApiUrl = publicApi.defaults.baseURL
      setApiUrl(finalApiUrl)
      console.log('Intentando conectar a:', finalApiUrl)
      
      const res = await publicApi.get(`/qr/data/${qrCode}`, {
        timeout: 10000 // 10 segundos de timeout
      })
      setQrData(res.data)
      setError(null)
    } catch (err) {
      console.error('Error al cargar QR:', err.message, err)
      setError(err.message || 'No se pudo cargar la información del QR')
      toast.error(err.message || 'No se pudo cargar la información del QR')
    } finally {
      setLoading(false)
    }
  }

  const handleCallNurse = async () => {
    if (!qrData || !qrData.bedId) return;
    if (cooldown > 0) {
      toast.info(`Espera ${cooldown}s antes de llamar de nuevo`)
      return
    }

    try {
      setCalling(true)
      const res = await axios.post(`${(getPublicApi()).defaults.baseURL}/calls`, { bedId: qrData.bedId })
      toast.success('Llamado enviado al enfermero a cargo')

      // start client cooldown (30s)
      let remaining = 30
      setCooldown(remaining)
      const interval = setInterval(() => {
        remaining -= 1
        setCooldown(remaining)
        if (remaining <= 0) {
          clearInterval(interval)
        }
      }, 1000)
    } catch (err) {
      console.error('Error al enviar llamado:', err)
      toast.error(err.response?.data || 'Error al enviar el llamado')
    } finally {
      setCalling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!qrData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-gray-600">No se encontró información para este código QR.</p>
        {apiUrl && (
          <p className="text-xs text-gray-400 mt-2">API URL: {apiUrl}</p>
        )}
        {error && (
          <p className="text-xs text-red-600 mt-2">Error: {error}</p>
        )}
        
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Ficha del Paciente</h1>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Paciente</h2>
            {qrData.patientInfo ? (
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium text-gray-800">{qrData.patientInfo.fullName}</p>
                </div>
                {qrData.patientInfo.medicalRecordNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Expediente</p>
                    <p className="font-medium text-gray-800">{qrData.patientInfo.medicalRecordNumber}</p>
                  </div>
                )}
                {qrData.patientInfo.diagnosis && (
                  <div>
                    <p className="text-sm text-gray-600">Diagnóstico</p>
                    <p className="font-medium text-gray-800">{qrData.patientInfo.diagnosis}</p>
                  </div>
                )}
                {qrData.patientInfo.treatment && (
                  <div>
                    <p className="text-sm text-gray-600">Tratamiento</p>
                    <p className="font-medium text-gray-800">{qrData.patientInfo.treatment}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">No hay paciente asignado a esta cama.</p>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Cama / Ubicación</h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Isla</p>
                <p className="font-medium text-gray-800">{qrData.islandName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cama</p>
                <p className="font-medium text-gray-800">{qrData.bedNumber || qrData.bedId}</p>
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-semibold">Enfermero a cargo</h3>
                {qrData.nurseInfo ? (
                  <div className="mt-2 space-y-1">
                    <div>
                      <p className="text-sm text-gray-600">Nombre</p>
                      <p className="font-medium text-gray-800">{qrData.nurseInfo.fullName}</p>
                    </div>
                    {qrData.nurseInfo.licenseNumber && (
                      <div>
                        <p className="text-sm text-gray-600">Licencia</p>
                        <p className="font-medium text-gray-800">{qrData.nurseInfo.licenseNumber}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">No hay enfermero asignado</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 text-sm text-gray-500">
          <p>QR: <span className="break-all">{qrCode}</span></p>
          {apiUrl && (
            <p className="mt-2">API URL: <span className="break-all text-xs">{apiUrl}</span></p>
          )}
        </div>
        {/* Botón de llamada de emergencia (visible para paciente público) */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleCallNurse}
            disabled={calling || cooldown > 0}
            className={`w-full max-w-md text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors ${calling || cooldown > 0 ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {cooldown > 0 ? `Llamando... espera ${cooldown}s` : 'LLAMAR'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PublicQRPage
