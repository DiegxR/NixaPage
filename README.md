# Next.js + Three.js — Visualizador según canción

Proyecto con **Next.js**, **Three.js** (React Three Fiber) y análisis de audio con la **Web Audio API** para animar un objeto 3D según la música.

## Cómo empezar

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Poner tu canción**
   - Coloca tu archivo de audio en `public/audio/` (por ejemplo `song.mp3`).
   - En `config/visualizer.ts` define la ruta:
     ```ts
     export const SONG_PATH = "/audio/song.mp3";
     ```

3. **Arrancar en desarrollo**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000), pulsa **Reproducir** y el objeto 3D reaccionará al audio.

## Estructura

- **`config/visualizer.ts`** — Ruta de la canción, sensibilidad y suavizado.
- **`components/Scene.tsx`** — Canvas de Three.js y luces.
- **`components/MusicReactiveObject.tsx`** — Objeto 3D que se anima con el audio (aquí puedes cambiar geometría o lógica).
- **`hooks/useAudioAnalyzer.ts`** — Hook que analiza el audio y expone los datos de frecuencia.

## Cambiar el objeto 3D

Edita `components/MusicReactiveObject.tsx`: sustituye la geometría (`icosahedronGeometry`) por la que quieras o importa un modelo (GLTF) con `@react-three/drei` y usa `frequencyDataRef` para escalar, rotar o mover según las frecuencias.

## Ajustes en `config/visualizer.ts`

- **`SONG_PATH`** — Ruta del archivo en `public`.
- **`AUDIO_SENSITIVITY`** — Intensidad del movimiento (mayor = más exagerado).
- **`SMOOTHING`** — Suavizado del análisis (0 = muy reactivo, 1 = muy suave).
- **`FFT_SIZE`** — Tamaño FFT (más = más detalle, más coste).
