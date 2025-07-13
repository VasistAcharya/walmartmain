import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';

// Character component that can switch between procedural and GLTF models with animations
export default function Character({ 
  position, 
  rotation, 
  scale = [1, 1, 1], 
  modelPath = null, 
  isMoving = false 
}) {
  const groupRef = useRef();
  
  // Conditionally load GLTF model - this approach handles errors gracefully
  let gltf = null;
  let animations = [];
  
  if (modelPath) {
    try {
      gltf = useGLTF(modelPath);
      animations = gltf.animations || [];
      console.log('GLTF model loaded successfully:', modelPath);
      console.log('Available animations:', animations.map(a => a.name));
    } catch (error) {
      console.warn('Failed to load GLTF model, using procedural character:', error);
      gltf = null;
      animations = [];
    }
  }

  // Set up animations if GLTF model has them
  const { actions, mixer } = useAnimations(animations, groupRef);

  // Handle animation switching based on movement
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;

    const actionNames = Object.keys(actions);
    console.log('Setting up animations for movement state:', isMoving);

    // Try to find common animation names (case-insensitive)
    const walkAnimation = actionNames.find(name => 
      /walk|run|jog|running|walking/i.test(name)
    );
    
    const idleAnimation = actionNames.find(name => 
      /idle|stand|breathing|rest|still/i.test(name)
    );

    // Stop all current animations with smooth transition
    Object.values(actions).forEach(action => {
      action.fadeOut(0.2);
    });

    // Play appropriate animation with smooth transition
    if (isMoving && walkAnimation) {
      console.log('Playing walk animation:', walkAnimation);
      actions[walkAnimation].reset().fadeIn(0.2).play();
    } else if (!isMoving && idleAnimation) {
      console.log('Playing idle animation:', idleAnimation);
      actions[idleAnimation].reset().fadeIn(0.2).play();
    } else if (actionNames.length > 0) {
      // Fallback to first available animation
      const fallbackAnim = actionNames[0];
      console.log('Playing fallback animation:', fallbackAnim);
      actions[fallbackAnim].reset().fadeIn(0.2).play();
    }
  }, [actions, isMoving]);

  // Update animation mixer
  useFrame((state, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
  });

  // Render GLTF model if available and loaded successfully
  if (gltf && gltf.scene) {
    console.log('Rendering GLTF character at position:', position, 'rotation:', rotation, 'scale:', scale);
    
    // Make sure the character is above ground and visible
    const adjustedPosition = [position[0], position[1] + 1, position[2]]; // Lift character up
    
    return (
      <group ref={groupRef} position={adjustedPosition} rotation={rotation} scale={scale}>
        <primitive object={gltf.scene.clone()} />
        {/* Debug helper - shows character position */}
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshBasicMaterial color="red" transparent opacity={0.8} />
        </mesh>
        {/* Additional debug - show character bounds */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 4, 2]} />
          <meshBasicMaterial color="yellow" transparent opacity={0.2} wireframe />
        </mesh>
      </group>
    );
  }

  // Fallback to procedural character (matching Blender reference design)
  const characterScale = 2.0; // Better scale for visibility
  const time = Date.now() * 0.005; // For smooth animations
  
  return (
    <group position={position} rotation={rotation} scale={[characterScale, characterScale, characterScale]}>
      {/* Walking animation: bob the entire character up and down when moving */}
      <group position={[0, isMoving ? Math.sin(time * 4) * 0.03 : 0, 0]}>
        
        {/* Body (torso) - casual shirt base with better proportions */}
        <Cylinder args={[0.26, 0.30, 0.85, 32]} position={[0, 1.22, 0]}>
          <meshStandardMaterial 
            color="#F0F8FF" 
            roughness={0.8}
            metalness={0.05}
          />
        </Cylinder>
        
        {/* Modern plaid pattern - more realistic grid */}
        {/* Horizontal stripes - darker blue */}
        <Box args={[0.52, 0.06, 0.02]} position={[0, 1.48, 0.30]}>
          <meshStandardMaterial color="#1E3A8A" roughness={0.9} />
        </Box>
        <Box args={[0.52, 0.06, 0.02]} position={[0, 1.32, 0.30]}>
          <meshStandardMaterial color="#1E3A8A" roughness={0.9} />
        </Box>
        <Box args={[0.52, 0.06, 0.02]} position={[0, 1.16, 0.30]}>
          <meshStandardMaterial color="#1E3A8A" roughness={0.9} />
        </Box>
        <Box args={[0.52, 0.06, 0.02]} position={[0, 1.00, 0.30]}>
          <meshStandardMaterial color="#1E3A8A" roughness={0.9} />
        </Box>
        
        {/* Vertical stripes - red accent */}
        <Box args={[0.06, 0.65, 0.015]} position={[-0.16, 1.24, 0.305]}>
          <meshStandardMaterial color="#DC2626" roughness={0.9} />
        </Box>
        <Box args={[0.06, 0.65, 0.015]} position={[-0.05, 1.24, 0.305]}>
          <meshStandardMaterial color="#DC2626" roughness={0.9} />
        </Box>
        <Box args={[0.06, 0.65, 0.015]} position={[0.05, 1.24, 0.305]}>
          <meshStandardMaterial color="#DC2626" roughness={0.9} />
        </Box>
        <Box args={[0.06, 0.65, 0.015]} position={[0.16, 1.24, 0.305]}>
          <meshStandardMaterial color="#DC2626" roughness={0.9} />
        </Box>
        
        {/* Shirt collar - more realistic */}
        <Box args={[0.32, 0.12, 0.025]} position={[0, 1.62, 0.305]}>
          <meshStandardMaterial color="#E5E7EB" roughness={0.7} />
        </Box>
        
        {/* Shirt buttons - smaller, more realistic */}
        <Sphere args={[0.015, 12, 12]} position={[0, 1.52, 0.32]}>
          <meshStandardMaterial color="#F3F4F6" metalness={0.1} />
        </Sphere>
        <Sphere args={[0.015, 12, 12]} position={[0, 1.40, 0.32]}>
          <meshStandardMaterial color="#F3F4F6" metalness={0.1} />
        </Sphere>
        <Sphere args={[0.015, 12, 12]} position={[0, 1.28, 0.32]}>
          <meshStandardMaterial color="#F3F4F6" metalness={0.1} />
        </Sphere>
        <Sphere args={[0.015, 12, 12]} position={[0, 1.16, 0.32]}>
          <meshStandardMaterial color="#F3F4F6" metalness={0.1} />
        </Sphere>
        
        {/* Head - better proportions matching reference */}
        <Sphere args={[0.24, 32, 32]} position={[0, 1.95, 0]}>
          <meshStandardMaterial color="#FDBCB4" roughness={0.9} />
        </Sphere>
        
        {/* Improved face features - more detailed */}
        <Box args={[0.16, 0.10, 0.015]} position={[0, 1.94, 0.235]}>
          <meshStandardMaterial color="#FDBCB4" roughness={0.8} />
        </Box>
        
        {/* Better eyes - more realistic */}
        <Sphere args={[0.035, 16, 16]} position={[-0.06, 1.97, 0.225]}>
          <meshStandardMaterial color="#ffffff" />
        </Sphere>
        <Sphere args={[0.035, 16, 16]} position={[0.06, 1.97, 0.225]}>
          <meshStandardMaterial color="#ffffff" />
        </Sphere>
        {/* Pupils - brown eyes */}
        <Sphere args={[0.018, 12, 12]} position={[-0.06, 1.97, 0.24]}>
          <meshStandardMaterial color="#8B4513" />
        </Sphere>
        <Sphere args={[0.018, 12, 12]} position={[0.06, 1.97, 0.24]}>
          <meshStandardMaterial color="#8B4513" />
        </Sphere>
        {/* Eye highlights */}
        <Sphere args={[0.008, 8, 8]} position={[-0.055, 1.975, 0.245]}>
          <meshStandardMaterial color="#ffffff" />
        </Sphere>
        <Sphere args={[0.008, 8, 8]} position={[0.065, 1.975, 0.245]}>
          <meshStandardMaterial color="#ffffff" />
        </Sphere>
        
        {/* Eyebrows - thicker, more natural */}
        <Box args={[0.055, 0.025, 0.01]} position={[-0.06, 2.025, 0.235]}>
          <meshStandardMaterial color="#654321" />
        </Box>
        <Box args={[0.055, 0.025, 0.01]} position={[0.06, 2.025, 0.235]}>
          <meshStandardMaterial color="#654321" />
        </Box>
        
        {/* Nose - more defined and realistic */}
        <Box args={[0.02, 0.045, 0.02]} position={[0, 1.92, 0.25]}>
          <meshStandardMaterial color="#FDBCB4" />
        </Box>
        <Sphere args={[0.008, 8, 8]} position={[-0.008, 1.91, 0.255]}>
          <meshStandardMaterial color="#FDBCB4" />
        </Sphere>
        <Sphere args={[0.008, 8, 8]} position={[0.008, 1.91, 0.255]}>
          <meshStandardMaterial color="#FDBCB4" />
        </Sphere>
        
        {/* Mouth - more natural */}
        <Box args={[0.06, 0.015, 0.008]} position={[0, 1.86, 0.24]}>
          <meshStandardMaterial color="#B85450" />
        </Box>
        
        {/* Beard - more realistic, trimmed style */}
        <Sphere args={[0.16, 20, 20]} position={[0, 1.80, 0.10]}>
          <meshStandardMaterial color="#654321" roughness={0.95} />
        </Sphere>
        {/* Beard sides - better integration */}
        <Sphere args={[0.10, 16, 16]} position={[-0.11, 1.83, 0.16]}>
          <meshStandardMaterial color="#654321" roughness={0.95} />
        </Sphere>
        <Sphere args={[0.10, 16, 16]} position={[0.11, 1.83, 0.16]}>
          <meshStandardMaterial color="#654321" roughness={0.95} />
        </Sphere>
        {/* Mustache - more refined */}
        <Box args={[0.10, 0.035, 0.025]} position={[0, 1.88, 0.235]}>
          <meshStandardMaterial color="#654321" roughness={0.95} />
        </Box>
        
        {/* Hair - modern style, matching reference */}
        <Sphere args={[0.25, 24, 24]} position={[0, 2.02, -0.015]}>
          <meshStandardMaterial color="#654321" roughness={0.85} />
        </Sphere>
        {/* Hair sides - more natural */}
        <Sphere args={[0.14, 16, 16]} position={[-0.16, 2.0, 0.02]}>
          <meshStandardMaterial color="#654321" roughness={0.85} />
        </Sphere>
        <Sphere args={[0.14, 16, 16]} position={[0.16, 2.0, 0.02]}>
          <meshStandardMaterial color="#654321" roughness={0.85} />
        </Sphere>
        {/* Hair top - additional volume */}
        <Sphere args={[0.20, 16, 16]} position={[0, 2.12, -0.05]}>
          <meshStandardMaterial color="#654321" roughness={0.85} />
        </Sphere>
        
        {/* Back design - modern casual shirt back */}
        <Box args={[0.38, 0.65, 0.025]} position={[0, 1.22, -0.315]}>
          <meshStandardMaterial color="#F8FAFC" roughness={0.8} />
        </Box>
        {/* Back plaid pattern - subtle */}
        <Box args={[0.36, 0.05, 0.01]} position={[0, 1.40, -0.32]}>
          <meshStandardMaterial color="#1E3A8A" roughness={0.9} />
        </Box>
        <Box args={[0.36, 0.05, 0.01]} position={[0, 1.20, -0.32]}>
          <meshStandardMaterial color="#1E3A8A" roughness={0.9} />
        </Box>
        <Box args={[0.36, 0.05, 0.01]} position={[0, 1.00, -0.32]}>
          <meshStandardMaterial color="#1E3A8A" roughness={0.9} />
        </Box>
        
        {/* Modern jeans with better proportions and walking animation */}
        <Cylinder 
          args={[0.11, 0.11, 0.72, 24]} 
          position={[-0.12, 0.36, isMoving ? Math.sin(time * 5) * 0.06 : 0]}
          rotation={[isMoving ? Math.sin(time * 5) * 0.2 : 0, 0, 0]}
        >
          <meshStandardMaterial color="#1E40AF" roughness={0.85} />
        </Cylinder>
        
        <Cylinder 
          args={[0.11, 0.11, 0.72, 24]} 
          position={[0.12, 0.36, isMoving ? Math.sin(time * 5 + Math.PI) * 0.06 : 0]}
          rotation={[isMoving ? Math.sin(time * 5 + Math.PI) * 0.2 : 0, 0, 0]}
        >
          <meshStandardMaterial color="#1E40AF" roughness={0.85} />
        </Cylinder>
        
        {/* Jean details - pockets */}
        <Box args={[0.08, 0.08, 0.01]} position={[-0.12, 0.55, 0.11]}>
          <meshStandardMaterial color="#1E3A8A" roughness={0.9} />
        </Box>
        <Box args={[0.08, 0.08, 0.01]} position={[0.12, 0.55, 0.11]}>
          <meshStandardMaterial color="#1E3A8A" roughness={0.9} />
        </Box>
        
        {/* Modern casual sneakers - better proportions */}
        <Box args={[0.16, 0.07, 0.26]} position={[-0.12, 0.035, 0.05]}>
          <meshStandardMaterial color="#F8FAFC" roughness={0.4} metalness={0.05} />
        </Box>
        <Box args={[0.16, 0.07, 0.26]} position={[0.12, 0.035, 0.05]}>
          <meshStandardMaterial color="#F8FAFC" roughness={0.4} metalness={0.05} />
        </Box>
        
        {/* Sneaker soles - more realistic */}
        <Box args={[0.17, 0.025, 0.28]} position={[-0.12, 0.0075, 0.05]}>
          <meshStandardMaterial color="#374151" roughness={0.95} />
        </Box>
        <Box args={[0.17, 0.025, 0.28]} position={[0.12, 0.0075, 0.05]}>
          <meshStandardMaterial color="#374151" roughness={0.95} />
        </Box>
        
        {/* Sneaker details - laces and accents */}
        <Box args={[0.12, 0.015, 0.01]} position={[-0.12, 0.07, 0.13]}>
          <meshStandardMaterial color="#6B7280" />
        </Box>
        <Box args={[0.12, 0.015, 0.01]} position={[0.12, 0.07, 0.13]}>
          <meshStandardMaterial color="#6B7280" />
        </Box>
        {/* Sneaker brand accent */}
        <Box args={[0.08, 0.02, 0.005]} position={[-0.12, 0.06, 0.16]}>
          <meshStandardMaterial color="#EF4444" />
        </Box>
        <Box args={[0.08, 0.02, 0.005]} position={[0.12, 0.06, 0.16]}>
          <meshStandardMaterial color="#EF4444" />
        </Box>
        
        {/* Enhanced arms with better proportions and animation */}
        <Cylinder 
          args={[0.075, 0.075, 0.62, 20]} 
          position={[0.33, 1.32, 0]} 
          rotation={[isMoving ? Math.sin(time * 5 + Math.PI) * 0.25 : 0, 0, Math.PI / 10]}
        >
          <meshStandardMaterial color="#FDBCB4" roughness={0.9} />
        </Cylinder>
        
        <Cylinder 
          args={[0.075, 0.075, 0.62, 20]} 
          position={[-0.33, 1.32, 0]} 
          rotation={[isMoving ? Math.sin(time * 5) * 0.25 : 0, 0, -Math.PI / 10]}
        >
          <meshStandardMaterial color="#FDBCB4" roughness={0.9} />
        </Cylinder>
        
        {/* Better hands positioning and details */}
        <Sphere args={[0.065, 16, 16]} position={[-0.38, 1.13, 0]}>
          <meshStandardMaterial color="#FDBCB4" roughness={0.9} />
        </Sphere>
        <Sphere args={[0.065, 16, 16]} position={[0.38, 1.13, 0]}>
          <meshStandardMaterial color="#FDBCB4" roughness={0.9} />
        </Sphere>
        
        {/* Fingers - more detailed */}
        <Box args={[0.015, 0.04, 0.01]} position={[-0.375, 1.10, 0.02]}>
          <meshStandardMaterial color="#FDBCB4" />
        </Box>
        <Box args={[0.015, 0.04, 0.01]} position={[0.375, 1.10, 0.02]}>
          <meshStandardMaterial color="#FDBCB4" />
        </Box>
        
        {/* Customer accessories - modern smartwatch */}
        <Cylinder args={[0.035, 0.035, 0.015, 16]} position={[-0.38, 1.18, 0]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#1F2937" metalness={0.7} roughness={0.3} />
        </Cylinder>
        {/* Watch screen */}
        <Cylinder args={[0.025, 0.025, 0.005, 16]} position={[-0.38, 1.18, 0]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
        </Cylinder>
        
        {/* Phone in hand (modern touch) */}
        <Box args={[0.025, 0.05, 0.008]} position={[0.375, 1.10, 0.03]}>
          <meshStandardMaterial color="#1F2937" metalness={0.8} roughness={0.2} />
        </Box>
        {/* Phone screen */}
        <Box args={[0.02, 0.04, 0.002]} position={[0.375, 1.10, 0.035]}>
          <meshStandardMaterial color="#3B82F6" emissive="#1E40AF" emissiveIntensity={0.2} />
        </Box>
        
      </group>
      
      {/* Walking indicator - subtle movement effect when moving */}
      {isMoving && (
        <group position={[0, 0.08, 0]}>
          {/* Subtle step indicators */}
          <Sphere args={[0.015, 8, 8]} position={[Math.sin(time * 6) * 0.25, 0, Math.cos(time * 6) * 0.25]}>
            <meshStandardMaterial color="#E5E7EB" transparent opacity={0.4} />
          </Sphere>
          <Sphere args={[0.01, 8, 8]} position={[Math.sin(time * 7 + 1) * 0.15, 0.03, Math.cos(time * 7 + 1) * 0.15]}>
            <meshStandardMaterial color="#E5E7EB" transparent opacity={0.25} />
          </Sphere>
        </group>
      )}
    </group>
  );
}
