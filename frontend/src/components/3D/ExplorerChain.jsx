import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const BlockMesh = ({ block, index, isSelected, onClick }) => {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Custom rotation speeds for each block to look organic
  const rotationSpeed = useRef({
    y: 0.005 + (index * 0.002) % 0.01,
    z: 0.002 + (index * 0.001) % 0.005
  });

  useFrame((state) => {
    if (mesh.current) {
      // Gentle spin
      mesh.current.rotation.y += rotationSpeed.current.y;
      mesh.current.rotation.z += rotationSpeed.current.z;

      // Soft vertical floating
      const t = state.clock.getElapsedTime();
      mesh.current.position.y = Math.sin(t * 1.5 + index) * 0.1;

      // Smooth hover scale transition
      const targetScale = hovered ? 1.25 : 1.0;
      mesh.current.scale.x += (targetScale - mesh.current.scale.x) * 0.15;
      mesh.current.scale.y += (targetScale - mesh.current.scale.y) * 0.15;
      mesh.current.scale.z += (targetScale - mesh.current.scale.z) * 0.15;
    }
  });

  // Color mapping: Genesis block is gold/emerald, selected is blue, standard is cyan
  const isGenesis = index === 0;
  const baseColor = isGenesis 
    ? '#F59E0B' // Gold
    : isSelected 
      ? '#3B82F6' // Electric Blue
      : '#06B6D4'; // Cyber Cyan

  return (
    <group position={[index * 2.8, 0, 0]}>
      {/* 3D Block cube */}
      <mesh
        ref={mesh}
        onClick={(e) => {
          e.stopPropagation();
          onClick(block);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[1.3, 1.3, 1.3]} />
        <meshStandardMaterial
          color={baseColor}
          wireframe={!isSelected}
          roughness={0.1}
          metalness={0.8}
          emissive={baseColor}
          emissiveIntensity={isSelected || hovered ? 0.6 : 0.25}
        />
      </mesh>

      {/* Label above block */}
      <mesh position={[0, 1.1, 0]}>
        {/* Simple visual anchor for 2D overlays */}
      </mesh>
    </group>
  );
};

// Renders the horizontal connector rod between blocks
const LinkConnector = ({ index }) => {
  const mesh = useRef();
  
  return (
    <mesh ref={mesh} position={[index * 2.8 + 1.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.07, 0.07, 1.5, 8]} />
      <meshStandardMaterial color="#1E293B" roughness={0.5} />
    </mesh>
  );
};

const ExplorerChainScene = ({ blocks, selectedBlock, onSelectBlock }) => {
  // Center camera position dynamically based on length of chain
  const centerIndex = Math.max(0, (blocks.length - 1) / 2);
  const cameraTargetX = centerIndex * 2.8;

  return (
    <Canvas
      camera={{ position: [cameraTargetX, 0, 5], fov: 65 }}
      className="w-full h-full"
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[cameraTargetX, 10, 10]} intensity={1.5} />
      <pointLight position={[cameraTargetX - 10, -5, -5]} intensity={0.5} color="#06B6D4" />

      {blocks.map((block, idx) => (
        <React.Fragment key={block._id || block.index}>
          <BlockMesh
            block={block}
            index={idx}
            isSelected={selectedBlock?.index === block.index}
            onClick={onSelectBlock}
          />
          {idx < blocks.length - 1 && <LinkConnector index={idx} />}
        </React.Fragment>
      ))}

      <OrbitControls 
        enableZoom={true} 
        enablePan={true} 
        maxDistance={15}
        minDistance={2.5}
        target={[cameraTargetX, 0, 0]}
      />
    </Canvas>
  );
};

const ExplorerChain = ({ blocks, selectedBlock, onSelectBlock }) => {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="w-full h-[280px] bg-cyber-panel border border-cyber-border rounded-xl flex items-center justify-center text-gray-400">
        No blocks loaded.
      </div>
    );
  }

  return (
    <div className="w-full h-[280px] md:h-[350px] relative glass-panel overflow-hidden border border-cyber-border">
      {/* 3D Interaction Tip Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-60 border border-cyber-border text-xs px-3 py-1.5 rounded-lg text-cyber-muted pointer-events-none">
        💡 Drag to rotate/pan | Scroll to zoom | Click block to inspect
      </div>

      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center text-cyber-cyan animate-pulse">
          Loading 3D Blockchain Ledger...
        </div>
      }>
        <ExplorerChainScene
          blocks={blocks}
          selectedBlock={selectedBlock}
          onSelectBlock={onSelectBlock}
        />
      </Suspense>
    </div>
  );
};

export default ExplorerChain;
