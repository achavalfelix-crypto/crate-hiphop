# The Golden Era Archives

Un archivo del rap que salió de las calles de Estados Unidos entre 1980 y 2016. Recorrés a los artistas (su vida, sus premios y lo que dijeron), los álbumes que definieron cada costa y la historia de la cultura en trece momentos. Además, en **Mi cajón** armás tu propia colección de discos y canciones: marcás qué escuchaste, puntuás y la ves en una línea de tiempo por año y por costa.

Todos los datos del archivo están verificados y cada uno tiene su fuente a la vista.

**TP2 — Desarrollo Frontend II (UADE, FADI).** React + Vite, Cloud Firestore y despliegue en Vercel.

## Secciones

- **Inicio:** collage con las tapas de todos los álbumes, el propósito de la página y un recorrido en cinco capítulos con los discos más famosos.
- **Artistas:** 26 fichas con imagen, resumen de Wikipedia, logros, un dato destacado, una cita verificada cuando existe y el reproductor de Spotify con sus temas más escuchados. Se filtran por costa.
- **Álbumes:** 24 fichas con tapa, fecha de salida, sello, producción y un dato destacado. Cada disco trae **todas sus canciones desde Spotify**, con duración y reproductor: tocás un tema y suena ahí mismo, y con el + lo guardás en Mi cajón.
- **Historia:** línea de tiempo de 1985 a 2016, cada hito con su fuente.
- **Mi cajón:** la colección personal (detalle abajo).

La barra de arriba siempre marca en dorado la sección en la que estás, y las migas de pan muestran el camino.

## Funciones de Mi cajón

- Agregar, editar y eliminar discos y canciones sueltas (título, artista, año, costa; las canciones pueden indicar de qué disco son).
- Cambiar el estado de cada disco: por escuchar, escuchando o escuchado.
- Puntaje de 0 a 5 estrellas.
- Lista de canciones dentro de cada disco: agregar, quitar y marcar favoritas.
- Línea de tiempo 1980–2016: cada disco o canción es un bloque en su año (las canciones, más bajos), con el color de su costa y el relleno según su estado. Tocar un año filtra la lista.
- Búsqueda por disco, canción o artista, y filtros por tipo, costa y estado.
- Catálogo inicial opcional de 23 discos clave, para no arrancar con el cajón vacío.
- Importar una lista desde un archivo JSON: valida cada entrada y saltea las que ya están en el cajón.
- Duración y reproducciones de YouTube en vivo (se actualizan cada minuto) y link para escuchar cada canción, si tiene video asociado.
- Mensajes de carga, éxito y error en cada operación.

## Tecnologías

- React 19 + Vite
- Firebase: Authentication (anónima) y Cloud Firestore
- Vercel
- API REST de Wikipedia (resúmenes e imágenes, licencia CC BY-SA)
- YouTube Data API v3
- Spotify Web API (flujo client credentials, desde una función de Vercel en `api/spotify.js`)

## Datos en Firestore

Cada visitante entra con un usuario anónimo. Sus discos y canciones se guardan en:

```
users/{uid}/albums/{albumId}
  type: string         // album | cancion
  album: string        // de qué disco es la canción (opcional)
  videoId: string      // video de YouTube de la canción (opcional)
  title: string        // "Illmatic"
  artist: string       // "Nas"
  year: number         // 1980–2016
  coast: string        // west | east | south | midwest
  status: string       // pendiente | escuchando | escuchado
  rating: number       // 0–5
  tracks: [{ id, title, fav, videoId }]   // canciones del disco (vacío en las canciones sueltas)
  createdAt, updatedAt // fecha del servidor
```

Las reglas (`firestore.rules`) solo dejan que cada usuario lea y modifique lo suyo, y validan los campos antes de guardar.

## Ejecutar en local

Requisitos: Node.js 20 o superior y un proyecto de Firebase con Authentication anónima y Cloud Firestore habilitados.

```bash
npm install
cp .env.example .env
# completar .env con los valores de firebaseConfig
npm run dev
```

Variables necesarias (`.env`):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

Opcional, para la duración y las reproducciones de YouTube:

```
VITE_YOUTUBE_API_KEY=
```

