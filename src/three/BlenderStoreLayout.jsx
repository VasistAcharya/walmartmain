import { useGLTF } from '@react-three/drei';
import { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { products } from '../products.js';

// Component to load your store layout GLTF
function StoreModel({ onProductProximity, playerPos, nearestProductId }) {
  // Load your GLTF file - UPDATE THIS PATH to match your file name
  const { scene, nodes, materials } = useGLTF('/models/store-layout.gltf');
  
  return (
    <group>
      <primitive 
        object={scene} 
        scale={1} 
        position={[0, 0, 0]} 
      />
      
      {/* Add interactive product boxes on top of your 3D model */}
      <ProductBoxes 
        playerPos={playerPos} 
        nearestProductId={nearestProductId}
        onProductProximity={onProductProximity}
      />
    </group>
  );
}

// Interactive product boxes that work with your GLTF layout
function ProductBoxes({ playerPos, nearestProductId, onProductProximity }) {
  // Define product positions - adjusted to match your GLTF store layout
  const productPositions = [
    // Left aisle shelving
    { product: products[0], position: [-6, 1.2, -6] },
    { product: products[1], position: [-6, 1.2, -3] },
    { product: products[2], position: [-6, 1.2, 0] },
    { product: products[3], position: [-6, 1.2, 3] },
    { product: products[4], position: [-6, 1.2, 6] },
    
    // Second aisle from left
    { product: products[5], position: [-2, 1.2, -6] },
    { product: products[6], position: [-2, 1.2, -3] },
    { product: products[7], position: [-2, 1.2, 0] },
    { product: products[8], position: [-2, 1.2, 3] },
    { product: products[9], position: [-2, 1.2, 6] },
    
    // Center aisle
    { product: products[10], position: [2, 1.2, -6] },
    { product: products[11], position: [2, 1.2, -3] },
    { product: products[12], position: [2, 1.2, 0] },
    { product: products[13], position: [2, 1.2, 3] },
    { product: products[14], position: [2, 1.2, 6] },
    
    // Right side aisles
    { product: products[15], position: [6, 1.2, -6] },
    { product: products[16], position: [6, 1.2, -3] },
    { product: products[17], position: [6, 1.2, 0] },
    { product: products[18], position: [6, 1.2, 3] },
    { product: products[19], position: [6, 1.2, 6] },
  ].filter(({ product }) => product); // Filter out undefined products

  return (
    <group>
      {productPositions.map(({ product, position }, index) => {
        const dist = playerPos ? 
          Math.sqrt((playerPos[0] - position[0]) ** 2 + (playerPos[2] - position[2]) ** 2) : 999;
        const showPrompt = product.id === nearestProductId && dist < 2;
        
        return (
          <group key={product.id} position={position}>
            {/* Invisible interaction box - made bigger for easier interaction */}
            <mesh visible={false}>
              <boxGeometry args={[1.5, 2.5, 1.5]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
            
            {/* Visible product representation - smaller and more realistic */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.4, 0.6, 0.3]} />
              <meshStandardMaterial color="#8e44ad" opacity={0.7} transparent />
            </mesh>
            
            {/* Product prompt */}
            {showPrompt && (
              <Html center style={{ pointerEvents: 'none' }} position={[0, 1.5, 0]}>
                <div style={{
                  background: 'rgba(0,113,206,0.95)', 
                  color: '#fff', 
                  padding: '8px 16px', 
                  borderRadius: 12, 
                  fontSize: 14, 
                  fontWeight: 600, 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)', 
                  whiteSpace: 'nowrap',
                  border: '2px solid #ffc220',
                  maxWidth: '200px',
                  textAlign: 'center'
                }}>
                  Press E to view<br />
                  <small>{product.name.substring(0, 30)}...</small>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

export default function BlenderStoreLayout({ onProductProximity }) {
  const [playerPos, setPlayerPos] = useState([0, 0, 0]);
  const [nearestProduct, setNearestProduct] = useState(null);

  // Track player position
  useEffect(() => {
    const update = () => {
      const pos = window.__CHAR_POS__;
      if (pos) setPlayerPos(pos);
      requestAnimationFrame(update);
    };
    update();
    return () => {};
  }, []);

  // Find nearest product
  useEffect(() => {
    let minDist = 2.5; // Increased detection range for bigger character
    let nearest = null;
    
    // Product positions that match the ProductBoxes component
    const productPositions = [
      // Left aisle shelving
      { product: products[0], position: [-6, 1.2, -6] },
      { product: products[1], position: [-6, 1.2, -3] },
      { product: products[2], position: [-6, 1.2, 0] },
      { product: products[3], position: [-6, 1.2, 3] },
      { product: products[4], position: [-6, 1.2, 6] },
      
      // Second aisle from left
      { product: products[5], position: [-2, 1.2, -6] },
      { product: products[6], position: [-2, 1.2, -3] },
      { product: products[7], position: [-2, 1.2, 0] },
      { product: products[8], position: [-2, 1.2, 3] },
      { product: products[9], position: [-2, 1.2, 6] },
      
      // Center aisle
      { product: products[10], position: [2, 1.2, -6] },
      { product: products[11], position: [2, 1.2, -3] },
      { product: products[12], position: [2, 1.2, 0] },
      { product: products[13], position: [2, 1.2, 3] },
      { product: products[14], position: [2, 1.2, 6] },
      
      // Right side aisles
      { product: products[15], position: [6, 1.2, -6] },
      { product: products[16], position: [6, 1.2, -3] },
      { product: products[17], position: [6, 1.2, 0] },
      { product: products[18], position: [6, 1.2, 3] },
      { product: products[19], position: [6, 1.2, 6] },
    ].filter(({ product }) => product); // Filter out undefined products

    productPositions.forEach(({ product, position }) => {
      const dist = Math.sqrt(
        (playerPos[0] - position[0]) ** 2 + 
        (playerPos[2] - position[2]) ** 2
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = product;
      }
    });

    setNearestProduct(nearest);
  }, [playerPos]);

  // Handle E key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyE' && nearestProduct) {
        onProductProximity(nearestProduct);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nearestProduct, onProductProximity]);

  return (
    <group>
      {/* Lighting for your scene */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      
      {/* Your GLTF store model */}
      <StoreModel 
        onProductProximity={onProductProximity}
        playerPos={playerPos}
        nearestProductId={nearestProduct?.id}
      />
    </group>
  );
}

// Preload your GLTF file - UPDATE THIS PATH to match your file
useGLTF.preload('/models/YOUR_FILE_NAME.gltf');
