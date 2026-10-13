# Hoja de ruta: llevar las playlists a Spotify

Hoy las playlists viven en la página (Firestore) y suenan con el reproductor propio. El código ya está preparado para dar el salto: cada canción guarda su `spotifyId`, que es lo único que Spotify necesita para armar una playlist.

## Lo que pone Spotify (octubre 2026)

- **Escuchar temas completos:** solo quien tenga su cuenta de Spotify abierta. Ninguna app puede pasar temas completos a visitantes sin cuenta; lo impiden las licencias de las discográficas, no es algo que se pueda pedir.
- **Conectar la cuenta del visitante** (crear playlists en su Spotify): en modo desarrollador, hasta **5 usuarios** anotados a mano en el panel, y el dueño de la app con Premium.
- **Modo extendido** (cualquier usuario): solo para organizaciones registradas, con un servicio lanzado, **250.000 usuarios activos por mes**, disponible en los mercados principales de Spotify y comercialmente viable. Se pide con un formulario desde un email de la empresa; la revisión tarda hasta seis semanas.

Fuente: https://developer.spotify.com/documentation/web-api/concepts/quota-modes

## Etapas

1. **Hecho en la v11:** playlists en la página, para todos, con reproductor propio y cada tema llevando a su disco.
2. **Copiar links (para todos, sin cuenta):** un botón copia los links de Spotify de la playlist; se pegan en una playlist de Spotify de la compu. No necesita permisos.
3. **Conectar Spotify (hasta 5 personas) — hecho en la v12:** inicio de sesión con PKCE (sin secreto en el navegador), permiso `playlist-modify-private`, `POST /me/playlists` y `POST /playlists/{id}/items` con las URIs `spotify:track:{spotifyId}`. Sirve para la demo y para probar con amigos.
4. **Crecer:** registrar el proyecto como organización, llegar a los 250.000 usuarios con la parte que ya funciona para todos (archivo, playlists, reproductor) y recién ahí pedir el modo extendido.
5. **Otras plataformas:** el mismo botón puede exportar a YouTube Music (API de YouTube, con cuota diaria) o Apple Music (MusicKit, requiere el programa de desarrolladores de Apple). Por eso las playlists guardan datos neutros (título, artista, disco) además del ID de Spotify.
