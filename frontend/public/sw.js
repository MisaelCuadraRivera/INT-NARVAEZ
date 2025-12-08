self.addEventListener('push', function(event) {
  let data = {}
  try {
    data = event.data.json()
  } catch (e) {
    data = { title: 'Notificación', body: event.data ? event.data.text() : '' }
  }

  const title = data.title || 'Hospital'
  const options = {
    body: data.body || '',
    icon: '/favicon.png',
    badge: '/favicon.png',
    data: data
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        const client = clientList[0]
        return client.focus()
      }
      return clients.openWindow('/')
    })
  )
})