Es una clave de navegador de Google Cloud con la **YouTube Data API v3** habilitada, restringida a los dominios de la app (Restricciones de sitios web) y solo a esa API. Sin la clave, la app funciona igual pero sin esos datos.

Después de cambiar `.env`, reiniciá `npm run dev`.

## Spotify

La página usa Spotify sin pedirle a nadie que inicie sesión, así la puede usar cualquier visitante. La función `api/spotify.js` corre en Vercel, pide un token con el Client ID y el Client Secret y busca el disco o el artista. El secreto nunca llega al navegador. Vercel guarda cada respuesta un día para no gastar la cuota.

1. En [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) creá una app con la Web API (la cuenta dueña necesita Premium).
2. Copiá el Client ID y el Client Secret a Vercel (Settings → Environment Variables) como `SPOTIFY_CLIENT_ID` y `SPOTIFY_CLIENT_SECRET`, y también a tu `.env` para probar en local.

Sin cuenta de Spotify, el reproductor pasa fragmentos; con la cuenta abierta en el navegador, los temas completos.

## Reglas de Firestore

Copiar el contenido de `firestore.rules` en Firebase Console → Firestore Database → Reglas, y publicar.

## Despliegue en Vercel

1. Importar el repositorio en Vercel.
2. Framework: Vite. Build: `npm run build`. Salida: `dist`.
3. Cargar las 4 variables `VITE_FIREBASE_*` en Settings → Environment Variables (Production).
4. Desplegar. Si cambian las variables, hacer Redeploy.

## Formato para importar

Una lista JSON de entradas; las que tengan datos inválidos o ya existan (mismo tipo, título y artista) se saltean:

```json
[
  { "type": "album", "title": "Illmatic", "artist": "Nas", "year": 1994, "coast": "east",
    "status": "escuchado", "rating": 5, "tracks": [{ "title": "N.Y. State of Mind", "fav": true }] },
  { "type": "cancion", "title": "No Tears", "artist": "Scarface", "album": "The Diary", "year": 1994, "coast": "south" }
]
```

## Estructura

```
src/
  firebase.js            conexión con Firebase (lee las variables de entorno)
  services/albums.js     todas las operaciones con Firestore (consultar, agregar, modificar, eliminar)
  data/constantes.js     costas, estados y rango de años
  data/catalogo.js       catálogo inicial opcional
  data/archivo.js        artistas, álbumes e hitos verificados, cada uno con su fuente
  services/spotify.js    pide discos y artistas a /api/spotify, con caché
  services/wiki.js       resumen e imagen de Wikipedia (en español si existe), con caché
  hooks/useRuta.js       navegación entre secciones (#/artistas/dr-dre)
  pages/                 Inicio, Artistas, Artista, Albumes, Album, Historia, Cajon
  components/            interfaz (barra, selector de costa, recuadros, lista, formulario, línea de tiempo…)
  App.jsx                elige la página según la dirección
api/spotify.js           función de Vercel que habla con Spotify (guarda el secreto)
firestore.rules          reglas de seguridad
```

## Versiones

- **v1.0** — Primera versión funcional: agregar, listar, marcar escuchado y eliminar.
- **v2.0** — Costa, tres estados, puntaje, canciones, filtros, edición, avisos y reglas con validación.
- **v3.0** — Diseño final, línea de tiempo, búsqueda, catálogo inicial, confirmación al eliminar y versión para celular.
- **v4.0** — Canciones sueltas además de discos: selector Disco/Canción, filtro por tipo, portada redonda y bloque bajo en la línea de tiempo.
- **v5.0** — Importar desde un archivo JSON (por ejemplo, una lista armada a partir del historial de YouTube Music), sin duplicar lo que ya está.
- **v6.0** — Duración y reproducciones en vivo desde la YouTube Data API, link para escuchar y duración total de cada disco.
- **v7.0** — Nuevo nombre, The Golden Era Archives. Pasa de cajón personal a archivo: inicio con collage y recorrido, artistas, álbumes e historia con datos verificados, imágenes de Wikipedia y la sección actual siempre marcada.
- **v8.0** — Spotify: lista completa de canciones y reproductor en cada disco y artista, guardar temas en Mi cajón con un toque, y logo en tipografía de graffiti.

Las imágenes de artistas y tapas vienen de Wikipedia. Si no cargan, se muestra una portada generada con el color de la costa.
