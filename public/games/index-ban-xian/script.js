// 获取画布和上下文
const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')

// 定义游戏的基本参数
const gridSize = 20
let snake = [
  {
    x: 10,
    y: 10,
    color: { light: '#4ade80', dark: '#16a34a' },
    isHead: true, // 添加标记区分蛇头
  },
]
let food = { x: 15, y: 15 }
let dx = 1
let dy = 0
let gameRunning = false // 新增变量，用于标记游戏是否正在运行
let score = 0 // 添加得分变量

// 获取按钮元素
const startButton = document.getElementById('startButton')
const pauseButton = document.getElementById('pauseButton')
const restartButton = document.getElementById('restartButton')
const scoreDisplay = document.getElementById('scoreDisplay')

// 添加速度控制相关变量
const initialSpeed = 200 // 初始速度（数值越大速度越慢）
const minSpeed = 50 // 最快速度
const speedIncrement = 5 // 每得10分减少的毫秒数
let currentSpeed = initialSpeed

// 添加暂停状态变量
let isPaused = false

// 定义蛇头的颜色
const snakeHeadColor = {
  light: '#4ade80',
  dark: '#16a34a',
}

// 删除食物颜色数组，添加随机颜色生成函数
function generateRandomColor() {
  // 生成明亮的颜色
  const hue = Math.floor(Math.random() * 360) // 随机色相
  return {
    light: `hsl(${hue}, 80%, 70%)`, // 较浅的颜色
    dark: `hsl(${hue}, 80%, 50%)`, // 较深的颜色
  }
}

// 添加当前食物颜色变量并初始化
let currentFoodColor = generateRandomColor()

