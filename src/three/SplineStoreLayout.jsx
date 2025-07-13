import Spline from '@splinetool/react-spline';
import { useState, useEffect } from 'react';

export default function SplineStoreLayout({ onProductProximity }) {
  const [splineApp, setSplineApp] = useState(null);

  function onLoad(splineApp) {
    setSplineApp(splineApp);
  }

  // Example of how to interact with Spline objects
  function onMouseDown(e) {
    if (e.target.name === 'Product') {
      // Handle product interaction
      console.log('Product clicked:', e.target);
    }
  }

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Spline 
        scene="https://prod.spline.design/your-scene-url-here" 
        onLoad={onLoad}
        onMouseDown={onMouseDown}
      />
    </div>
  );
}
