import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import * as THREE from 'three';
import { useDashboardStore } from '../../store/useDashboardStore';

// 3D Sensor Node with Heatmap Glow Animation
const Sensor3DNode: React.FC<{ position: [number, number, number]; temp: number; name: string }> = ({
  position,
  temp,
  name,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Determine glow color based on temperature
  const getColor = () => {
    if (temp > 28) return '#D13438'; // Critical Red
    if (temp > 25) return '#FFB900'; // Amber Warm
    return '#50E6FF';              // Normal Cyan Cool
  };

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  const nodeColor = getColor();

  return (
    <group position={position}>
      {/* Outer Glow Halo */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={nodeColor} wireframe transparent opacity={0.6} />
      </mesh>

      {/* Core Mesh */}
      <mesh>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={nodeColor} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.25}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        {`${name}: ${temp.toFixed(1)}°C`}
      </Text>
    </group>
  );
};

// 3D Vessel Hull Representation
const VesselHull: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Ship Main Hull Structure */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[4.5, 0.8, 1.8]} />
        <meshStandardMaterial color="#1E293B" roughness={0.4} metalness={0.6} transparent opacity={0.85} />
      </mesh>

      {/* Bridge Deck Superstructure */}
      <mesh position={[-1.2, 0.4, 0]}>
        <boxGeometry args={[1.5, 1.0, 1.4]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Engine Room Section (Highlighted Wireframe) */}
      <mesh position={[1.0, -0.1, 0]}>
        <boxGeometry args={[1.8, 1.0, 1.5]} />
        <meshStandardMaterial color="#0078D4" wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

export const DigitalTwin3D: React.FC = () => {
  const { telemetry } = useDashboardStore();

  return (
    <Card sx={{ height: '100%', position: 'relative' }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, zIndex: 10 }}>
          <Box>
            <Typography variant="h6" sx={{ color: '#FFF', fontWeight: 700 }}>
              3D Spatial Digital Twin Explorer
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
              Interactive Three.js Scene • Real-time Heatmap Sync
            </Typography>
          </Box>

          <Chip
            label="Live WebGL Heatmap"
            size="small"
            sx={{
              backgroundColor: 'rgba(80, 230, 255, 0.15)',
              color: '#50E6FF',
              border: '1px solid #50E6FF',
              fontWeight: 700,
              fontSize: '0.7rem',
            }}
          />
        </Box>

        {/* Canvas Container */}
        <Box sx={{ width: '100%', flexGrow: 1, minHeight: 320, borderRadius: 2, overflow: 'hidden', bgcolor: '#090F1A' }}>
          <Canvas>
            <PerspectiveCamera makeDefault position={[5, 4, 6]} fov={50} />
            <OrbitControls enablePan enableZoom autoRotate autoRotateSpeed={0.5} />

            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 5]} intensity={1.2} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />

            <VesselHull />

            {/* 3D Sensor Node for M5Stick-01 */}
            <Sensor3DNode position={[1.0, 0.5, 0]} temp={telemetry.temperature} name="M5Stick-01" />

            {/* 3D Sensor Node for Auxiliary Engine */}
            <Sensor3DNode position={[-1.2, 1.2, 0]} temp={21.5} name="Bridge Deck" />
          </Canvas>
        </Box>
      </CardContent>
    </Card>
  );
};
