const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const menuScreen = document.getElementById('menuScreen')
const optionsScreen = document.getElementById('optionsScreen')
const deathScreen = document.getElementById('deathScreen')
const scoreDisplay = document.getElementById('scoreDisplay')
const hiScoreDisplay = document.getElementById('hiScore')

const W = canvas.width
const H = canvas.height

let state = 'idle'
let score = 0
let hiScore = 0
let isacMode = false
let eduardoMode = false

let mansImg = new Image()
mansImg.src = 'mans2.jpg'

const isacImg1 = new Image()
isacImg1.src = 'isac1.jpg'
const isacImg2 = new Image()
isacImg2.src = 'isac2.jpg'

let currentBg = isacImg1

const eduardoImgs = [
  'eduardo1.jpg',
  'eduardo2.jpg',
  'eduardo3.jpg',
  'eduardo4.jpg',
  'eduardo5.jpg',
  'eduardo6.jpg'
].map(src => {
  const i = new Image()
  i.src = src
  return i
})

let eduardoBg = eduardoImgs[0]

let animFrame = null

const bird = {
  x: 90,
  y: H / 2,
  vy: 0,
  w: 52,
  h: 52,
  gravity: 0.5,
  jumpForce: -9,
  rotation: 0,
  flapAnim: 0
}

const PIPE_W = 60
const PIPE_GAP = 160
const PIPE_SPEED = 2.8
let pipes = []
let pipeTimer = 0
const PIPE_INTERVAL = 90

const GROUND_H = 80
let groundX = 0

let clouds = [
  { x: 60, y: 60, s: 1 },
  { x: 200, y: 100, s: 0.8 },
  { x: 320, y: 50, s: 1.2 }
]

let particles = []

function resetGame() {
  bird.y = H / 2
  bird.vy = 0
  bird.rotation = 0
  pipes = []
  pipeTimer = 0
  score = 0
  groundX = 0
  particles = []
  scoreDisplay.textContent = '0'
  clouds = [
    { x: 60, y: 60, s: 1 },
    { x: 200, y: 100, s: 0.8 },
    { x: 320, y: 50, s: 1.2 }
  ]
}

function flap() {
  if (state === 'playing') {
    bird.vy = bird.jumpForce
    bird.flapAnim = 8
  }
}

function hideAllScreens() {
  menuScreen.style.display = 'none'
  optionsScreen.style.display = 'none'
  deathScreen.style.display = 'none'
}

function showMenu() {
  resetGame()
  state = 'idle'
  hideAllScreens()
  menuScreen.style.display = 'flex'
  scoreDisplay.style.display = 'none'
  hiScoreDisplay.style.display = 'none'
  if (animFrame) cancelAnimationFrame(animFrame)
  loop()
}

function showOptions() {
  hideAllScreens()
  optionsScreen.style.display = 'flex'
}

function startGame() {
  resetGame()
  state = 'playing'
  hideAllScreens()
  scoreDisplay.style.display = 'block'
  hiScoreDisplay.style.display = 'block'
  if (animFrame) cancelAnimationFrame(animFrame)
  loop()
}

function spawnPipe() {
  const minTop = 60
  const maxTop = H - GROUND_H - PIPE_GAP - 60
  const topH = Math.floor(Math.random() * (maxTop - minTop) + minTop)
  pipes.push({ x: W + 10, topH, scored: false })
}

function checkCollision() {
  const r = bird.w / 2 - 4
  if (bird.y + r >= H - GROUND_H || bird.y - r <= 0) return true
  for (const p of pipes) {
    const px = p.x
    const bx = bird.x
    const by = bird.y
    if (bx + r > px - 5 && bx - r < px + PIPE_W + 5) {
      if (by - r < p.topH - 14 || by + r > p.topH + PIPE_GAP + 14) {
        return true
      }
    }
  }
  return false
}

function spawnScoreParticles(x, y) {
  for (let i = 0; i < 6; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 4 - 2,
      life: 40,
      maxLife: 40,
      color: Math.random() > 0.5 ? '#ffdd00' : '#ffffff'
    })
  }
}

function showDeathScreen() {
  const medal = score >= 30 ? '🥇' : score >= 15 ? '🥈' : score >= 5 ? '🥉' : '💀'
  document.getElementById('deathMedal').textContent = medal
  document.getElementById('deathScore').textContent = score
  document.getElementById('deathBest').textContent = hiScore
  deathScreen.style.display = 'flex'
}

function drawSky() {
  if (isacMode && currentBg.complete && currentBg.naturalWidth > 0) {
    ctx.drawImage(currentBg, 0, 0, W, H - GROUND_H)
  } else if (eduardoMode && eduardoBg.complete && eduardoBg.naturalWidth > 0) {
    ctx.drawImage(eduardoBg, 0, 0, W, H - GROUND_H)
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, H - GROUND_H)
    grad.addColorStop(0, '#5ec0d8')
    grad.addColorStop(1, '#a8e6f0')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H - GROUND_H)
  }
}

