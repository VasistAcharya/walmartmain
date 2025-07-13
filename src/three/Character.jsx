import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, useGLTF, useAnimations } from '@react-three/drei';

// --- Procedural Character Sub-Components ---

// Default props for easy customization
const defaultProceduralProps = {
  skinColor: "#FDBCB4",
  hairColor: "#2C1E10",
  shirtColor: "#1E3A8A",
  shirtAccentColor: "#DC2626",
  pantsColor: "#1E40AF",
  shoeColor: "#F8FAFC",
};

// Component for the character's head and face
const ProceduralHead = ({ hairColor, skinColor, isMoving }) => (
  <group>
    {/* Head */}
    <Sphere args={[0.24, 32, 32]} position={[0, 1.95, 0]}>
      <meshStandardMaterial color={skinColor} roughness={0.9} />
    </Sphere>

    {/* Hair */}
    <Sphere args={[0.25, 24, 24]} position={[0, 2.02, -0.015]}>
      <meshStandardMaterial color={hairColor} roughness={0.85} />
    </Sphere>
    <Sphere args={[0.14, 16, 16]} position={[-0.16, 2.0, 0.02]}>
      <meshStandardMaterial color={hairColor} roughness={0.85} />
    </Sphere>
    <Sphere args={[0.14, 16, 16]} position={[0.16, 2.0, 0.02]}>
      <meshStandardMaterial color={hairColor} roughness={0.85} />
    </Sphere>
    <Sphere args={[0.20, 16, 16]} position={[0, 2.12, -0.05]}>
      <meshStandardMaterial color={hairColor} roughness={0.85} />
    </Sphere>

    {/* Face Details */}
    <Sphere args={[0.035, 16, 16]} position={[-0.06, 1.97, 0.225]}>
      <meshStandardMaterial color="#ffffff" />
    </Sphere>
    <Sphere args={[0.035, 16, 16]} position={[0.06, 1.97, 0.225]}>
      <meshStandardMaterial color="#ffffff" />
    </Sphere>
    <Sphere args={[0.018, 12, 12]} position={[-0.06, 1.97, 0.24]}>
      <meshStandardMaterial color="#654321" />
    </Sphere>
    <Sphere args={[0.018, 12, 12]} position={[0.06, 1.97, 0.24]}>
      <meshStandardMaterial color="#654321" />
    </Sphere>
    <Box args={[0.055, 0.025, 0.01]} position={[-0.06, 2.025, 0.235]}>
      <meshStandardMaterial color={hairColor} />
    </Box>
    <Box args={[0.055, 0.025, 0.01]} position={[0.06, 2.025, 0.235]}>
      <meshStandardMaterial color={hairColor} />
    </Box>
    <Box args={[0.06, 0.015, 0.008]} position={[0, 1.86, 0.24]}>
      <meshStandardMaterial color="#B85450" />
    </Box>
  </group>
);

// Component for the character's torso and clothing
const ProceduralBody = ({ shirtColor, shirtAccentColor }) => (
  <group>
    {/* Torso */}
    <Cylinder args={[0.26, 0.30, 0.85, 32]} position={[0, 1.22, 0]}>
      <meshStandardMaterial color="#F0F8FF" roughness={0.8} />
    </Cylinder>
    
    {/* Plaid Shirt Pattern */}
    <Box args={[0.52, 0.04, 0.02]} position={[0, 1.48, 0.30]}>
      <meshStandardMaterial color={shirtColor} roughness={0.9} />
    </Box>
    <Box args={[0.52, 0.04, 0.02]} position={[0, 1.24, 0.30]}>
      <meshStandardMaterial color={shirtColor} roughness={0.9} />
    </Box>
    <Box args={[0.52, 0.04, 0.02]} position={[0, 1.00, 0.30]}>
      <meshStandardMaterial color={shirtColor} roughness={0.9} />
    </Box>
    <Box args={[0.04, 0.65, 0.015]} position={[-0.16, 1.24, 0.305]}>
      <meshStandardMaterial color={shirtAccentColor} roughness={0.9} />
    </Box>
    <Box args={[0.04, 0.65, 0.015]} position={[0.0, 1.24, 0.305]}>
      <meshStandardMaterial color={shirtAccentColor} roughness={0.9} />
    </Box>
    <Box args={[0.04, 0.65, 0.015]} position={[0.16, 1.24, 0.305]}>
      <meshStandardMaterial color={shirtAccentColor} roughness={0.9} />
    </Box>

    {/* Buttons */}
    {[1.52, 1.40, 1.28, 1.16].map(y => (
      <Sphere key={y} args={[0.015, 12, 12]} position={[0, y, 0.32]}>
        <meshStandardMaterial color="#F3F4F6" metalness={0.1} />
      </Sphere>
    ))}
  </group>
);

