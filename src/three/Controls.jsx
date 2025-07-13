import { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import Character from './Character';

// Aisle definitions for collision - simplified and less restrictive
const AISLES = [
  { x: -6, width: 1.5, length: 16 }, // Made narrower and shorter
  { x: -2, width: 1.5, length: 16 },
  { x: 2, width: 1.5, length: 16 },
  { x: 6, width: 1.5, length: 16 },
];

// Helper: check if a point is inside an aisle's bounding box - more lenient
function isCollidingWithAisle(x, z) {
  for (const aisle of AISLES) {
    const minX = aisle.x - aisle.width / 2 - 0.3; // Smaller collision box
    const maxX = aisle.x + aisle.width / 2 + 0.3;
    const minZ = -aisle.length / 2;
    const maxZ = aisle.length / 2;
    if (x > minX && x < maxX && z > minZ && z < maxZ) {
      return true;
    }
  }
  return false;
}

// Roblox-style third-person controls: WASD moves character relative to camera, mouse orbits camera around character
export default function Controls({ 
  characterModel = null, // Path to GLTF model, e.g., "/models/character.glb"
  characterScale = [1, 1, 1] // Scale for the character model
}) {
  const { camera, gl } = useThree();
  // Character state - spawn outside the store
  const [charPos, setCharPos] = useState([0, 0, 15]); // Moved to front entrance area
  const [charYaw, setCharYaw] = useState(0);
  const [isMoving, setIsMoving] = useState(false); // Track if character is moving for animations

  // Camera state (Roblox-style)
  const [cameraYaw, setCameraYaw] = useState(0); // Horizontal rotation around character
  const [cameraPitch, setCameraPitch] = useState(-0.3); // Vertical angle (looking down slightly)
  const [cameraDistance, setCameraDistance] = useState(8); // Distance from character
  
  const move = useRef({ forward: false, backward: false, left: false, right: false });

  // Clear any existing event listeners on mount to prevent conflicts
  useEffect(() => {
    const canvas = gl.domElement;
    // Remove all existing event listeners by cloning the canvas
    // This ensures we start fresh without any cached handlers
    return () => {
      // Cleanup function runs when component unmounts
    };
  }, []);

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyW') move.current.forward = true;
      if (e.code === 'KeyS') move.current.backward = true;
      if (e.code === 'KeyA') move.current.left = true;
      if (e.code === 'KeyD') move.current.right = true;
    };
    const handleKeyUp = (e) => {
      if (e.code === 'KeyW') move.current.forward = false;
      if (e.code === 'KeyS') move.current.backward = false;
      if (e.code === 'KeyA') move.current.left = false;
      if (e.code === 'KeyD') move.current.right = false;
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse controls (fixed Roblox-style camera)
  useEffect(() => {
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const handleMouseDown = (e) => {
      // Only respond to right mouse button for camera rotation
      if (e.button !== 2) return;
      
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      
      // Prevent default behavior and stop propagation
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Right-click down - starting camera rotation'); // Debug log
    };

    const handleMouseUp = (e) => {
      if (e.button !== 2) return;
      
      isDragging = false;
      console.log('Right-click up - stopping camera rotation'); // Debug log
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - lastX;
      const deltaY = -(e.clientY - lastY); // Invert deltaY directly
      
      // Camera rotation sensitivity
      const sensitivity = 0.008;
      
      setCameraYaw(yaw => {
        const newYaw = yaw - deltaX * sensitivity;
        console.log('Camera Yaw:', newYaw); // Debug log
        return newYaw;
      });
      
      setCameraPitch(pitch => {
        const newPitch = Math.max(-1.2, Math.min(1.2, pitch - deltaY * sensitivity)); // Now using inverted deltaY
        console.log('Camera Pitch:', newPitch); // Debug log
        return newPitch;
      });
      
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handleWheel = (e) => {
      // Zoom in/out with scroll wheel
      const zoomSpeed = 1;
      setCameraDistance(dist => {
        const newDist = Math.max(3, Math.min(20, dist + e.deltaY * zoomSpeed * 0.01));
        console.log('Camera Distance:', newDist); // Debug log
        return newDist;
      });
      e.preventDefault();
    };

    const handleContextMenu = (e) => {
      e.preventDefault(); // Disable right-click context menu
    };

    // Attach events to both canvas and document for better reliability
    const canvas = gl.domElement;
    
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp); // Global mouse up
    document.addEventListener('mousemove', handleMouseMove); // Global mouse move
    canvas.addEventListener('wheel', handleWheel);
    canvas.addEventListener('contextmenu', handleContextMenu);

    // Make sure canvas can receive focus
    canvas.tabIndex = 0;
    canvas.focus();

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [gl]);

  // Character movement and camera system
  useFrame((_, delta) => {
    const speed = 6; // units per second
    let moveX = 0;
    let moveZ = 0;
    
    // Get camera forward and right directions (ignoring Y component for movement)
    const forward = {
      x: Math.sin(cameraYaw),
      z: Math.cos(cameraYaw)
    };
    const right = {
      x: Math.cos(cameraYaw),
      z: -Math.sin(cameraYaw)
    };
    
    // Calculate movement based on input and camera direction
    if (move.current.forward) {
      moveX -= forward.x; // Fixed: W key now moves forward (was backward)
      moveZ -= forward.z;
    }
    if (move.current.backward) {
      moveX += forward.x; // Fixed: S key now moves backward (was forward)
      moveZ += forward.z;
    }
    if (move.current.left) {
      moveX -= right.x;
      moveZ -= right.z;
    }
    if (move.current.right) {
      moveX += right.x;
      moveZ += right.z;
    }
    
    // Normalize movement vector
    const moveLength = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (moveLength > 0) {
      moveX = (moveX / moveLength) * speed * delta;
      moveZ = (moveZ / moveLength) * speed * delta;
    }
    
    // Update movement state for animations
    const currentlyMoving = moveLength > 0.1;
    if (currentlyMoving !== isMoving) {
      setIsMoving(currentlyMoving);
    }
    
    // Apply movement with collision detection
    let [x, y, z] = charPos;
    const nextX = x + moveX;
    const nextZ = z + moveZ;
    
    // Temporarily disable collision for testing - you can re-enable later
    const hasCollision = false; // Set to true to re-enable collision
    
    // Check collision and update position
    if (!hasCollision || !isCollidingWithAisle(nextX, nextZ)) {
      setCharPos([nextX, y, nextZ]);
      console.log('Character moving to position:', [nextX, y, nextZ]); // Debug log
      
      // Rotate character to face movement direction (only when moving)
      if (moveLength > 0.1) {
        const targetYaw = Math.atan2(moveX, moveZ);
        setCharYaw(targetYaw);
        console.log('Character rotation:', targetYaw); // Debug log
      }
    }
    
    // Update global character position (use actual position)
    const currentPos = hasCollision && isCollidingWithAisle(nextX, nextZ) ? [x, y, z] : [nextX, y, nextZ];
    window.__CHAR_POS__ = currentPos;
    
    // Update camera position (Roblox-style orbital camera)
    const [charX, charY, charZ] = currentPos;
    const lookAtHeight = charY + 3.5; // Look at character's head area
    
    // Calculate camera position using spherical coordinates
    const cameraX = charX + cameraDistance * Math.sin(cameraYaw) * Math.cos(cameraPitch);
    const cameraY = lookAtHeight + cameraDistance * Math.sin(cameraPitch);
    const cameraZ = charZ + cameraDistance * Math.cos(cameraYaw) * Math.cos(cameraPitch);
    
    // Debug camera values (remove these console.logs once working)
    if (Math.random() < 0.01) { // Log occasionally to avoid spam
      console.log('Camera Values:', {
        yaw: cameraYaw,
        pitch: cameraPitch,
        distance: cameraDistance,
        position: [cameraX, cameraY, cameraZ],
        lookAt: [charX, lookAtHeight, charZ]
      });
    }
    
    // Set camera position and make it look at character
    camera.position.set(cameraX, cameraY, cameraZ);
    camera.lookAt(charX, lookAtHeight, charZ);
  });

  // Render the character using the Character component
  return (
    <Character 
      position={charPos} 
      rotation={[0, charYaw, 0]} 
      scale={characterScale}
      modelPath={characterModel}
      isMoving={isMoving}
    />
  );
} 