// 绘制蛇
function drawSnake() {
  snake.forEach((segment, index) => {
    // 使用段的颜色创建渐变
    const gradient = ctx.createLinearGradient(
      segment.x * gridSize,
      segment.y * gridSize,
      (segment.x + 1) * gridSize,
      (segment.y + 1) * gridSize,
    )
    gradient.addColorStop(0, segment.color.light)
    gradient.addColorStop(1, segment.color.dark)
    ctx.fillStyle = gradient

    const x = segment.x * gridSize
    const y = segment.y * gridSize
    const size = gridSize - 2
    const radius = index === 0 ? 10 : 8 // 蛇头更圆一些

    // 绘制身体
    ctx.beginPath()
    ctx.roundRect(x, y, size, size, radius)
    ctx.fill()

    // 为蛇头添加特殊效果
    if (index === 0) {
      // 添加眼睛
      ctx.fillStyle = 'white'
      const eyeSize = 5 // 稍微大一点的眼睛
      const eyeInner = 3 // 眼睛内部黑色部分
      let leftEyeX, leftEyeY, rightEyeX, rightEyeY

      // 根据移动方向确定眼睛位置
      if (dx === 1) {
        // 向右
        leftEyeX = x + size - 7
        leftEyeY = y + 7
        rightEyeX = x + size - 7
        rightEyeY = y + size - 11
      } else if (dx === -1) {
        // 向左
        leftEyeX = x + 7
        leftEyeY = y + 7
        rightEyeX = x + 7
        rightEyeY = y + size - 11
      } else if (dy === -1) {
        // 向上
        leftEyeX = x + 7
        leftEyeY = y + 7
        rightEyeX = x + size - 11
        rightEyeY = y + 7
      } else {
        // 向下
        leftEyeX = x + 7
        leftEyeY = y + size - 7
        rightEyeX = x + size - 11
        rightEyeY = y + size - 7
      }

      // 绘制眼睛的白色部分
      ctx.beginPath()
      ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2)
      ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2)
      ctx.fill()

      // 绘制眼睛的黑色部分
      ctx.fillStyle = 'black'
      ctx.beginPath()
      ctx.arc(leftEyeX, leftEyeY, eyeInner, 0, Math.PI * 2)
      ctx.arc(rightEyeX, rightEyeY, eyeInner, 0, Math.PI * 2)
      ctx.fill()

      // 添加高光效果
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.beginPath()
      ctx.arc(x + size / 3, y + size / 3, size / 4, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

// 绘制食物
function drawFood() {
  const x = food.x * gridSize
  const y = food.y * gridSize
  const size = gridSize - 2

  // 使用当前选择的颜色创建渐变
  const gradient = ctx.createRadialGradient(
    x + size / 2,
    y + size / 2,
    2,
    x + size / 2,
    y + size / 2,
    size / 2,
  )
  gradient.addColorStop(0, currentFoodColor.light)
  gradient.addColorStop(1, currentFoodColor.dark)

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
  ctx.fill()

  // 添加高光效果
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.beginPath()
  ctx.arc(x + size / 3, y + size / 3, size / 6, 0, Math.PI * 2)
  ctx.fill()
}

// 修改重置游戏函数
function resetGame() {
  gameRunning = false
  isPaused = false
  snake = [
    {
      x: 10,
      y: 10,
      color: snakeHeadColor,
      isHead: true,
    },
  ]
  food = { x: 15, y: 15 }
  dx = 1
  dy = 0
  score = 0
  currentSpeed = initialSpeed
  currentFoodColor = generateRandomColor()
  scoreDisplay.textContent = score

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawFood()
  drawSnake()
}

// 修改更新速度的函数，调整速度增加的频率
function updateSpeed() {
  // 每吃5个食物减少speedIncrement毫秒，但不低于最快速度
  const newSpeed = initialSpeed - Math.floor(score / 5) * speedIncrement
  currentSpeed = Math.max(newSpeed, minSpeed)
}

// 修改移动蛇的函数
function moveSnake() {
  const head = {
    x: snake[0].x + dx,
    y: snake[0].y + dy,
    color: snakeHeadColor, // 新的头部使用蛇头颜色
    isHead: true,
  }

  if (head.x === food.x && head.y === food.y) {
    // 吃到食物时，先添加新头部
    snake[0].isHead = false // 将原来的头部标记为身体
    snake[0].color = currentFoodColor // 将原来的头部改为食物颜色
    snake.unshift(head)
    score += 1
    scoreDisplay.textContent = score
    updateSpeed()

    // 生成新的食物
    food = {
      x: Math.floor(Math.random() * (canvas.width / gridSize)),
      y: Math.floor(Math.random() * (canvas.height / gridSize)),
    }
    // 更新食物颜色
    currentFoodColor = generateRandomColor()
  } else {
    // 没吃到食物时，添加新头部并删除尾部
    snake[0].isHead = false // 将原来的头部标记为身体
    snake[0].color = snake[0].color === snakeHeadColor ? currentFoodColor : snake[0].color // 如果是第一次移动，使用食物颜色
    snake.unshift(head)
    snake.pop()
  }
}

// 检查游戏是否结束
function checkGameOver() {
  const head = snake[0]
  if (
    head.x < 0 ||
    head.x >= canvas.width / gridSize ||
    head.y < 0 ||
    head.y >= canvas.height / gridSize
  ) {
    return true // 蛇撞到墙壁
  }
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true // 蛇撞到自己
    }
  }
  return false
}

// 修改游戏主循环
function gameLoop() {
  if (!gameRunning || isPaused) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  moveSnake()
  if (checkGameOver()) {
    alert('游戏结束！\n得分：' + score)
    resetGame()
    return
  }
  drawFood()
  drawSnake()
  setTimeout(gameLoop, currentSpeed)
}

// 监听键盘事件，控制蛇的移动方向
document.addEventListener('keydown', function (event) {
  if (!gameRunning || isPaused) return // 如果游戏未运行或暂停，不处理键盘事件
  if (event.key === 'ArrowUp' && dy !== 1) {
    dx = 0
    dy = -1
  } else if (event.key === 'ArrowDown' && dy !== -1) {
    dx = 0
    dy = 1
  } else if (event.key === 'ArrowLeft' && dx !== 1) {
    dx = -1
    dy = 0
  } else if (event.key === 'ArrowRight' && dx !== -1) {
    dx = 1
    dy = 0
  }
})

// 添加暂停按钮点击事件
pauseButton.addEventListener('click', function () {
  if (gameRunning) {
    isPaused = !isPaused // 切换暂停状态
    if (!isPaused) {
      // 如果从暂停恢复，重新开始游戏循环
      gameLoop()
    }
    // 更新按钮文本
    pauseButton.textContent = isPaused ? '继续游戏' : '暂停游戏'
  }
})

// 修改开始游戏按钮点击事件
startButton.addEventListener('click', function () {
  if (!gameRunning) {
    gameRunning = true
    isPaused = false // 确保游戏开始时不是暂停状态
    pauseButton.textContent = '暂停游戏' // 重置暂停按钮文本
    gameLoop()
  }
})

// 修改重新开始按钮点击事件
restartButton.addEventListener('click', function () {
  resetGame()
  gameRunning = true
  isPaused = false // 确保重新开始时不是暂停状态
  pauseButton.textContent = '暂停游戏' // 重置暂停按钮文本
  gameLoop()
})
