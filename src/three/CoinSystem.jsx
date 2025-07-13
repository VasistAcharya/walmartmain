import { useMemo } from 'react';
import { Cylinder } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import { useRef } from 'react';
import { Howl } from 'howler';

// Coin sound (user must add src/assets/coin.mp3)
const coinSound = new Howl({ src: ['/src/assets/coin.mp3'], volume: 0.5 });

// Coin positions in walkways between aisles - adjusted for GLTF store layout
const COIN_POSITIONS = [
  // Left side walkway
  { x: -8, z: -5 },
  { x: -8, z: 0 },
  { x: -8, z: 5 },
  
  // Center walkways between aisles
  { x: -3, z: -8 },
  { x: -3, z: 3 },
  { x: 1, z: -3 },
  { x: 1, z: 7 },
  { x: 5, z: -6 },
  { x: 5, z: 2 },
  
  // Right side walkway
  { x: 9, z: -4 },
  { x: 9, z: 1 },
  { x: 9, z: 6 },
  
  // Main aisle (front/back)
  { x: -1, z: -10 },
  { x: 3, z: -10 },
  { x: -1, z: 10 },
  { x: 3, z: 10 },
];

export default function CoinSystem() {
  const collectedCoins = useGameStore((state) => state.collectedCoins);
  const collectCoin = useGameStore((state) => state.collectCoin);
  const addScore = useGameStore((state) => state.addScore);
  const charPosRef = useRef([0, 0, 0]);

  // Listen to character position from Controls (global window for simplicity)
  useFrame(() => {
    const charPos = window.__CHAR_POS__;
    if (!charPos) return;
    charPosRef.current = charPos;
    COIN_POSITIONS.forEach((coin, i) => {
      if (collectedCoins.includes(i)) return;
      const dx = charPos[0] - coin.x;
      const dz = charPos[2] - coin.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 1) {
        collectCoin(i);
        addScore(10);
        coinSound.play();
      }
    });
  });

  const coins = useMemo(() => (
    COIN_POSITIONS.map((pos, i) => (
      collectedCoins.includes(i) ? null : (
        <Cylinder
          key={i}
          args={[0.3, 0.3, 0.15, 32]} // Made coins smaller to match scale
          position={[pos.x, 0.4, pos.z]} // Lowered position slightly
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial color="gold" emissive="gold" emissiveIntensity={0.2} />
        </Cylinder>
      )
    ))
  ), [collectedCoins]);

  return <group>{coins}</group>;
} 