import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, MathUtils } from 'three';
import { EffectComposer, DepthOfField, Bloom } from '@react-three/postprocessing';

// Generates an elongated ellipsoid with a slight curve to approximate a coffee bean
const BeanGeometry = () => {
  return (
    <sphereGeometry args={[0.2, 16, 16]}>
      {/* We scale the sphere to make it elongated like a bean */}
    </sphereGeometry>
  );
};

const BeanSwarm = ({ count = 200 }) => {
  const meshRef = useRef();
  const dummy = useMemo(() => new Object3D(), []);
  
  // Generate random positions, rotations, and speeds for each bean
  const beans = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = MathUtils.randFloatSpread(20);
      const y = MathUtils.randFloatSpread(20);
      const z = MathUtils.randFloatSpread(10) - 5; // Push back slightly
      
      const rx = Math.random() * Math.PI;
      const ry = Math.random() * Math.PI;
      const rz = Math.random() * Math.PI;
      
      const speed = MathUtils.randFloat(0.001, 0.005);
      
      temp.push({ x, y, z, rx, ry, rz, speed });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Slow rotation and slight float effect
    beans.forEach((bean, i) => {
      bean.rx += bean.speed;
      bean.ry += bean.speed * 0.8;
      bean.y += Math.sin(state.clock.elapsedTime * bean.speed * 100) * 0.01;
      
      dummy.position.set(bean.x, bean.y, bean.z);
      dummy.rotation.set(bean.rx, bean.ry, bean.rz);
      dummy.scale.set(0.6, 1, 0.7); // Elongate the sphere into a bean shape
      dummy.updateMatrix();
      
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    
    // Mouse parallax effect
    const mouseX = (state.pointer.x * 2);
    const mouseY = (state.pointer.y * 2);
    
    // Smooth interpolation towards mouse position for the whole group
    meshRef.current.position.x = MathUtils.lerp(meshRef.current.position.x, mouseX * 0.5, 0.05);
    meshRef.current.position.y = MathUtils.lerp(meshRef.current.position.y, mouseY * 0.5, 0.05);
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <BeanGeometry />
      <meshStandardMaterial 
        color="#5C3D2E" 
        roughness={0.7} 
        metalness={0.1}
      />
    </instancedMesh>
  );
};

export default function CoffeeBeanScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
      {/* Dark background is handled by CSS, Canvas is transparent */}
      <ambientLight intensity={0.3} color="#f5e6cc" />
      
      {/* Warm key light */}
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#C97B3A" />
      {/* Fill light */}
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#E8C47C" />
      {/* Rim light */}
      <pointLight position={[0, -10, 5]} intensity={1} color="#C75B7A" />

      <BeanSwarm count={200} />

      <EffectComposer>
        <DepthOfField focusDistance={0.05} focalLength={0.1} bokehScale={4} height={480} />
        <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.9} height={300} opacity={0.2} />
      </EffectComposer>
    </Canvas>
  );
}
