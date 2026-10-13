# Crate — rap gangster 1980–2016

Aplicación web para armar tu propio cajón de discos de rap gangster de Estados Unidos, de 1980 a 2016. Registrás discos y canciones, marcás qué escuchaste, puntuás y ves tu colección ordenada en una línea de tiempo por año y por costa.

**TP2 — Desarrollo Frontend II (UADE, FADI).** React + Vite, Cloud Firestore y despliegue en Vercel.

## Funciones

- Agregar, editar y eliminar discos (título, artista, año, costa).
- Cambiar el estado de cada disco: por escuchar, escuchando o escuchado.
- Puntaje de 0 a 5 estrellas.
- Canciones por disco: agregar, quitar y marcar favoritas.
- Línea de tiempo 1980–2016: cada disco es un bloque en su año, con el color de su costa y el relleno según su estado. Tocar un año filtra la lista.
- Búsqueda por disco, artista o canción, y filtros por costa y estado.
- Catálogo inicial opcional de 23 discos clave, para no arrancar con el cajón vacío.
- Mensajes de carga, éxito y error en cada operación.

## Tecnologías

- React 19 + Vite
- Firebase: Authentication (anónima) y Cloud Firestore
- Vercel

## Datos en Firestore

Cada visitante entra con un usuario anónimo. Sus discos se guardan en:

```
users/{uid}/albums/{albumId}
  title: string        // "Illmatic"
  artist: string       // "Nas"
  year: number         // 1980–2016
  coast: string        // west | east | south | midwest
  status: string       // pendiente | escuchando | escuchado
  rating: number       // 0–5
  tracks: [{ id, title, fav }]
  createdAt, updatedAt // fecha del servidor
```

Las reglas (`firestore.rules`) solo dejan que cada usuario lea y modifique sus propios discos, y validan los campos antes de guardar.

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

Después de cambiar `.env`, reiniciá `npm run dev`.

## Reglas de Firestore

Copiar el contenido de `firestore.rules` en Firebase Console → Firestore Database → Reglas, y publicar.

## Despliegue en Vercel

1. Importar el repositorio en Vercel.
2. Framework: Vite. Build: `npm run build`. Salida: `dist`.
3. Cargar las 4 variables `VITE_FIREBASE_*` en Settings → Environment Variables (Production).
4. Desplegar. Si cambian las variables, hacer Redeploy.

## Estructura

```
src/
  firebase.js            conexión con Firebase (lee las variables de entorno)
  services/albums.js     todas las operaciones con Firestore (consultar, agregar, modificar, eliminar)
  data/constantes.js     costas, estados y rango de años
  data/catalogo.js       catálogo inicial opcional
  components/            interfaz (lista, formulario, línea de tiempo, filtros, canciones…)
  App.jsx                estado principal de la app
firestore.rules          reglas de seguridad
```

## Versiones

- **v1.0** — Primera versión funcional: agregar, listar, marcar escuchado y eliminar.
- **v2.0** — Costa, tres estados, puntaje, canciones, filtros, edición, avisos y reglas con validación.
- **v3.0** — Diseño final, línea de tiempo, búsqueda, catálogo inicial, confirmación al eliminar y versión para celular.

Las portadas son generadas con tipografía (color de la costa + inicial). No se usan tapas reales.
