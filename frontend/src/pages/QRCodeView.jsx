import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import api from '../services/api'
import { toast } from 'react-toastify'

const QRCodeView = () => {
  const { bedId } = useParams()
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQRData()
  }, [bedId])

  const fetchQRData = async () => {
    try {
      // Obtener todas las islas para encontrar la cama
      const islandsRes = await api.get('/islands')
      let bed = null
      
      for (const island of islandsRes.data) {
        if (island.beds) {
          bed = island.beds.find(b => b.id === parseInt(bedId))
          if (bed) break
        }
      }
      
      if (bed) {
        let token = bed.qrCode
        // If no token exists yet, request the backend to generate one
        if (!token) {
          try {
            const tokenRes = await api.get(`/qr/token/bed/${bed.id}`)
            token = tokenRes.data
          } catch (err) {
            // If token generation fails, fall back to showing minimal info
            console.warn('No se pudo generar token QR:', err)
          }
        }

        if (token) {
          const dataResponse = await api.get(`/qr/data/${token}`)
          setQrData(dataResponse.data)
        } else {
          // Si no fue posible generar token, mostrar info básica
          setQrData({
            bedId: bed.id,
            bedNumber: bed.bedNumber,
            islandName: bed.islandName,
            patientInfo: null,
            nurseInfo: null
          })
        }
      }
    } catch (error) {
      toast.error('Error al cargar datos del QR')
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

  if (!qrData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No se encontraron datos para esta cama</p>
        <Link to="/beds" className="text-primary-600 hover:underline mt-4 inline-block">
          Volver a Camas
        </Link>
      </div>
    )
  }

  // Build a public URL that the QR will point to (uses the token if available)
  const publicQrToken = qrData.qrCode || qrData.bedId
  // Prefer an explicit public URL provided via env var for mobile accessibility
  let publicBase = import.meta.env.VITE_PUBLIC_URL || window.location.origin
  // If env var provided without protocol, add http:// to make it usable from mobile devices
  if (!/^https?:\/\//i.test(publicBase)) {
    publicBase = `http://${publicBase}`
  }
  const qrCodeString = `${publicBase.replace(/\/$/, '')}/qr/${publicQrToken}`

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/beds" className="text-primary-600 hover:underline mb-4 inline-block">
          ← Volver a Camas
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Código QR de la Cama</h1>
        <p className="text-gray-600 mt-1">Cama {qrData.bedNumber} - {qrData.islandName}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <QRCodeSVG
              value={qrCodeString}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="text-sm text-gray-600">Escanea este código para ver la información</p>
        </div>

        <div className="space-y-6">
          {qrData.patientInfo && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Información del Paciente</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nombre:</p>
                  <p className="font-medium text-gray-800">{qrData.patientInfo.fullName}</p>
                </div>
                {qrData.patientInfo.medicalRecordNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Expediente:</p>
                    <p className="font-medium text-gray-800">{qrData.patientInfo.medicalRecordNumber}</p>
                  </div>
                )}
                {qrData.patientInfo.diagnosis && (
                  <div>
                    <p className="text-sm text-gray-600">Diagnóstico:</p>
                    <p className="font-medium text-gray-800">{qrData.patientInfo.diagnosis}</p>
                  </div>
                )}
                {qrData.patientInfo.treatment && (
                  <div>
                    <p className="text-sm text-gray-600">Tratamiento:</p>
                    <p className="font-medium text-gray-800">{qrData.patientInfo.treatment}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {qrData.nurseInfo && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Enfermero Encargado</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nombre:</p>
                  <p className="font-medium text-gray-800">{qrData.nurseInfo.fullName}</p>
                </div>
                {qrData.nurseInfo.licenseNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Licencia:</p>
                    <p className="font-medium text-gray-800">{qrData.nurseInfo.licenseNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!qrData.patientInfo && (
            <div className="border-t pt-6">
              <p className="text-gray-600 text-center py-8">Esta cama no tiene un paciente asignado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QRCodeView

