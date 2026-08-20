import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

// Interactive floating block component
const BlockchainBlock = ({ position, color, speed }) => {
  const mesh = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mesh.current) {
      // Floating animation
      mesh.current.position.y = position[1] + Math.sin(t * speed + position[0]) * 0.15;
      // Slow rotation
      mesh.current.rotation.x += 0.005;
      mesh.current.rotation.y += 0.008;
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={color} 
        wireframe
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
};

const ConnectionLine = ({ posA, posB }) => {
  const points = [posA, posB];
  return (
    <line>
      <bufferGeometry attach="geometry">
        <bufferAttribute 
          attach="attributes-position" 
          args={[new Float32Array(points.flat()), 3]} 
        />
      </bufferGeometry>
      <lineBasicMaterial attach="material" color="#1E293B" />
    </line>
  );
};

const ThreeScene = () => {
  // Define positions of connected blocks
  const blocks = [
    { pos: [-2, 0.5, 0], color: '#3B82F6', speed: 1.0 }, // Blue
    { pos: [0, 0, 0], color: '#06B6D4', speed: 1.2 },    // Cyan (center)
    { pos: [2, -0.5, 0], color: '#10B981', speed: 0.8 },  // Green
  ];

  return (
    <Canvas camera={{ position: [0, 0, 4.5], fov: 60 }} className="w-full h-full">
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06B6D4" />
      
      <Stars radius={100} depth={50} count={300} factor={4} saturation={0} fade speed={1} />
      
      {/* Draw block connections */}
      <ConnectionLine posA={blocks[0].pos} posB={blocks[1].pos} />
      <ConnectionLine posA={blocks[1].pos} posB={blocks[2].pos} />

      {/* Render 3D Blocks */}
      {blocks.map((b, idx) => (
        <BlockchainBlock key={idx} position={b.pos} color={b.color} speed={b.speed} />
      ))}

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
};

const HeroBlockchain = () => {
  return (
    <div className="w-full h-[320px] md:h-[420px] relative">
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Static premium fallback vector illustration if WebGL is loading */}
          <div className="flex space-x-6 items-center animate-pulse">
            <div className="w-16 h-16 border-2 border-dashed border-cyber-cyan border-opacity-40 rounded-lg transform rotate-45 flex items-center justify-center text-cyber-cyan text-xs">Block 0</div>
            <div className="h-0.5 w-12 bg-cyber-border"></div>
            <div className="w-20 h-20 border-2 border-cyber-cyan rounded-lg transform rotate-45 flex items-center justify-center text-cyber-cyan text-xs shadow-glow-cyan">Block 1</div>
            <div className="h-0.5 w-12 bg-cyber-border"></div>
            <div className="w-16 h-16 border-2 border-dashed border-cyber-green border-opacity-40 rounded-lg transform rotate-45 flex items-center justify-center text-cyber-green text-xs">Block 2</div>
          </div>
        </div>
      }>
        <ThreeScene />
      </Suspense>
    </div>
  );
};

export default HeroBlockchain;
