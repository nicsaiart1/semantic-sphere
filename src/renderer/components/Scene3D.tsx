import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useSemanticStore } from '../store/semanticStore';
import { useNavigationStore } from '../store/navigationStore';
import { useSettingsStore } from '../store/settingsStore';
import { ConceptNode } from './ConceptNode';
import { ConnectionLine } from './ConnectionLine';
import { EffectsComposer } from './EffectsComposer';

export const Scene3D: React.FC = () => {
  const { camera, gl, scene } = useThree();
  const controlsRef = useRef<any>();
  
  const { semanticSpace, selectedConcept, hoveredConcept } = useSemanticStore();
  const { camera: cameraState, isAnimating, updateFromThreeCamera } = useNavigationStore();
  const { render: renderSettings } = useSettingsStore();

  // Update Three.js camera from navigation store
  useEffect(() => {
    if (camera && isAnimating) {
      const [x, y, z] = cameraState.position;
      const [tx, ty, tz] = cameraState.target;
      
      camera.position.set(x, y, z);
      camera.lookAt(tx, ty, tz);
      camera.zoom = cameraState.zoom;
      
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = cameraState.fov;
        camera.updateProjectionMatrix();
      }
    }
  }, [camera, cameraState, isAnimating]);

  // Update navigation store when camera changes
  useFrame(() => {
    if (camera && !isAnimating) {
      updateFromThreeCamera(camera);
    }
  });

  // Handle concept selection
  const handleConceptClick = (concept: any) => {
    useSemanticStore.getState().setSelectedConcept(concept);
  };

  const handleConceptHover = (concept: any, isHovering: boolean) => {
    useSemanticStore.getState().setHoveredConcept(isHovering ? concept : null);
  };

  // Render concept nodes
  const renderNodes = () => {
    const nodes = Array.from(semanticSpace.nodes.values());
    
    return nodes.map((node) => (
      <ConceptNode
        key={node.id}
        concept={node}
        isSelected={selectedConcept?.id === node.id}
        isHovered={hoveredConcept?.id === node.id}
        onClick={() => handleConceptClick(node)}
        onHover={(isHovering) => handleConceptHover(node, isHovering)}
      />
    ));
  };

  // Render connections between nodes
  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    const nodes = Array.from(semanticSpace.nodes.values());
    
    nodes.forEach((sourceNode) => {
      sourceNode.connections.forEach((connection) => {
        const targetNode = semanticSpace.nodes.get(connection.targetId);
        if (targetNode) {
          connections.push(
            <ConnectionLine
              key={`${sourceNode.id}-${targetNode.id}`}
              sourcePosition={sourceNode.position}
              targetPosition={targetNode.position}
              strength={connection.strength}
              type={connection.type}
              isHighlighted={
                selectedConcept?.id === sourceNode.id || 
                selectedConcept?.id === targetNode.id
              }
            />
          );
        }
      });
    });
    
    return connections;
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} />
      
      {/* Background */}
      {renderSettings.particleEffects && (
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
      )}
      
      {/* Grid helper */}
      <gridHelper args={[100, 100]} position={[0, -10, 0]} opacity={0.2} />
      
      {/* Concept nodes */}
      {renderNodes()}
      
      {/* Connections */}
      {renderConnections()}
      
      {/* Camera controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        dampingFactor={0.05}
        screenSpacePanning={false}
        minDistance={1}
        maxDistance={100}
        maxPolarAngle={Math.PI}
        onStart={() => useNavigationStore.getState().setDragging(true)}
        onEnd={() => useNavigationStore.getState().setDragging(false)}
      />
      
      {/* Post-processing effects */}
      {renderSettings.bloom && <EffectsComposer />}
      
      {/* Debug info */}
      {renderSettings.quality === 'ultra' && (
        <Text
          position={[-45, 45, 0]}
          fontSize={2}
          color="#64b5f6"
          anchorX="left"
          anchorY="top"
        >
          {`Nodes: ${semanticSpace.nodes.size}`}
          {renderSettings.showFPS && `\nFPS: 60`}
        </Text>
      )}
    </>
  );
};