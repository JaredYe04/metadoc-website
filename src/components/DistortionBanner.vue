<template>
  <section
    ref="containerRef"
    class="distortion-banner relative w-full overflow-hidden cursor-default"
    :style="{
      background: isDark ? '#ffffff' : '#0c1929',
      height: '55vh',
      minHeight: '320px'
    }"
  >
    <canvas ref="canvasRef" class="block w-full h-full" />
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useDark } from '@vueuse/core'

const containerRef = ref(null)
const canvasRef = ref(null)
const isDark = useDark({
  storageKey: 'theme',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: ''
})

const COLS_A = 24
const ROWS_A = 10
const COLS_B = 13
const ROWS_B = 6
const COLS_C = 32
const ROWS_C = 24
const PULL_NEAR_MOUSE = 0.012
const PULL_FAR_FROM_MOUSE = 0.11
const PULL_FACTOR_RECOVER = 0.065
const DAMPING = 0.78
const IMPULSE_SCALE = 0.9
const JITTER_RANGE_INVERSE_DENSITY = 1
const JITTER_RANDOM_SPREAD_BY_DENSITY = 0.4
const MAX_DISPLACE = 120
const INFLUENCE_RADIUS = 80
const DISPLACE_SCALE_MIN = 0.6
const DISPLACE_SCALE_MAX = 1.4
const SPEED_SCALE_MIN = 1.2
const SPEED_SCALE_MAX = 2.8

let canvas
let ctx
let textCanvas
let textCtx
let animationId
let dpr = 1
let logicalW = 0
let logicalH = 0
let gridA = []
let gridB = []
let gridC = []
let mouse = { x: -10000, y: -10000, over: false }
let lastMouseX = -10000
let lastMouseY = -10000
let rafScheduled = false

function randomBetween(a, b) {
  return a + Math.random() * (b - a)
}

const REF_CELLS = COLS_A * ROWS_A

function buildOneGrid(w, h, cols, rows, layerSpeedScale = 1) {
  const cellW = w / cols
  const cellH = h / rows
  const out = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      out.push({
        x: col * cellW,
        y: row * cellH,
        w: cellW,
        h: cellH,
        cx: col * cellW + cellW / 2,
        cy: row * cellH + cellH / 2,
        dx: 0,
        dy: 0,
        vx: 0,
        vy: 0,
        targetDx: 0,
        targetDy: 0,
        displaceScale: randomBetween(DISPLACE_SCALE_MIN, DISPLACE_SCALE_MAX),
        speedScale: randomBetween(SPEED_SCALE_MIN, SPEED_SCALE_MAX),
        layerSpeedScale
      })
    }
  }
  return out
}

function buildGrid(w, h) {
  gridA = buildOneGrid(w, h, COLS_A, ROWS_A, (COLS_A * ROWS_A) / REF_CELLS)
  gridB = buildOneGrid(w, h, COLS_B, ROWS_B, (COLS_B * ROWS_B) / REF_CELLS)
  gridC = buildOneGrid(w, h, COLS_C, ROWS_C, (COLS_C * ROWS_C) / REF_CELLS)
}

function getThemeColors() {
  return isDark.value
    ? { bg: '#ffffff', text: 'rgba(0,0,0,0.952)' }
    : { bg: '#000000', text: 'rgba(255, 255, 255, 0.952)' }
}

function drawTextToOffscreen(w, h) {
  const pw = Math.round(w * dpr)
  const ph = Math.round(h * dpr)
  if (!textCanvas || textCanvas.width !== pw || textCanvas.height !== ph) {
    textCanvas = document.createElement('canvas')
    textCanvas.width = pw
    textCanvas.height = ph
    textCtx = textCanvas.getContext('2d')
  }
  const colors = getThemeColors()
  textCtx.setTransform(1, 0, 0, 1, 0, 0)
  textCtx.clearRect(0, 0, pw, ph)
  textCtx.scale(dpr, dpr)
  const fontSize = Math.min(w / 5.5, h * 0.82)
  textCtx.fillStyle = colors.text
  textCtx.font = `bold ${fontSize}px "Arial Black", "Helvetica Neue", sans-serif`
  textCtx.textAlign = 'center'
  textCtx.textBaseline = 'middle'
  textCtx.fillText('METADOC', w / 2, h / 2)
  textCtx.setTransform(1, 0, 0, 1, 0, 0)
}

function updateTargetsForGrid(grid) {
  const mx = mouse.x
  const my = mouse.y
  const over = mouse.over
  for (let i = 0; i < grid.length; i++) {
    const g = grid[i]
    if (!over) {
      g.targetDx = 0
      g.targetDy = 0
      continue
    }
    const dx = g.cx - mx
    const dy = g.cy - my
    const dist = Math.sqrt(dx * dx + dy * dy) || 0.001
    const factor = Math.max(0, 1 - dist / INFLUENCE_RADIUS)
    const strength = factor * factor * MAX_DISPLACE * g.displaceScale
    const ndx = dx / dist
    const ndy = dy / dist
    g.targetDx = ndx * strength
    g.targetDy = ndy * strength
  }
}

function updateTargets() {
  updateTargetsForGrid(gridA)
  updateTargetsForGrid(gridB)
  updateTargetsForGrid(gridC)
}

