import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

// 3D genuine shield seal mesh
const GenuineSeal = () => {
  const group = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = t * 0.8;
      group.current.position.y = Math.sin(t * 2) * 0.1;
    }
  });

  return (
    <group ref={group}>
      {/* Outer Cylinder coin */}
      <mesh>
        <cylinderGeometry args={[1.2, 1.2, 0.15, 32]} />
        <meshStandardMaterial 
          color="#10B981" 
          roughness={0.1}
          metalness={0.8}
          emissive="#10B981"
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Decorative inner ring */}
      <mesh position={[0, 0.09, 0]}>
        <torusGeometry args={[0.9, 0.05, 12, 48]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.9} />
      </mesh>
      {/* Checkmark custom mesh (built using two cylinders) */}
      <group rotation={[Math.PI / 2, 0, 0]} position={[-0.1, 0.12, 0.05]}>
        {/* Left short leg of tick */}
        <mesh position={[-0.2, -0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.9} />
        </mesh>
        {/* Right long leg of tick */}
        <mesh position={[0.1, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.08, 0.08, 0.8, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
};

// 3D warning shield/cube for tampered status
const WarningShield = () => {
  const mesh = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mesh.current) {
      // Rapid rotate and subtle jitter/shake
      mesh.current.rotation.y = t * 1.5;
      mesh.current.rotation.x = Math.sin(t * 30) * 0.05; // Shake effect
      mesh.current.position.y = Math.sin(t * 4) * 0.08;
    }
  });

  return (
    <mesh ref={mesh}>
      <octahedronGeometry args={[1.1, 0]} />
      <meshStandardMaterial 
        color="#EF4444" 
        wireframe
        emissive="#EF4444"
        emissiveIntensity={0.6}
      />
    </mesh>
  );
};

// 3D scanner loop for idle state
const IdleScanner = () => {
  const mesh = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.5;
      mesh.current.rotation.x = t * 0.3;
      mesh.current.position.y = Math.sin(t * 1.5) * 0.15;
    }
  });

  return (
    <mesh ref={mesh}>
      <torusGeometry args={[0.9, 0.25, 16, 100]} />
      <meshStandardMaterial 
        color="#3B82F6" 
        roughness={0.1} 
        metalness={0.8}
        emissive="#3B82F6"
        emissiveIntensity={0.25}
      />
    </mesh>
  );
};

const BadgeScene = ({ status }) => {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 60 }} className="w-full h-full">
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {status === 'genuine' && <GenuineSeal />}
      {(status === 'tampered' || status === 'fake') && <WarningShield />}
      {status === 'idle' && <IdleScanner />}
    </Canvas>
  );
};

const VerificationBadge = ({ status = 'idle' }) => {
  return (
    <div className="w-full h-[220px] relative overflow-hidden flex items-center justify-center">
      <Suspense fallback={
        <div className="text-cyber-cyan animate-pulse text-sm">
          Securing Renderer...
        </div>
      }>
        <BadgeScene status={status} />
      </Suspense>
    </div>
  );
};

export default VerificationBadge;
