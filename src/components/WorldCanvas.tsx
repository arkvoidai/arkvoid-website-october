'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { inputState } from '../engine/input';
import type { InhabitantId } from '../engine/runtime';

type Person = { id: InhabitantId; name: string; role: string; color: string; position: [number, number, number] };
const PEOPLE: Person[] = [
  { id: 'lian', name: 'Lian Chen', role: 'Outer disciple', color: '#8b3c31', position: [-2.8, 0, 0.2] },
  { id: 'wen', name: 'Elder Wen', role: 'Archive keeper', color: '#95804e', position: [2.9, 0, -1.1] },
  { id: 'kai', name: 'Kai Ren', role: 'Herbalist', color: '#537b78', position: [0.7, 0, 3.1] },
];

function Environment() {
  const hills = useMemo(() => Array.from({ length: 33 }, (_, i) => ({
    x: (i % 11 - 5) * 13 + Math.sin(i * 3.1) * 3,
    z: -17 - Math.floor(i / 11) * 19,
    h: 10 + (i % 5) * 3.5,
    r: 5.5 + (i % 4),
    shade: ['#34443a', '#3b4d40', '#59624e', '#4b594b'][i % 4],
  })), []);
  const trees = useMemo(() => Array.from({ length: 92 }, (_, i) => ({
    x: (Math.sin(i * 91.7) * 0.5 + 0.5) * 58 - 29,
    z: (Math.cos(i * 43.3) * 0.5 + 0.5) * 63 - 33,
    s: 0.65 + ((i * 17) % 9) / 10,
    hue: i % 4,
  })).filter(t => Math.abs(t.x) > 6 || t.z < -5), []);
  return <>
    <color attach="background" args={['#9eaaa4']} />
    <fog attach="fog" args={['#9eaaa4', 21, 83]} />
    <ambientLight intensity={1.05} />
    <hemisphereLight args={['#dce3d9', '#343b2e', 1.35]} />
    <directionalLight position={[-12, 20, 9]} intensity={2.1} color="#f2d8a7" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
      <planeGeometry args={[180, 180, 1, 1]} />
      <meshStandardMaterial color="#465142" roughness={1} />
    </mesh>
    {hills.map((h, i) => <mesh key={i} position={[h.x, h.h / 2 - 0.1, h.z]} scale={[h.r, h.h, h.r * 0.9]} castShadow receiveShadow>
      <coneGeometry args={[1, 1.7, 6]} />
      <meshStandardMaterial color={h.shade} roughness={1} />
    </mesh>)}
    {trees.map((t, i) => <group key={i} position={[t.x, 0, t.z]} scale={t.s}>
      <mesh position={[0, 1.2, 0]} castShadow><cylinderGeometry args={[0.12, 0.22, 2.4, 5]} /><meshStandardMaterial color="#554735" roughness={1} /></mesh>
      {[0, 1, 2].map(n => <mesh key={n} position={[0, 2.1 + n * 0.65, 0]} scale={[1.1 - n * 0.18, 1.1 - n * 0.1, 1.1 - n * 0.18]} castShadow>
        <coneGeometry args={[0.86, 1.9, 6]} />
        <meshStandardMaterial color={t.hue % 2 ? '#294135' : '#344b3b'} roughness={1} />
      </mesh>)}
    </group>)}
    <group position={[0, 0, -6]}>
      {[[-5, 0, 0], [0, 0, -0.7], [5, 0, 0]].map(([x, y, z], i) => <group key={i} position={[x, y, z]}>
        <mesh position={[0, 1.35, 0]} castShadow><boxGeometry args={[3.4, 2.7, 2.1]} /><meshStandardMaterial color="#786b57" roughness={0.95} /></mesh>
        <mesh position={[0, 2.95, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[2.8, 1.25, 4]} /><meshStandardMaterial color={i === 1 ? '#753b30' : '#354a40'} roughness={0.88} /></mesh>
        <mesh position={[0, 1.7, 1.08]}><boxGeometry args={[0.48, 0.9, 0.08]} /><meshStandardMaterial color="#292a24" /></mesh>
      </group>)}
      <mesh position={[0, 0.1, 3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[18, 18]} /><meshStandardMaterial color="#938a76" roughness={1} /></mesh>
      {Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[-7 + i * 2, 0.13, 4.7]} rotation={[-Math.PI / 2, 0, 0]}><boxGeometry args={[1.5, 0.4, 0.12]} /><meshStandardMaterial color="#686252" roughness={1} /></mesh>)}
    </group>
    {Array.from({ length: 18 }, (_, i) => <mesh key={i} position={[(i % 9 - 4) * 4.1, 0.22, Math.floor(i / 9) * 7 + 5]} scale={[1 + i % 3 * .2, .35, .8]} rotation={[0, i * 0.3, 0]} castShadow><dodecahedronGeometry args={[0.8, 0]} /><meshStandardMaterial color={i % 2 ? '#6a6955' : '#827966'} roughness={1} /></mesh>)}
    <group position={[0, 0, -2]}>
      <mesh position={[0, 1.3, 0]}><cylinderGeometry args={[0.11, 0.11, 2.6, 6]} /><meshStandardMaterial color="#4f3c2b" /></mesh>
      <mesh position={[0, 2.65, 0]}><octahedronGeometry args={[0.48, 0]} /><meshStandardMaterial color="#c6b583" emissive="#846b37" emissiveIntensity={0.38} metalness={0.25} roughness={0.4} /></mesh>
      <pointLight position={[0, 2.7, 0]} color="#e8d2a0" intensity={0.7} distance={8} />
    </group>
  </>;
}

