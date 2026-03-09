/**
 * Configuración del visualizador.
 * Opciones del objeto 3D y del análisis de audio.
 */

/** Ruta al modelo 3D GLB (en /public) */
export const MODEL_3D_PATH = "/Hitem3d-1773009408248.glb";
/** Modelo exterior que envuelve al primero (en /public), aparece en el timelapse */
export const SECOND_MODEL_PATH = "/need_some_space.glb";
/** Segundos del timelapse en los que empieza a aparecer el modelo exterior */
export const SECOND_MODEL_APPEAR_AT = 12;
/** Segundos que tarda el modelo exterior en aparecer por completo */
export const SECOND_MODEL_APPEAR_DURATION = 15;
/** Escala final del modelo exterior (mismo centro que el primero, mucho más grande) */
export const SECOND_MODEL_SCALE = 65;
/** Escala inicial del modelo exterior; crece progresivamente hasta SECOND_MODEL_SCALE */
export const SECOND_MODEL_INITIAL_SCALE = 0.1;
/** Posición del modelo exterior (X, Y, Z en unidades). [0,0,0] = mismo centro que el modelo principal */
export const SECOND_MODEL_OFFSET_X = -100;
export const SECOND_MODEL_OFFSET_Y = -100;
export const SECOND_MODEL_OFFSET_Z = 0;
/** Segundos que tarda el movimiento (escala/ritmo) del modelo exterior en pasar de sutil a completo */
export const SECOND_MODEL_MOVEMENT_GROW_DURATION = 18;

/** Sensibilidad del movimiento respecto al audio (1 = normal, mayor = más exagerado) */
export const AUDIO_SENSITIVITY = 3;

/** Suavizado del análisis de audio (0 = muy reactivo, 1 = muy suave) */
export const SMOOTHING = 0.5;

/** Número de bandas de frecuencia a analizar (más = más detalle, más coste) */
export const FFT_SIZE = 256;

/** Ángulo (grados) para extraer bordes: mayor = solo bordes más marcados, menor = más líneas */
export const EDGES_THRESHOLD_ANGLE = 15;

/** Canción por defecto para el timelapse (ruta en /public) */
export const DEFAULT_SONG_PATH = "/audio/Cinema Remix SLAM FINAL11.wav";

/** Duración en segundos del acercamiento de cámara */
export const TIMELAPSE_APPROACH_DURATION = 30;
/** Segundos en los que aparecen las estrellas (antes de que termine el zoom: 55 = 5 s antes) */
export const STARS_APPEAR_AT = 55;
/** Segundos en los que empiezan los meteoros (igual que las estrellas: 55 s) */
export const METEORS_START_AT = 55;
/** Segundos en los que aparece el botón neon (1 min = 60) */
export const NEON_BUTTON_APPEAR_AT = 60;
/** Segundos en los que empieza a sonar el audio (auto-play) */
export const AUDIO_START_AT = 40;

/** Posición inicial de cámara (lejos) y final (cerca) para el timelapse */
export const CAMERA_START_Z = 30;
export const CAMERA_END_Z = 3;

/** Movimiento lateral con el mouse: multiplicador de pointer.x y pointer.y (más = más recorrido) */
export const MOUSE_LATERAL_AMOUNT = 2.2;
/** Acercar/alejarse con el mouse: muy sutil, en unidades (positivo = hacia cámara) */
export const MOUSE_DEPTH_AMOUNT = 0.12;
/** Suavizado del retorno al centro (0 = muy reactivo, 1 = muy lento) */
export const MOUSE_RETURN_SMOOTH = 0.03;
/** Suavizado de la posición siguiendo al mouse (0 = instantáneo, 1 = muy lento) */
export const MOUSE_FOLLOW_SMOOTH = 0.06;

/** Rotación con el mouse: pointer.x → rotación Y (yaw), pointer.y → rotación X (pitch). Valor en radianes. */
export const MOUSE_ROTATION_AMOUNT = 0.85;

/** Rotación con la música: intensidad según graves/agudos (no constante, varía con el audio) */
export const MUSIC_ROTATION_STRENGTH = 0.025;
/** Decay de la rotación para que no sea constante y no se acumule sin límite (0 = no decay, 0.99 = muy suave) */
export const MUSIC_ROTATION_DECAY = 0.992;