function drawClouds() {
  clouds.forEach(c => {
    ctx.save()
    ctx.translate(c.x, c.y)
    ctx.scale(c.s, c.s)
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.beginPath()
    ctx.arc(0, 0, 25, 0, Math.PI * 2)
    ctx.arc(28, -8, 20, 0, Math.PI * 2)
    ctx.arc(55, 0, 22, 0, Math.PI * 2)
    ctx.arc(28, 8, 22, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
}

function drawGround() {
  ctx.fillStyle = '#ded895'
  ctx.fillRect(0, H - GROUND_H, W, GROUND_H)
  ctx.fillStyle = '#5daf1b'
  ctx.fillRect(0, H - GROUND_H, W, 18)
  ctx.fillStyle = '#4a9414'
  for (let x = (groundX % 40) - 40; x < W + 40; x += 40) {
    ctx.fillRect(x, H - GROUND_H, 20, 8)
  }
}

function drawPipe(x, topH) {
  const gapTop = topH
  const gapBot = topH + PIPE_GAP

  const pipeGrad = ctx.createLinearGradient(x, 0, x + PIPE_W, 0)
  pipeGrad.addColorStop(0, '#3a9b3a')
  pipeGrad.addColorStop(0.4, '#5ecb5e')
  pipeGrad.addColorStop(1, '#2a7a2a')

  ctx.fillStyle = pipeGrad
  ctx.fillRect(x, 0, PIPE_W, gapTop - 14)

  ctx.fillStyle = '#2a7a2a'
  ctx.fillRect(x - 5, gapTop - 28, PIPE_W + 10, 28)
  ctx.fillStyle = '#5ecb5e'
  ctx.fillRect(x - 3, gapTop - 26, PIPE_W + 2, 6)

  ctx.fillStyle = pipeGrad
  ctx.fillRect(x, gapBot + 14, PIPE_W, H - GROUND_H - gapBot - 14)

  ctx.fillStyle = '#2a7a2a'
  ctx.fillRect(x - 5, gapBot, PIPE_W + 10, 28)
  ctx.fillStyle = '#5ecb5e'
  ctx.fillRect(x - 3, gapBot + 20, PIPE_W + 2, 6)
}

function drawBird() {
  ctx.save()
  ctx.translate(bird.x, bird.y)
  ctx.rotate(Math.min(Math.max(bird.rotation, -0.5), 1.2))

  ctx.beginPath()
  ctx.arc(0, 0, bird.w / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()

  ctx.drawImage(mansImg, -bird.w / 2, -bird.h / 2, bird.w, bird.h)

  ctx.restore()

  ctx.beginPath()
  ctx.arc(0, 0, bird.w / 2 + 2, 0, Math.PI * 2)
  ctx.strokeStyle = bird.flapAnim > 0 ? '#ffff00' : '#fff'
  ctx.lineWidth = 3
  ctx.stroke()
}

function updateParticles() {
  particles = particles.filter(p => p.life > 0)
  particles.forEach(p => {
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.15
    p.life--
    const a = p.life / p.maxLife
    ctx.save()
    ctx.globalAlpha = a
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
}

function loop() {
  ctx.clearRect(0, 0, W, H)
  drawSky()
  drawClouds()

  if (state === 'playing') {
    bird.vy += bird.gravity
    bird.y += bird.vy
    bird.rotation = bird.vy * 0.08
    if (bird.flapAnim > 0) bird.flapAnim--

    groundX -= PIPE_SPEED
    if (groundX < -40) groundX = 0

    clouds.forEach(c => {
      c.x -= 0.5 * c.s
      if (c.x < -80) c.x = W + 80
    })

    pipeTimer++
    if (pipeTimer >= PIPE_INTERVAL) {
      spawnPipe()
      pipeTimer = 0
    }

    pipes.forEach(p => {
      p.x -= PIPE_SPEED
      if (!p.scored && p.x + PIPE_W < bird.x) {
        p.scored = true
        score++
        scoreDisplay.textContent = score
        if (score > hiScore) {
          hiScore = score
          hiScoreDisplay.textContent = 'HI: ' + hiScore
        }
        spawnScoreParticles(bird.x + 60, bird.y)
        currentBg = currentBg === isacImg1 ? isacImg2 : isacImg1
        eduardoBg = eduardoImgs[Math.floor(Math.random() * eduardoImgs.length)]
      }
    })

    pipes = pipes.filter(p => p.x > -PIPE_W - 20)
    pipes.forEach(p => drawPipe(p.x, p.topH))

    if (checkCollision()) {
      state = 'dead'
      setTimeout(showDeathScreen, 600)
    }
  } else {
    bird.y = H / 2 + Math.sin(Date.now() / 400) * 10
    clouds.forEach(c => {
      c.x -= 0.3 * c.s
      if (c.x < -80) c.x = W + 80
    })
  }

  drawGround()
  updateParticles()
  drawBird()

  animFrame = requestAnimationFrame(loop)
}

const isacToggle = document.getElementById('isacToggle')
isacToggle.addEventListener('click', () => {
  isacMode = !isacMode
  isacToggle.classList.toggle('active', isacMode)
})

const eduardoToggle = document.getElementById('eduardoToggle')
eduardoToggle.addEventListener('click', () => {
  eduardoMode = !eduardoMode
  eduardoToggle.classList.toggle('active', eduardoMode)
})

document.getElementById('startBtn').addEventListener('click', startGame)
document.getElementById('optionsBtn').addEventListener('click', showOptions)
document.getElementById('optionsBackBtn').addEventListener('click', showMenu)
document.getElementById('restartBtn').addEventListener('click', startGame)
document.getElementById('menuBtn').addEventListener('click', showMenu)

document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault()
    flap()
  }
})

canvas.addEventListener('click', flap)
canvas.addEventListener('touchstart', e => {
  e.preventDefault()
  flap()
})

loop()