function Inhabitant({ person, selected, onSelect }: { person: Person; selected: boolean; onSelect: (id: InhabitantId) => void }) {
  const group = useRef<THREE.Group>(null);
  const robe = useMemo(() => new THREE.MeshStandardMaterial({ color: person.color, roughness: 0.88 }), [person.color]);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.position.y = Math.sin(clock.elapsedTime * 1.1 + person.position[0]) * 0.025;
    group.current.rotation.y = Math.sin(clock.elapsedTime * 0.43 + person.position[2]) * 0.12;
  });
  return <group ref={group} position={person.position} onClick={(e) => { e.stopPropagation(); onSelect(person.id); }}>
    <mesh position={[0, 0.92, 0]} castShadow material={robe}><capsuleGeometry args={[0.28, 0.82, 4, 8]} /></mesh>
    <mesh position={[0, 1.66, 0]} castShadow><sphereGeometry args={[0.24, 16, 12]} /><meshStandardMaterial color="#c8ad8e" roughness={0.85} /></mesh>
    <mesh position={[0, 1.77, -0.03]} castShadow><sphereGeometry args={[0.26, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} /><meshStandardMaterial color="#28251f" roughness={0.95} /></mesh>
    <mesh position={[0, 0.45, 0]}><cylinderGeometry args={[0.42, 0.38, 0.12, 10]} /><meshStandardMaterial color="#39372e" /></mesh>
    {selected && <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.44, 0.51, 32]} /><meshBasicMaterial color="#e0ca91" side={THREE.DoubleSide} /></mesh>}
  </group>;
}

