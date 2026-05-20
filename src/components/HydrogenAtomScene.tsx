import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function HydrogenAtomScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [webglAvailable, setWebglAvailable] = useState(true);

  useEffect(() => {
    const mount = mountRef.current;
    const canvas = canvasRef.current;
    if (!mount || !canvas) return undefined;

    if (!canUseWebGL()) {
      setWebglAvailable(false);
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x071a32, 0.06);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.18, 5.4);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const atom = new THREE.Group();
    atom.rotation.set(-0.18, 0.52, -0.04);
    scene.add(atom);

    const ambient = new THREE.AmbientLight(0xbcd8ff, 0.74);
    const key = new THREE.DirectionalLight(0xffffff, 2.3);
    key.position.set(3, 4, 4);
    const rim = new THREE.PointLight(0xffd3de, 7, 8);
    rim.position.set(-2.8, 1.8, 2.4);
    scene.add(ambient, key, rim);

    const nucleusMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x8b1e3f,
      metalness: 0.12,
      roughness: 0.18,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      emissive: 0x2d0613,
      emissiveIntensity: 0.2
    });
    const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.32, 72, 72), nucleusMaterial);
    const nucleusGlow = glowSphere(0.58, 0x8b1e3f, 0.16);
    atom.add(nucleusGlow, nucleus);

    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xbdd7f3, transparent: true, opacity: 0.55 });
    const orbit = new THREE.LineLoop(orbitGeometry(1.72, 0.78), orbitMaterial);
    orbit.rotation.x = 0.76;
    atom.add(orbit);

    const secondaryOrbit = new THREE.LineLoop(orbitGeometry(1.44, 0.62), new THREE.LineBasicMaterial({ color: 0xffced8, transparent: true, opacity: 0.22 }));
    secondaryOrbit.rotation.x = -0.64;
    secondaryOrbit.rotation.z = 0.36;
    atom.add(secondaryOrbit);

    const electron = new THREE.Group();
    electron.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 28, 28),
        new THREE.MeshBasicMaterial({ color: 0xdaf3ff })
      ),
      glowSphere(0.22, 0x8ed7ff, 0.22)
    );
    atom.add(electron);

    const field = particleField();
    scene.add(field);

    const pointer = { current: 0, target: 0 };
    const excite = () => {
      pointer.target = 1;
    };
    const relax = () => {
      pointer.target = 0;
    };
    mount.addEventListener("pointerenter", excite);
    mount.addEventListener("pointerleave", relax);
    mount.addEventListener("pointerdown", excite);
    mount.addEventListener("pointerup", relax);

    let frame = 0;
    const clock = new THREE.Clock();

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const animate = () => {
      const t = clock.getElapsedTime();
      pointer.current += (pointer.target - pointer.current) * 0.045;
      const speed = 0.68 + pointer.current * 0.92;
      const theta = t * speed;
      const radiusX = 1.72 + pointer.current * 0.08;
      const radiusY = 0.78 + pointer.current * 0.04;

      atom.rotation.y = 0.52 + t * 0.18;
      atom.rotation.x = -0.18 + Math.sin(t * 0.42) * 0.07;
      orbit.rotation.z = Math.sin(t * 0.22) * 0.08;
      secondaryOrbit.rotation.z = 0.36 - Math.sin(t * 0.28) * 0.12;
      field.rotation.y = t * 0.018;

      electron.position.set(Math.cos(theta) * radiusX, Math.sin(theta) * radiusY, Math.sin(theta) * 0.34);
      electron.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.76);
      electron.scale.setScalar(1 + Math.sin(t * 3.2) * 0.08 + pointer.current * 0.12);

      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      mount.removeEventListener("pointerenter", excite);
      mount.removeEventListener("pointerleave", relax);
      mount.removeEventListener("pointerdown", excite);
      mount.removeEventListener("pointerup", relax);
      resizeObserver.disconnect();
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineLoop || object instanceof THREE.Points) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material.dispose();
        }
      });
    };
  }, []);

  return (
    <div className="hydrogen-scene" ref={mountRef} aria-label="Dreidimensionale didaktische Visualisierung eines Wasserstoffatoms">
      {webglAvailable ? <canvas className="hydrogen-canvas" ref={canvasRef} aria-hidden="true" /> : <HydrogenFallback />}
      <span className="scene-note">Didaktische Visualisierung, nicht maßstabsgetreu.</span>
    </div>
  );
}

function canUseWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

function HydrogenFallback() {
  return (
    <div className="hydrogen-fallback">
      <span className="fallback-nucleus" />
      <span className="fallback-orbit" />
      <span className="fallback-electron" />
    </div>
  );
}

function orbitGeometry(radiusX: number, radiusY: number) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < 240; i += 1) {
    const angle = (i / 240) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, 0));
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}

function glowSphere(radius: number, color: number, opacity: number) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 48, 48),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false })
  );
}

function particleField() {
  const count = 180;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const r = 2.2 + (i % 17) * 0.075;
    const theta = i * 2.399963;
    const phi = ((i % 23) / 23) * Math.PI;
    positions[i * 3] = Math.cos(theta) * Math.sin(phi) * r;
    positions[i * 3 + 1] = Math.cos(phi) * r * 0.65;
    positions[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * r;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xbdd7f3, size: 0.012, transparent: true, opacity: 0.38 });
  return new THREE.Points(geometry, material);
}