// Component for arms, legs, and shoes
const ProceduralLimbs = ({ skinColor, pantsColor, shoeColor, isMoving, time }) => (
  <group>
    {/* Legs (Jeans) */}
    <Cylinder args={[0.11, 0.11, 0.8, 24]} position={[-0.12, 0.4, isMoving ? Math.sin(time * 5) * 0.06 : 0]} rotation={[isMoving ? Math.sin(time * 5) * 0.2 : 0, 0, 0]}>
      <meshStandardMaterial color={pantsColor} roughness={0.85} />
    </Cylinder>
    <Cylinder args={[0.11, 0.11, 0.8, 24]} position={[0.12, 0.4, isMoving ? Math.sin(time * 5 + Math.PI) * 0.06 : 0]} rotation={[isMoving ? Math.sin(time * 5 + Math.PI) * 0.2 : 0, 0, 0]}>
      <meshStandardMaterial color={pantsColor} roughness={0.85} />
    </Cylinder>

    {/* Shoes (Sneakers) */}
    <Box args={[0.16, 0.08, 0.28]} position={[-0.12, 0.04, 0.05]}>
      <meshStandardMaterial color={shoeColor} roughness={0.4} />
    </Box>
    <Box args={[0.16, 0.08, 0.28]} position={[0.12, 0.04, 0.05]}>
      <meshStandardMaterial color={shoeColor} roughness={0.4} />
    </Box>
    <Box args={[0.17, 0.02, 0.30]} position={[-0.12, -0.01, 0.05]}>
      <meshStandardMaterial color="#374151" roughness={0.95} />
    </Box>
    <Box args={[0.17, 0.02, 0.30]} position={[0.12, -0.01, 0.05]}>
      <meshStandardMaterial color="#374151" roughness={0.95} />
    </Box>

    {/* Arms */}
    <Cylinder args={[0.06, 0.06, 0.75, 20]} position={[0.32, 1.25, 0]} rotation={[isMoving ? Math.sin(time * 5 + Math.PI) * 0.25 : 0, 0, 0.2]}>
      <meshStandardMaterial color={skinColor} roughness={0.9} />
    </Cylinder>
    <Cylinder args={[0.06, 0.06, 0.75, 20]} position={[-0.32, 1.25, 0]} rotation={[isMoving ? Math.sin(time * 5) * 0.25 : 0, 0, -0.2]}>
      <meshStandardMaterial color={skinColor} roughness={0.9} />
    </Cylinder>

    {/* Hands */}
    <Sphere args={[0.07, 16, 16]} position={[-0.35, 0.88, 0]}>
      <meshStandardMaterial color={skinColor} roughness={0.9} />
    </Sphere>
    <Sphere args={[0.07, 16, 16]} position={[0.35, 0.88, 0]}>
      <meshStandardMaterial color={skinColor} roughness={0.9} />
    </Sphere>
  </group>
);


// --- Main Character Component ---

export default function Character({ 
  position, 
  rotation, 
  scale = [1, 1, 1], 
  modelPath = null, 
  isMoving = false,
  proceduralProps = {}
}) {
  const groupRef = useRef();
  
  // Merge user props with defaults for the procedural character
  const finalProceduralProps = { ...defaultProceduralProps, ...proceduralProps };

  // GLTF model loading
  let gltf = null;
  let animations = [];
  if (modelPath) {
    try {
      gltf = useGLTF(modelPath);
      animations = gltf.animations || [];
    } catch (error) {
      console.warn(`Failed to load GLTF model at ${modelPath}. Falling back to procedural character.`, error);
      gltf = null;
    }
  }

  // Animation handling
  const { actions, mixer } = useAnimations(animations, groupRef);
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;
    const idleAnim = Object.keys(actions).find(name => /idle|stand/i.test(name));
    const walkAnim = Object.keys(actions).find(name => /walk|run/i.test(name));
    
    const actionToPlay = isMoving ? actions[walkAnim] : actions[idleAnim];
    const actionToFade = isMoving ? actions[idleAnim] : actions[walkAnim];

    if (actionToFade) actionToFade.fadeOut(0.3);
    if (actionToPlay) actionToPlay.reset().fadeIn(0.3).play();

  }, [actions, isMoving]);

  useFrame((state, delta) => mixer?.update(delta));

  // Render GLTF model if available
  if (gltf?.scene) {
    const adjustedPosition = [position[0], position[1], position[2]];
    return (
      <group ref={groupRef} position={adjustedPosition} rotation={rotation} scale={scale}>
        <primitive object={gltf.scene.clone()} />
      </group>
    );
  }

  // Fallback to the refactored procedural character
  const characterScale = 1.8;
  const time = Date.now() * 0.005;
  
  return (
    <group position={position} rotation={rotation} scale={[characterScale, characterScale, characterScale]}>
      {/* Bobbing animation */}
      <group position={[0, isMoving ? Math.sin(time * 4) * 0.03 : 0, 0]}>
        
        <ProceduralHead 
          hairColor={finalProceduralProps.hairColor} 
          skinColor={finalProceduralProps.skinColor} 
          isMoving={isMoving} 
        />
        
        <ProceduralBody 
          shirtColor={finalProceduralProps.shirtColor} 
          shirtAccentColor={finalProceduralProps.shirtAccentColor} 
        />

        <ProceduralLimbs
          skinColor={finalProceduralProps.skinColor}
          pantsColor={finalProceduralProps.pantsColor}
          shoeColor={finalProceduralProps.shoeColor}
          isMoving={isMoving}
          time={time}
        />
        
      </group>
    </group>
  );
}