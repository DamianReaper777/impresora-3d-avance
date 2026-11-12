import { useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Grid
} from "@react-three/drei";

import { STLLoader } from "three/addons/loaders/STLLoader.js";
import * as THREE from "three";

import "./ModelViewer.css";

function STLModel({ geometry }) {
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#7895b2"
        metalness={0.1}
        roughness={0.65}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function CameraController({ geometry, resetKey }) {
  const { camera, controls, size, invalidate } = useThree();

  useEffect(() => {
    if (!geometry) return;

    geometry.computeBoundingBox();

    const bounds = geometry.boundingBox;
    const dimensions = new THREE.Vector3();
    const center = new THREE.Vector3();

    bounds.getSize(dimensions);
    bounds.getCenter(center);

    const maxDimension = Math.max(
      dimensions.x,
      dimensions.y,
      dimensions.z,
      1
    );

    // Calculamos la distancia según el campo de visión.
    const verticalFov = THREE.MathUtils.degToRad(camera.fov);
    const horizontalFov = 2 * Math.atan(
      Math.tan(verticalFov / 2) * (size.width / size.height)
    );

    const limitingFov = Math.min(verticalFov, horizontalFov);

    const distance =
      (maxDimension / 2) / Math.tan(limitingFov / 2);

    // La cámara mira hacia el centro del modelo.
    const direction = new THREE.Vector3(1, 0.65, 1).normalize();

    camera.position.copy(
      center.clone().add(
        direction.multiplyScalar(distance * 1.5)
      )
    );

    camera.near = Math.max(0.01, distance / 1000);
    camera.far = Math.max(1000, distance * 100);
    camera.updateProjectionMatrix();

    if (controls) {
      controls.target.copy(center);
      controls.update();
    }

    invalidate();
  }, [geometry, resetKey, camera, controls, size, invalidate]);

  return null;
}

function ModelViewer({ file }) {
  const [buffer, setBuffer] = useState(null);
  const [error, setError] = useState("");
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (!file) {
      setBuffer(null);
      setError("");
      return;
    }

    let active = true;

    async function readFile() {
      try {
        const data = await file.arrayBuffer();

        const testGeometry = new STLLoader().parse(data);

        if (!testGeometry.attributes.position?.count) {
          throw new Error("Geometría vacía");
        }

        testGeometry.dispose();

        if (active) {
          setBuffer(data);
          setError("");
          setResetKey(0);
        }
      } catch {
        if (active) {
          setBuffer(null);
          setError("No se pudo interpretar el archivo STL.");
        }
      }
    }

    readFile();

    return () => {
      active = false;
    };
  }, [file]);

  const geometry = useMemo(() => {
    if (!buffer) return null;

    const parsed = new STLLoader().parse(buffer);

    parsed.computeBoundingBox();

    const bounds = parsed.boundingBox;
    const center = new THREE.Vector3();

    bounds.getCenter(center);

    parsed.translate(
      -center.x,
      -center.y,
      -bounds.min.z
    );

    // Three.js utiliza Y como eje vertical.
    parsed.rotateX(-Math.PI / 2);

    parsed.computeVertexNormals();
    parsed.computeBoundingBox();

    return parsed;
  }, [buffer]);

  useEffect(() => {
    return () => {
      geometry?.dispose();
    };
  }, [geometry]);

  return (
    <section className="model-viewer">
      <div className="model-viewer__header">
        <h2 className="model-viewer__title">
          Vista previa 3D
        </h2>

        {geometry && (
          <button
            type="button"
            className="model-viewer__reset"
            onClick={() => setResetKey((value) => value + 1)}
          >
            Restablecer vista
          </button>
        )}
      </div>

      <div className="model-viewer__canvas">
        {geometry ? (
          <Canvas
            camera={{
              position: [100, 100, 100],
              fov: 45
            }}
          >
            <color
              attach="background"
              args={["#f1f5f9"]}
            />

            <ambientLight intensity={1.5} />

            <directionalLight
              position={[5, 10, 10]}
              intensity={2}
            />

            <STLModel geometry={geometry} />

            <Grid
                position={[0, -0.1, 0]}
                args={[200, 200]}
                cellSize={10}
                sectionSize={50}
                cellColor="#cbd5e1"
                sectionColor="#94a3b8"
                fadeDistance={300}
                fadeStrength={1}
            />

            <OrbitControls makeDefault />

            <CameraController
              geometry={geometry}
              resetKey={resetKey}
            />
          </Canvas>
        ) : (
          <div className="model-viewer__placeholder">
            {error || "Selecciona un modelo para visualizarlo"}
          </div>
        )}
      </div>

      {file && !error && geometry && (
        <p className="model-viewer__filename">
          {file.name}
        </p>
      )}
    </section>
  );
}

export default ModelViewer;