function momentumStepForGrid(grid) {
  const over = mouse.over
  const mx = mouse.x
  const my = mouse.y
  const mouseVelX = mx - lastMouseX
  const mouseVelY = my - lastMouseY
  const mouseSpeed = Math.sqrt(mouseVelX * mouseVelX + mouseVelY * mouseVelY)

  for (let i = 0; i < grid.length; i++) {
    const g = grid[i]
    const spd = g.speedScale
    const toTargetX = g.targetDx - g.dx
    const toTargetY = g.targetDy - g.dy

    let pull
    if (over) {
      const distToMouse = Math.sqrt((g.cx - mx) ** 2 + (g.cy - my) ** 2) || 0.001
      const t = Math.min(1, distToMouse / INFLUENCE_RADIUS)
      pull = PULL_NEAR_MOUSE + (PULL_FAR_FROM_MOUSE - PULL_NEAR_MOUSE) * t
    } else {
      pull = PULL_FACTOR_RECOVER
    }
    const layerScale = g.layerSpeedScale ?? 1
    g.vx += toTargetX * pull * spd * layerScale
    g.vy += toTargetY * pull * spd * layerScale

    if (over && mouseSpeed > 0.5) {
      const dist = Math.sqrt((g.cx - mx) ** 2 + (g.cy - my) ** 2) || 0.001
      const weight = Math.max(0, 1 - dist / INFLUENCE_RADIUS)
      const baseImpulse = Math.min(mouseSpeed * IMPULSE_SCALE * weight * spd, 28)
      const jitterRangeScale = JITTER_RANGE_INVERSE_DENSITY / layerScale
      const randomSpread = layerScale * JITTER_RANDOM_SPREAD_BY_DENSITY
      const randomMultiplier = 1 + (Math.random() - 0.5) * 2 * randomSpread
      const impulse = baseImpulse * jitterRangeScale * randomMultiplier
      const nx = mouseVelX / mouseSpeed
      const ny = mouseVelY / mouseSpeed
      g.vx += nx * impulse
      g.vy += ny * impulse
    }

    g.dx += g.vx
    g.dy += g.vy
    g.vx *= DAMPING
    g.vy *= DAMPING
  }
}

function momentumStep() {
  const mx = mouse.x
  const my = mouse.y
  lastMouseX = mx
  lastMouseY = my
  momentumStepForGrid(gridA)
  momentumStepForGrid(gridB)
  momentumStepForGrid(gridC)
}

function draw() {
  if (!ctx || !textCtx) return

  const w = canvas.width / dpr
  const h = canvas.height / dpr
  logicalW = w
  logicalH = h
  const colors = getThemeColors()

  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, w, h)

  function drawLayer(grid) {
    for (let i = 0; i < grid.length; i++) {
      const g = grid[i]
      const destX = g.x + g.dx
      const destY = g.y + g.dy
      ctx.fillStyle = colors.bg
      ctx.fillRect(destX, destY, g.w, g.h)
    }
    for (let i = 0; i < grid.length; i++) {
      const g = grid[i]
      const destX = g.x + g.dx
      const destY = g.y + g.dy
      const sx = g.x * dpr
      const sy = g.y * dpr
      const sw = g.w * dpr
      const sh = g.h * dpr
      ctx.drawImage(textCanvas, sx, sy, sw, sh, destX, destY, g.w, g.h)
    }
  }
  drawLayer(gridA)
  drawLayer(gridB)
  drawLayer(gridC)

  updateTargets()
  momentumStep()
}

function tick() {
  rafScheduled = false
  draw()
  animationId = requestAnimationFrame(loop)
}

function loop() {
  if (rafScheduled) return
  rafScheduled = true
  animationId = requestAnimationFrame(tick)
}

function resize() {
  if (!containerRef.value || !canvasRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const w = rect.width
  const h = rect.height
  logicalW = w
  logicalH = h
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas = canvasRef.value
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  ctx = canvas.getContext('2d')
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.scale(dpr, dpr)
  buildGrid(w, h)
  drawTextToOffscreen(w, h)
}

watch(isDark, () => {
  if (logicalW > 0 && logicalH > 0 && textCtx) drawTextToOffscreen(logicalW, logicalH)
})

function onMouseMove(e) {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  if (!mouse.over) {
    lastMouseX = x
    lastMouseY = y
  }
  mouse.x = x
  mouse.y = y
  mouse.over = true
}

function onMouseLeave() {
  mouse.over = false
  lastMouseX = mouse.x
  lastMouseY = mouse.y
}

function init() {
  resize()
  loop()
  window.addEventListener('resize', resize)
  containerRef.value?.addEventListener('mousemove', onMouseMove)
  containerRef.value?.addEventListener('mouseleave', onMouseLeave)
}

function cleanup() {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resize)
  containerRef.value?.removeEventListener('mousemove', onMouseMove)
  containerRef.value?.removeEventListener('mouseleave', onMouseLeave)
}

onMounted(() => {
  if (containerRef.value && canvasRef.value) init()
})

onUnmounted(cleanup)
</script>

<style scoped>
.distortion-banner {
  height: 55vh;
  min-height: 320px;
}
</style>
