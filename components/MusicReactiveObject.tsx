"use client";

import { useRef, useEffect, useState, useCallback, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import {
  type Group,
  type Material,
  type Mesh,
  EdgesGeometry,
  LineSegments,
  LineBasicMaterial,
  Color,
  BoxGeometry,
  Vector3,
} from "three";
import {
  MODEL_3D_PATH,
  SECOND_MODEL_PATH,
  SECOND_MODEL_APPEAR_AT,
  SECOND_MODEL_APPEAR_DURATION,
  SECOND_MODEL_SCALE,
  SECOND_MODEL_INITIAL_SCALE,
  SECOND_MODEL_OFFSET_X,
  SECOND_MODEL_OFFSET_Y,
  SECOND_MODEL_OFFSET_Z,
  SECOND_MODEL_MOVEMENT_GROW_DURATION,
  EDGES_THRESHOLD_ANGLE,
  MOUSE_LATERAL_AMOUNT,
  MOUSE_DEPTH_AMOUNT,
  MOUSE_RETURN_SMOOTH,
  MOUSE_FOLLOW_SMOOTH,
  MOUSE_ROTATION_AMOUNT,
} from "@/config/visualizer";

const NEON_PURPLE_HEX = 0xb24bf3;
const MESH_DARK_COLOR = 0x0a0612;

interface MusicReactiveObjectProps {
  frequencyDataRef: MutableRefObject<Uint8Array>;
  onLoadError?: (message: string) => void;
  /** Cuando true (zoom completado), el objeto deja de seguir al cursor */
  disableMouseFollow?: boolean;
}

/** Hace los materiales del modelo exterior semi-transparentes */
function setOuterTransparent(scene: Group, opacity: number) {
  scene.traverse((child) => {
    if ("material" in child && child.material) {
      const mat = child.material as Material & { transparent?: boolean; opacity?: number };
      mat.transparent = true;
      mat.opacity = opacity;
    }
  });
}

/** Oscurece el mesh base para que solo destaquen los bordes neón */
function darkenMeshMaterials(scene: Group) {
  const darkColor = new Color(MESH_DARK_COLOR);
  scene.traverse((child) => {
    if ("material" in child && child.material) {
      const mat = child.material as Material & { color?: Color; emissive?: Color; emissiveIntensity?: number };
      if (mat.color) mat.color.copy(darkColor);
      if (mat.emissive) mat.emissive.setHex(0);
      if ("emissiveIntensity" in mat) mat.emissiveIntensity = 0;
    }
  });
}

/** Crea geometría de bordes (EdgesGeometry) y LineSegments neón por cada mesh */
function addNeonEdgesToScene(scene: Group): LineSegments[] {
  const edgeLines: LineSegments[] = [];
  const edgeMaterial = new LineBasicMaterial({
    color: NEON_PURPLE_HEX,
    linewidth: 1,
  });

  scene.traverse((child) => {
    if (!(child as Mesh).isMesh) return;
    const mesh = child as Mesh;
    if (!mesh.geometry) return;

    const edgesGeometry = new EdgesGeometry(mesh.geometry, EDGES_THRESHOLD_ANGLE);
    const lineSegments = new LineSegments(edgesGeometry, edgeMaterial.clone());
    mesh.add(lineSegments);
    edgeLines.push(lineSegments);
  });

  return edgeLines;
}

/** Objeto de respaldo cuando falla la carga del GLB */
function FallbackMesh({
  frequencyDataRef,
  disableMouseFollow = false,
}: {
  frequencyDataRef: MutableRefObject<Uint8Array>;
  disableMouseFollow?: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const boxGeoRef = useRef<BoxGeometry | null>(null);
  const edgesGeoRef = useRef<EdgesGeometry | null>(null);
  const lineMatRef = useRef<LineBasicMaterial | null>(null);
  if (!boxGeoRef.current) {
    boxGeoRef.current = new BoxGeometry(1.5, 1.5, 1.5);
    edgesGeoRef.current = new EdgesGeometry(boxGeoRef.current, 15);
    lineMatRef.current = new LineBasicMaterial({ color: NEON_PURPLE_HEX });
  }
  const boxGeo = boxGeoRef.current;
  const edgesGeo = edgesGeoRef.current;
  const lineMat = lineMatRef.current;
  const targetPosRef = useRef(new Vector3(0, 0, 0));
  const originRef = useRef(new Vector3(0, 0, 0));
  const targetRotRef = useRef(new Vector3(0, 0, 0));
  const zeroVec = useRef(new Vector3(0, 0, 0)).current;

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    if (!disableMouseFollow) {
      const { pointer } = state;
      const target = targetPosRef.current;
      const origin = originRef.current;
      const rx = pointer.x * MOUSE_LATERAL_AMOUNT;
      const ry = pointer.y * MOUSE_LATERAL_AMOUNT;
      const distSq = pointer.x * pointer.x + pointer.y * pointer.y;
      const depth = (1 - Math.min(distSq, 1)) * MOUSE_DEPTH_AMOUNT;
      target.set(rx, ry, depth);
      target.lerp(origin, MOUSE_RETURN_SMOOTH);
      group.position.lerp(target, MOUSE_FOLLOW_SMOOTH);
      const tr = targetRotRef.current;
      tr.set(pointer.y * MOUSE_ROTATION_AMOUNT, pointer.x * MOUSE_ROTATION_AMOUNT, 0);
      tr.lerp(zeroVec, MOUSE_RETURN_SMOOTH);
      group.rotation.x += (tr.x - group.rotation.x) * MOUSE_FOLLOW_SMOOTH;
      group.rotation.y += (tr.y - group.rotation.y) * MOUSE_FOLLOW_SMOOTH;
    }
    if (frequencyDataRef.current.length) {
      const data = frequencyDataRef.current;
      const len = data.length;
      const low = len > 0 ? data[0] / 255 : 0;
      const mid = len > 8 ? data[Math.floor(len * 0.25)] / 255 : 0;
      const high = len > 0 ? data[len - 1] / 255 : 0;
      const avg = (low + mid + high) / 3;
      group.scale.setScalar(1 + avg * 0.5);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={boxGeo}>
        <meshBasicMaterial color={MESH_DARK_COLOR} />
      </mesh>
      {edgesGeo && lineMat && (
        <lineSegments geometry={edgesGeo} material={lineMat} />
      )}
    </group>
  );
}

export function MusicReactiveObject({ frequencyDataRef, onLoadError, disableMouseFollow = false }: MusicReactiveObjectProps) {
  const groupRef = useRef<Group>(null);
  const outerGroupRef = useRef<Group>(null);
  const innerGroupRef = useRef<Group>(null);
  const [loadedScene, setLoadedScene] = useState<Group | null>(null);
  const [outerScene, setOuterScene] = useState<Group | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const edgeLinesRef = useRef<LineSegments[]>([]);
  const processedSceneRef = useRef<Group | null>(null);

  const reportError = useCallback(
    (msg: string) => {
      setLoadFailed(true);
      onLoadError?.(msg);
    },
    [onLoadError]
  );

  useEffect(() => {
    let cancelled = false;
    setLoadFailed(false);
    setLoadedScene(null);
    processedSceneRef.current = null;

    const loadModel = async () => {
      try {
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
        const loader = new GLTFLoader();
        const url = MODEL_3D_PATH.startsWith("/") ? `${typeof window !== "undefined" ? window.location.origin : ""}${MODEL_3D_PATH}` : MODEL_3D_PATH;
        const gltf = await new Promise<{ scene: Group }>((resolve, reject) => {
          loader.load(url, resolve, undefined, reject);
        });
        if (cancelled) return;
        const scene = gltf.scene.clone();
        darkenMeshMaterials(scene);
        edgeLinesRef.current = addNeonEdgesToScene(scene);
        processedSceneRef.current = scene;
        setLoadedScene(scene);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "No se pudo cargar el modelo";
        reportError(message);
      }
    };

    loadModel();
    return () => {
      cancelled = true;
      edgeLinesRef.current.forEach((line) => {
        line.geometry.dispose();
        if (Array.isArray(line.material)) line.material.forEach((m) => m.dispose());
        else line.material.dispose();
      });
      processedSceneRef.current?.traverse((child) => {
        if ("material" in child && child.material) {
          const m = child.material as Material | Material[];
          (Array.isArray(m) ? m : [m]).forEach((mat) => mat.dispose());
        }
      });
    };
  }, [reportError]);

  useEffect(() => {
    let cancelled = false;
    setOuterScene(null);
    const loadOuter = async () => {
      try {
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
        const loader = new GLTFLoader();
        const url = SECOND_MODEL_PATH.startsWith("/")
          ? `${typeof window !== "undefined" ? window.location.origin : ""}${SECOND_MODEL_PATH}`
          : SECOND_MODEL_PATH;
        const gltf = await new Promise<{ scene: Group }>((resolve, reject) => {
          loader.load(url, resolve, undefined, reject);
        });
        if (cancelled) return;
        const scene = gltf.scene.clone();
        setOuterTransparent(scene, 0.45);
        setOuterScene(scene);
      } catch {
        if (!cancelled) setOuterScene(null);
      }
    };
    loadOuter();
    return () => {
      cancelled = true;
    };
  }, []);

  const targetPosRef = useRef(new Vector3(0, 0, 0));
  const originRef = useRef(new Vector3(0, 0, 0));
  const targetRotRef = useRef(new Vector3(0, 0, 0));
  const zeroVec = useRef(new Vector3(0, 0, 0)).current;

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;

    const elapsed = state.clock.elapsedTime;
    const appearProgress = Math.min(
      1,
      Math.max(0, (elapsed - SECOND_MODEL_APPEAR_AT) / SECOND_MODEL_APPEAR_DURATION)
    );
    const movementProgress = Math.min(
      1,
      Math.max(0, (elapsed - SECOND_MODEL_APPEAR_AT) / SECOND_MODEL_MOVEMENT_GROW_DURATION)
    );

    const data = frequencyDataRef.current;
    const len = data.length;
    const low = len > 0 ? data[0] / 255 : 0;
    const mid = len > 8 ? data[Math.floor(len * 0.25)] / 255 : 0;
    const high = len > 0 ? data[len - 1] / 255 : 0;
    const avg = len > 0 ? (low + mid + high) / 3 : 0;
    const musicScale = 1 + avg * 0.5;

    if (outerGroupRef.current) {
      const baseScale =
        SECOND_MODEL_INITIAL_SCALE +
        (SECOND_MODEL_SCALE - SECOND_MODEL_INITIAL_SCALE) * appearProgress;
      outerGroupRef.current.scale.setScalar(baseScale);
      const delta = state.clock.getDelta();
      const rotSpeed = 0.35;
      const musicRot = (low * 0.008 + mid * 0.004) * movementProgress;
      outerGroupRef.current.rotation.y += delta * (rotSpeed + musicRot);
    }
    if (innerGroupRef.current) {
      innerGroupRef.current.scale.setScalar(musicScale);
    }

    if (!disableMouseFollow) {
      const { pointer } = state;
      const target = targetPosRef.current;
      const origin = originRef.current;
      const rx = pointer.x * MOUSE_LATERAL_AMOUNT;
      const ry = pointer.y * MOUSE_LATERAL_AMOUNT;
      const distSq = pointer.x * pointer.x + pointer.y * pointer.y;
      const depth = (1 - Math.min(distSq, 1)) * MOUSE_DEPTH_AMOUNT;
      target.set(rx, ry, depth);
      target.lerp(origin, MOUSE_RETURN_SMOOTH);
      group.position.lerp(target, MOUSE_FOLLOW_SMOOTH);
      const tr = targetRotRef.current;
      tr.set(pointer.y * MOUSE_ROTATION_AMOUNT, pointer.x * MOUSE_ROTATION_AMOUNT, 0);
      tr.lerp(zeroVec, MOUSE_RETURN_SMOOTH);
      group.rotation.x += (tr.x - group.rotation.x) * MOUSE_FOLLOW_SMOOTH;
      group.rotation.y += (tr.y - group.rotation.y) * MOUSE_FOLLOW_SMOOTH;
    }
  });

  if (loadFailed) {
    return <FallbackMesh frequencyDataRef={frequencyDataRef} disableMouseFollow={disableMouseFollow} />;
  }

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <group ref={outerGroupRef} position={[SECOND_MODEL_OFFSET_X, SECOND_MODEL_OFFSET_Y, SECOND_MODEL_OFFSET_Z]} scale={[SECOND_MODEL_INITIAL_SCALE, SECOND_MODEL_INITIAL_SCALE, SECOND_MODEL_INITIAL_SCALE]}>
        {outerScene && <primitive object={outerScene} />}
      </group>
      <group ref={innerGroupRef} position={[0, 0, 0]} scale={[1, 1, 1]}>
        {loadedScene && (
          <primitive object={loadedScene} castShadow receiveShadow />
        )}
      </group>
    </group>
  );
}
