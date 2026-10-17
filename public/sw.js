Attempting to perform the InitializeDefaultDrives operation on the 'FileSystem' provider failed.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = self.registration.scope
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((window) => window.url.startsWith(targetUrl))
    return existing ? existing.focus() : clients.openWindow(targetUrl)
  }))
})
