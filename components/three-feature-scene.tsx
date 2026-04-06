"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Float, MeshDistortMaterial, Icosahedron, Octahedron, Torus, Sphere } from "@react-three/drei"
import { useRef } from "react"
import * as THREE from "three"

interface ThreeFeatureSceneProps {
  type: "brain" | "heart" | "shield" | "sparkles"
  color?: string
}

function FeatureElement({ type, color = "#6366f1" }: ThreeFeatureSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.4
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2
    }
  })

  const Geometry = {
    brain: Icosahedron,
    heart: Octahedron,
    shield: Torus,
    sparkles: Sphere,
  }[type]

  const args = {
    brain: [1, 0],
    heart: [1, 0],
    shield: [0.8, 0.2, 16, 32],
    sparkles: [0.8, 32, 32],
  }[type]

  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={1.5}>
      {/* @ts-ignore */}
      <Geometry ref={meshRef} args={args}>
        <MeshDistortMaterial
          color={color}
          distort={0.4}
          speed={3}
          roughness={0.1}
          metalness={0.8}
        />
      </Geometry>
    </Float>
  )
}

export function ThreeFeatureScene({ type, color }: ThreeFeatureSceneProps) {
  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <FeatureElement type={type} color={color} />
      </Canvas>
    </div>
  )
}
