import { useMemo, useEffect, useState } from 'react';
import { Box, Text, Cylinder } from '@react-three/drei';
import { products } from '../products.js';
import { TextureLoader, RepeatWrapping } from 'three';
import { useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';

// Department colors and names
const DEPARTMENTS = [
  { name: 'Electronics', color: '#0071ce', textColor: '#ffffff' },
  { name: 'Health & Beauty', color: '#00a651', textColor: '#ffffff' },
  { name: 'Food & Grocery', color: '#ff6600', textColor: '#ffffff' },
  { name: 'Home & Garden', color: '#ffc220', textColor: '#000000' },
  { name: 'Clothing', color: '#8b1538', textColor: '#ffffff' },
  { name: 'Sports & Outdoors', color: '#004c91', textColor: '#ffffff' },
];

// Walmart brand colors
const WALMART_BLUE = '#0071ce';
const WALMART_YELLOW = '#ffc220';
const WALMART_GRAY = '#e6e6e6';

// Aisle layout config with better spacing
const AISLES = [
  { x: -12, deptIndex: 0, number: 'A1' },
  { x: -6, deptIndex: 1, number: 'B2' },
  { x: 0, deptIndex: 2, number: 'C3' },
  { x: 6, deptIndex: 3, number: 'D4' },
  { x: 12, deptIndex: 4, number: 'E5' },
  { x: 18, deptIndex: 5, number: 'F6' },
];

const SHELF_HEIGHTS = [0.8, 1.6, 2.4]; // y positions for shelves
const SHELF_THICKNESS = 0.08;
const SHELF_DEPTH = 0.6;
const AISLE_WIDTH = 2.2;
const AISLE_LENGTH = 28;
const SUPPORT_WIDTH = 0.08;
const PRODUCT_BOXES_PER_SHELF = 10;

function ProductBox({ product, position, showPrompt }) {
  const texture = useLoader(TextureLoader, product.image);
  return (
    <group position={position}>
      <Box args={[0.4, 0.6, 0.4]}>
        <meshStandardMaterial map={texture} />
      </Box>
      {showPrompt && (
        <Html center style={{ pointerEvents: 'none' }} position={[0, 0.5, 0]}>
          <div style={{
            background: 'rgba(0,113,206,0.95)', 
            color: '#fff', 
            padding: '8px 16px', 
            borderRadius: 12, 
            fontSize: 14, 
            fontWeight: 600, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', 
            whiteSpace: 'nowrap',
            border: '2px solid #ffc220'
          }}>
            Press E to view product
          </div>
        </Html>
      )}
    </group>
  );
}

// Aisle signage component
function AisleSign({ position, aisleNumber, department }) {
  return (
    <group position={position}>
      {/* Sign background */}
      <Box args={[1.8, 0.6, 0.1]}>
        <meshStandardMaterial color={department.color} />
      </Box>
      {/* Aisle number */}
      <Text
        position={[0, 0.1, 0.06]}
        fontSize={0.25}
        color={department.textColor}
        anchorX="center"
        anchorY="middle"
      >
        AISLE {aisleNumber}
      </Text>
      {/* Department name */}
      <Text
        position={[0, -0.15, 0.06]}
        fontSize={0.15}
        color={department.textColor}
        anchorX="center"
        anchorY="middle"
      >
        {department.name.toUpperCase()}
      </Text>
    </group>
  );
}

// Ceiling light fixture
function CeilingLight({ position }) {
  return (
    <group position={position}>
      {/* Light fixture housing */}
      <Box args={[2, 0.15, 0.8]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#f0f0f0" metalness={0.3} roughness={0.4} />
      </Box>
      {/* Light panels */}
      <Box args={[1.8, 0.05, 0.6]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </Box>
      {/* Point light */}
      <pointLight 
        position={[0, -0.2, 0]} 
        intensity={1.2} 
        distance={8} 
        decay={2}
        color="#ffffff"
      />
    </group>
  );
}

function Aisle({ x, deptIndex, aisleNumber, aisleIdx, playerPos, nearestProductId }) {
  const department = DEPARTMENTS[deptIndex];
  
  // Main vertical supports (sleeker design)
  const supports = [
    [x - AISLE_WIDTH / 2 + SUPPORT_WIDTH / 2, 1.5, -AISLE_LENGTH / 2 + SUPPORT_WIDTH / 2],
    [x + AISLE_WIDTH / 2 - SUPPORT_WIDTH / 2, 1.5, -AISLE_LENGTH / 2 + SUPPORT_WIDTH / 2],
    [x - AISLE_WIDTH / 2 + SUPPORT_WIDTH / 2, 1.5, AISLE_LENGTH / 2 - SUPPORT_WIDTH / 2],
    [x + AISLE_WIDTH / 2 - SUPPORT_WIDTH / 2, 1.5, AISLE_LENGTH / 2 - SUPPORT_WIDTH / 2],
  ];
  
  // End caps with department branding
  const endCaps = [
    [x, 0.6, -AISLE_LENGTH / 2 - 0.8],
    [x, 0.6, AISLE_LENGTH / 2 + 0.8],
  ];
  
  // Improved shelves with realistic materials
  const shelves = SHELF_HEIGHTS.map((y, idx) => (
    <Box
      key={y}
      args={[AISLE_WIDTH, SHELF_THICKNESS, AISLE_LENGTH]}
      position={[x, y, 0]}
    >
      <meshStandardMaterial 
        color="#f5f5f5" 
        metalness={0.1} 
        roughness={0.3}
      />
    </Box>
  ));
  
  // Back panels for shelving units
  const backPanels = [
    <Box 
      key="back-left"
      args={[0.05, 3, AISLE_LENGTH]} 
      position={[x - AISLE_WIDTH / 2, 1.5, 0]}
    >
      <meshStandardMaterial color={department.color} />
    </Box>,
    <Box 
      key="back-right"
      args={[0.05, 3, AISLE_LENGTH]} 
      position={[x + AISLE_WIDTH / 2, 1.5, 0]}
    >
      <meshStandardMaterial color={department.color} />
    </Box>
  ];
  
  // Products for this aisle
  const aisleProducts = products.filter(p => p.aisleIndex === aisleIdx);
  const productBoxes = SHELF_HEIGHTS.flatMap((y, shelfIdx) => (
    aisleProducts.slice(shelfIdx * PRODUCT_BOXES_PER_SHELF, (shelfIdx + 1) * PRODUCT_BOXES_PER_SHELF).map((product, i) => {
      const px = x - AISLE_WIDTH / 2 + 0.3 + (i * (AISLE_WIDTH - 0.6)) / (PRODUCT_BOXES_PER_SHELF - 1);
      const pz = -AISLE_LENGTH / 2 + 1.5 + (shelfIdx % 2 ? 0.3 : -0.3);
      const pzStep = (AISLE_LENGTH - 3) / (PRODUCT_BOXES_PER_SHELF - 1);
      const pos = [px, y + 0.25, pz + i * pzStep];
      const dist = playerPos ? Math.sqrt((playerPos[0] - pos[0]) ** 2 + (playerPos[2] - pos[2]) ** 2) : 999;
      const showPrompt = product.id === nearestProductId && dist < 1.5;
      return (
        <ProductBox
          key={product.id}
          product={product}
          position={pos}
          showPrompt={showPrompt}
        />
      );
    })
  ));
  
  return (
    <group>
      {/* Main vertical supports with metallic finish */}
      {supports.map((pos, i) => (
        <Box key={i} args={[SUPPORT_WIDTH, 3, SUPPORT_WIDTH]} position={pos}>
          <meshStandardMaterial color="#c0c0c0" metalness={0.7} roughness={0.2} />
        </Box>
      ))}
      
      {/* End caps with department branding */}
      {endCaps.map((pos, i) => (
        <Box key={i} args={[AISLE_WIDTH, 1.2, 1.5]} position={pos}>
          <meshStandardMaterial color={department.color} />
        </Box>
      ))}
      
      {/* Aisle signage */}
      <AisleSign 
        position={[x, 3.2, -AISLE_LENGTH / 2 - 1.2]} 
        aisleNumber={aisleNumber} 
        department={department}
      />
      <AisleSign 
        position={[x, 3.2, AISLE_LENGTH / 2 + 1.2]} 
        aisleNumber={aisleNumber} 
        department={department}
      />
      
      {/* Back panels */}
      {backPanels}
      
      {/* Improved shelves */}
      {shelves}
      
      {/* Product boxes */}
      {productBoxes}
    </group>
  );
}

export default function StoreLayout({ onProductProximity }) {
  const [playerPos, setPlayerPos] = useState([0, 0, 0]);
  const [nearestProduct, setNearestProduct] = useState(null);

  // Track player position from Controls
  useEffect(() => {
    const update = () => {
      const pos = window.__CHAR_POS__;
      if (pos) setPlayerPos(pos);
      requestAnimationFrame(update);
    };
    update();
    return () => {};
  }, []);

  // Find nearest product within 1.5 units
  useEffect(() => {
    let minDist = 1.5;
    let nearest = null;
    products.forEach(product => {
      // Find product's 3D position
      const aisleIdx = product.aisleIndex;
      const aisle = AISLES[aisleIdx];
      let found = false;
      SHELF_HEIGHTS.forEach((y, shelfIdx) => {
        const idx = products.filter(p => p.aisleIndex === aisleIdx).indexOf(product);
        if (idx >= 0) {
          const i = idx % PRODUCT_BOXES_PER_SHELF;
          const px = aisle.x - AISLE_WIDTH / 2 + 0.3 + (i * (AISLE_WIDTH - 0.6)) / (PRODUCT_BOXES_PER_SHELF - 1);
          const pz = -AISLE_LENGTH / 2 + 1.5 + (shelfIdx % 2 ? 0.3 : -0.3);
          const pzStep = (AISLE_LENGTH - 3) / (PRODUCT_BOXES_PER_SHELF - 1);
          const pos = [px, y + 0.25, pz + i * pzStep];
          const dist = Math.sqrt((playerPos[0] - pos[0]) ** 2 + (playerPos[2] - pos[2]) ** 2);
          if (dist < minDist) {
            minDist = dist;
            nearest = { ...product, pos };
            found = true;
          }
        }
      });
      if (found) return;
    });
    setNearestProduct(nearest);
  }, [playerPos]);

  // Listen for E key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyE' && nearestProduct) {
        onProductProximity(nearestProduct);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nearestProduct, onProductProximity]);

  // Store flooring with realistic tile pattern
  const floor = useMemo(() => (
    <group>
      {/* Main floor */}
      <Box args={[50, 0.2, 35]} position={[5, -0.1, 0]}>
        <meshStandardMaterial 
          color="#f8f8f8" 
          roughness={0.1} 
          metalness={0.05}
        />
      </Box>
      {/* Tile lines for realism */}
      {Array.from({ length: 25 }, (_, i) => (
        <Box
          key={`tile-x-${i}`}
          args={[0.02, 0.01, 35]}
          position={[-20 + i * 2, 0.05, 0]}
        >
          <meshStandardMaterial color="#e0e0e0" />
        </Box>
      ))}
      {Array.from({ length: 18 }, (_, i) => (
        <Box
          key={`tile-z-${i}`}
          args={[50, 0.01, 0.02]}
          position={[5, 0.05, -17 + i * 2]}
        >
          <meshStandardMaterial color="#e0e0e0" />
        </Box>
      ))}
    </group>
  ), []);

  // Store walls and entrance
  const storeStructure = useMemo(() => (
    <group>
      {/* Back wall */}
      <Box args={[50, 4, 0.3]} position={[5, 2, -17.5]}>
        <meshStandardMaterial color={WALMART_BLUE} />
      </Box>
      
      {/* Side walls */}
      <Box args={[0.3, 4, 35]} position={[-22.5, 2, 0]}>
        <meshStandardMaterial color={WALMART_GRAY} />
      </Box>
      <Box args={[0.3, 4, 35]} position={[32.5, 2, 0]}>
        <meshStandardMaterial color={WALMART_GRAY} />
      </Box>
      
      {/* Front entrance area */}
      <Box args={[20, 4, 0.3]} position={[-7.5, 2, 17.5]}>
        <meshStandardMaterial color={WALMART_BLUE} />
      </Box>
      <Box args={[20, 4, 0.3]} position={[22.5, 2, 17.5]}>
        <meshStandardMaterial color={WALMART_BLUE} />
      </Box>
      
      {/* Walmart logo area */}
      <Text
        position={[5, 3, -17.2]}
        fontSize={1.5}
        color={WALMART_YELLOW}
        anchorX="center"
        anchorY="middle"
      >
        WALMART
      </Text>
      
      {/* Welcome message */}
      <Text
        position={[5, 1.5, 15]}
        fontSize={0.8}
        color={WALMART_BLUE}
        anchorX="center"
        anchorY="middle"
      >
        Welcome to Walmart
      </Text>
    </group>
  ), []);

  // Ceiling and lighting system
  const ceiling = useMemo(() => (
    <group>
      {/* Ceiling */}
      <Box args={[50, 0.2, 35]} position={[5, 4.5, 0]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      
      {/* Ceiling lights arranged in grid */}
      {AISLES.map((aisle, i) => (
        <group key={`lights-${i}`}>
          <CeilingLight position={[aisle.x, 4.3, -10]} />
          <CeilingLight position={[aisle.x, 4.3, 0]} />
          <CeilingLight position={[aisle.x, 4.3, 10]} />
        </group>
      ))}
      
      {/* Additional perimeter lighting */}
      <CeilingLight position={[-15, 4.3, 0]} />
      <CeilingLight position={[25, 4.3, 0]} />
    </group>
  ), []);

  // Aisles with improved parameters
  const aisles = useMemo(() => (
    AISLES.map((aisle, i) => (
      <Aisle 
        key={i} 
        x={aisle.x} 
        deptIndex={aisle.deptIndex} 
        aisleNumber={aisle.number}
        aisleIdx={i} 
        playerPos={playerPos} 
        nearestProductId={nearestProduct?.id} 
      />
    ))
  ), [playerPos, nearestProduct]);

  return (
    <group>
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {floor}
      {storeStructure}
      {ceiling}
      {aisles}
    </group>
  );
} 