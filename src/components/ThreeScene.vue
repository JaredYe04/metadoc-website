<template>
  <div ref="containerRef" class="absolute inset-0 overflow-hidden pointer-events-none"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const containerRef = ref(null)
let scene, camera, renderer, particles, animationId
let originalPositions = null
let velocities = null
let isAttracting = false
let attractStrength = 0
const ATTRACT_DURATION = 2000 // 聚拢持续时间（毫秒）
const MAX_ATTRACT_STRENGTH = 0.15 // 最大聚拢强度
const RESTORE_STRENGTH = 0.003 // 恢复力强度（缓释）

onMounted(() => {
  if (!containerRef.value) return

  // 创建场景
  scene = new THREE.Scene()
  
  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    containerRef.value.clientWidth / containerRef.value.clientHeight,
    0.1,
    1000
  )
  camera.position.z = 5

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  containerRef.value.appendChild(renderer.domElement)

  // 创建粒子系统
  const particleCount = 1000
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20
    positions[i + 1] = (Math.random() - 0.5) * 20
    positions[i + 2] = (Math.random() - 0.5) * 20

    const color = new THREE.Color()
    color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.6)
    colors[i] = color.r
    colors[i + 1] = color.g
    colors[i + 2] = color.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  // 保存原始位置，用于恢复
  originalPositions = new Float32Array(positions)
  
  // 初始化速度数组
  velocities = new Float32Array(particleCount * 3)
  for (let i = 0; i < velocities.length; i++) {
    velocities[i] = 0
  }

  const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })

  particles = new THREE.Points(geometry, material)
  scene.add(particles)

  // 动画循环
  const animate = () => {
    animationId = requestAnimationFrame(animate)

    particles.rotation.x += 0.0005
    particles.rotation.y += 0.001

    const positions = particles.geometry.attributes.position.array
    const center = new THREE.Vector3(0, 0, 0) // Logo 在屏幕中心，对应 3D 空间的原点
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const z = positions[i + 2]
      
      // 正常的浮动效果
      positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.0001
      
      // 如果正在聚拢
      if (isAttracting && attractStrength > 0) {
        // 计算指向中心的方向向量（聚拢力）
        const dx = center.x - x
        const dy = center.y - y
        const dz = center.z - z
        
        // 计算距离
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
        
        if (distance > 0.1) { // 避免过度聚拢
          // 归一化方向向量并应用聚拢强度
          const force = attractStrength * (1 / (distance + 1))
          velocities[i] += dx * force * 0.01
          velocities[i + 1] += dy * force * 0.01
          velocities[i + 2] += dz * force * 0.01
        }
      }
      
      // 恢复力：始终施加一个指向原始位置的缓释力
      const origX = originalPositions[i]
      const origY = originalPositions[i + 1]
      const origZ = originalPositions[i + 2]
      
      // 计算指向原始位置的方向向量
      const restoreDx = origX - x
      const restoreDy = origY - y
      const restoreDz = origZ - z
      
      // 计算到原始位置的距离
      const restoreDistance = Math.sqrt(restoreDx * restoreDx + restoreDy * restoreDy + restoreDz * restoreDz)
      
      // 只有当粒子偏离原始位置时才施加恢复力
      if (restoreDistance > 0.01) {
        // 应用缓释的恢复力（强度较小，但持续作用）
        const restoreForce = RESTORE_STRENGTH * (restoreDistance / 10) // 距离越远，恢复力越大
        velocities[i] += restoreDx * restoreForce
        velocities[i + 1] += restoreDy * restoreForce
        velocities[i + 2] += restoreDz * restoreForce
      }
      
      // 应用速度
      positions[i] += velocities[i]
      positions[i + 1] += velocities[i + 1]
      positions[i + 2] += velocities[i + 2]
      
      // 阻尼效果，让速度逐渐衰减
      velocities[i] *= 0.95
      velocities[i + 1] *= 0.95
      velocities[i + 2] *= 0.95
    }
    
    particles.geometry.attributes.position.needsUpdate = true

    renderer.render(scene, camera)
  }

  animate()

  // 响应窗口大小变化
  const handleResize = () => {
    if (!containerRef.value) return
    camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
  }

  const cleanup = () => {
    window.removeEventListener('resize', handleResize)
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
    if (renderer) {
      renderer.dispose()
      if (containerRef.value && renderer.domElement) {
        containerRef.value.removeChild(renderer.domElement)
      }
    }
    if (particles) {
      particles.geometry.dispose()
      particles.material.dispose()
    }
  }

  window.addEventListener('resize', handleResize)
  
  onUnmounted(() => {
    cleanup()
  })
})

// 暴露方法供父组件调用
const triggerParticleEffect = () => {
  if (!particles) return
  
  isAttracting = true
  attractStrength = MAX_ATTRACT_STRENGTH
  
  // 逐渐减弱聚拢效果
  const startTime = Date.now()
  const fadeInterval = setInterval(() => {
    const elapsed = Date.now() - startTime
    const progress = elapsed / ATTRACT_DURATION
    
    if (progress >= 1) {
      isAttracting = false
      attractStrength = 0
      clearInterval(fadeInterval)
    } else {
      // 使用缓动函数，让聚拢效果逐渐减弱
      const easeOut = 1 - Math.pow(1 - progress, 3)
      attractStrength = MAX_ATTRACT_STRENGTH * (1 - easeOut)
    }
  }, 16) // 约 60fps
}

defineExpose({
  triggerParticleEffect
})

</script>

