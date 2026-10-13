// Service worker mínimo: permite instalar la página como app en el celular.
// No guarda nada en caché: todo se pide siempre a internet, así nunca queda una versión vieja.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