function Walker({ selected, onSelect, onDiscover }: { selected: InhabitantId; onSelect: (id: InhabitantId) => void; onDiscover: (name: string) => void }) {
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(0, 0, 7));
  const yaw = useRef(0);
  const body = useRef<THREE.Group>(null);
  const look = useRef({ x: 0, y: 0 });
  const drag = useRef(false);
  const lastDiscovery = useRef('');
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift','e'].includes(k)) e.preventDefault();
    inputState.held.add(k);
  }, []);
  const onKeyUp = useCallback((e: KeyboardEvent) => inputState.held.delete(e.key.toLowerCase()), []);
  useEffect(() => {
    const canvas = document.querySelector('.world-canvas canvas');
    if (!canvas) return;
    canvas.addEventListener('keydown', onKeyDown as EventListener);
    canvas.addEventListener('keyup', onKeyUp as EventListener);
    canvas.setAttribute('tabindex', '0');
    canvas.setAttribute('aria-label', 'Arkvoid 3D world. Use WASD or arrow keys to move and E to interact.');
    return () => { canvas.removeEventListener('keydown', onKeyDown as EventListener); canvas.removeEventListener('keyup', onKeyUp as EventListener); };
  }, [onKeyDown, onKeyUp]);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05), keys = inputState.held;
    const forward = Number(keys.has('w') || keys.has('arrowup') || keys.has('forward')) - Number(keys.has('s') || keys.has('arrowdown') || keys.has('back'));
    const side = Number(keys.has('d') || keys.has('arrowright') || keys.has('right')) - Number(keys.has('a') || keys.has('arrowleft') || keys.has('left'));
    const speed = keys.has('shift') || keys.has('run') ? 6 : 3.2;
    yaw.current += (side * 0.15) * dt;
    const dx = Math.sin(yaw.current) * -forward + Math.cos(yaw.current) * side;
    const dz = Math.cos(yaw.current) * -forward - Math.sin(yaw.current) * side;
    const norm = Math.hypot(dx, dz) || 1;
    pos.current.x = THREE.MathUtils.clamp(pos.current.x + dx / norm * speed * dt, -20, 20);
    pos.current.z = THREE.MathUtils.clamp(pos.current.z + dz / norm * speed * dt, -15, 17);
    if (body.current) { body.current.position.set(pos.current.x, 0, pos.current.z); body.current.rotation.y = yaw.current; }
    camera.position.lerp(new THREE.Vector3(pos.current.x + Math.sin(yaw.current) * 7, 4.3, pos.current.z + Math.cos(yaw.current) * 7), 1 - Math.exp(-4 * dt));
    camera.lookAt(pos.current.x, 1.1, pos.current.z - 2.1);
    if (inputState.interact || keys.has('e')) { inputState.interact = false; keys.delete('e'); const p = PEOPLE.find(person => Math.hypot(pos.current.x - person.position[0], pos.current.z - person.position[2]) < 4.2); if (p) onSelect(p.id); }
    if (Math.abs(pos.current.x) < 2.5 && pos.current.z < -0.5 && pos.current.z > -5 && lastDiscovery.current !== 'spirit-beacon') { lastDiscovery.current = 'spirit-beacon'; onDiscover('Spirit beacon'); }
  });
  return <group ref={body}>
    <mesh position={[0, 0.93, 0]} castShadow><capsuleGeometry args={[0.3, 0.84, 4, 10]} /><meshStandardMaterial color="#d1c6ad" roughness={0.72} /></mesh>
    <mesh position={[0, 1.66, 0]} castShadow><sphereGeometry args={[0.24, 16, 12]} /><meshStandardMaterial color="#c8ad8e" roughness={0.85} /></mesh>
    <mesh position={[0, 1.77, -0.03]}><sphereGeometry args={[0.26, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} /><meshStandardMaterial color="#28251f" roughness={0.95} /></mesh>
  </group>;
}

function SceneContent(props: { selected: InhabitantId; onSelect: (id: InhabitantId) => void; onDiscover: (name: string) => void }) {
  return <>
    <Environment />
    {PEOPLE.map(person => <Inhabitant key={person.id} person={person} selected={props.selected === person.id} onSelect={props.onSelect} />)}
    <Walker {...props} />
  </>;
}

export default function WorldCanvas({ selected, onSelect, onDiscover }: { selected: InhabitantId; onSelect: (id: InhabitantId) => void; onDiscover: (name: string) => void }) {
  return <div className="world-canvas"><Canvas shadows dpr={[1, 1.7]} camera={{ position: [0, 4.3, 14], fov: 52 }} gl={{ antialias: true, powerPreference: 'high-performance' }}><SceneContent selected={selected} onSelect={onSelect} onDiscover={onDiscover} /></Canvas></div>;
}
