"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Icosahedron, MeshDistortMaterial } from "@react-three/drei"
import { useRef } from "react"
import * as THREE from "three"

function LogoElement() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.5
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2
    }
  })

  return (
    <Float speed={3} rotationIntensity={1} floatIntensity={1}>
      <Icosahedron ref={meshRef} args={[1, 0]}>
        <MeshDistortMaterial
          color="#6366f1"
          distort={0.3}
          speed={4}
          roughness={0}
          metalness={0.8}
        />
      </Icosahedron>
    </Float>
  )
}

export function ThreeLogo() {
  return (
    <div className="h-8 w-8">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <LogoElement />
      </Canvas>
    </div>
  )
}
