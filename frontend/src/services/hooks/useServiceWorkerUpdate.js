import { useEffect } from 'react'
import { registerSW } from 'virtual:pwa-register'

export function useServiceWorkerUpdate() {
  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        // hay una nueva versión, puedes notificar al usuario
        if (confirm('Hay una nueva versión disponible. ¿Recargar ahora?')) {
          updateSW() // dispara la actualización
        }
      },
      onOfflineReady() {
        console.log('App lista para usarse offline.')
      }
    })
    return () => {}
  }, [])
}