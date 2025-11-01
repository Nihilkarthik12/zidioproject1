import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';

const Bar3D = ({ data, xAxis, yAxis, color }) => {
  const meshRef = useRef();
  
  return (
    <group>
      {data.map((item, index) => {
        const value = parseFloat(item.values[yAxis]) || 0;
        const height = Math.max(value / 1000, 0.1); // Scale height
        return (
          <mesh key={index} position={[index * 2 - data.length, height / 2, 0]} ref={meshRef}>
            <boxGeometry args={[1.5, height, 1.5]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
};

const ThreeChart = ({ data }) => {
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');

  if (!data || !data.columns || !data.data) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
      No data available for 3D visualization
    </div>;
  }

  // Get numeric columns for Y-axis
  const numericColumns = data.columns.filter(col => {
    return data.data.some(item => {
      const value = item.values[col];
      return !isNaN(parseFloat(value)) && isFinite(value);
    });
  });

  const numericData = data.data.filter(item => {
    const value = item.values[yAxis];
    return !isNaN(parseFloat(value)) && isFinite(value);
  });

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', margin: '10px 0' }}>
      <h3 style={{ marginBottom: '15px', color: '#333' }}>🎯 3D Chart Visualization</h3>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>X-Axis:</label>
          <select 
            value={xAxis} 
            onChange={(e) => setXAxis(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">Select X Axis</option>
            {data.columns.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Y-Axis:</label>
          <select 
            value={yAxis} 
            onChange={(e) => setYAxis(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">Select Y Axis</option>
            {numericColumns.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
        </div>
      </div>

      {xAxis && yAxis && numericData.length > 0 ? (
        <div style={{ height: '400px', border: '1px solid #eee', borderRadius: '4px' }}>
          <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Bar3D data={numericData} xAxis={xAxis} yAxis={yAxis} color="#4f46e5" />
            <OrbitControls />
            <gridHelper args={[20, 20]} />
          </Canvas>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666', background: '#f9f9f9', borderRadius: '4px' }}>
          Select X and Y axes to generate 3D visualization
        </div>
      )}
      
      {xAxis && yAxis && (
        <div style={{ marginTop: '15px', padding: '10px', background: '#f0f9ff', borderRadius: '4px' }}>
          <p><strong>3D Chart Info:</strong> Showing {numericData.length} data points</p>
          <p><strong>X-Axis:</strong> {xAxis} | <strong>Y-Axis:</strong> {yAxis}</p>
        </div>
      )}
    </div>
  );
};

export default ThreeChart;
