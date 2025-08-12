import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import styled from 'styled-components';

const CanvasContainer = styled.div`
  width: 100%;
  height: 100%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: ${props => props.theme.text};
  font-size: 1rem;
`;

function Planet() {
  const planetRef = useRef();
  const { scene } = useGLTF('/planet/scene.gltf');
  
  // Auto-rotate the planet
  useFrame((state, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <primitive 
      ref={planetRef}
      object={scene} 
      scale={[1.5, 1.5, 1.5]} 
      position={[0, 0, 0]}
    />
  );
}

const PlanetModel = ({ theme }) => {
  return (
    <CanvasContainer>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <Planet />
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI}
            minPolarAngle={0}
          />
        </Suspense>
      </Canvas>
    </CanvasContainer>
  );
};

// Preload the model
useGLTF.preload('/planet/scene.gltf');

export default PlanetModel;
