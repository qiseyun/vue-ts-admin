<template>
  <div class="login-container">
    <canvas id="canvas" class="canvas-bg"></canvas>
    <div class="login-box">
      <div class="login-title">
        <h2>{{ getAppTitle() }}</h2>
        <p>Vue3 + TypeScript + Element Plus</p>
      </div>
      <el-form ref="loginFormRef" :model="loginForm" :rules="rules" class="login-form">
        <el-form-item prop="username">
          <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              size="large"
              show-password
              @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import {reactive, ref, onMounted, onUnmounted} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage, type FormInstance, type FormRules} from 'element-plus'
import {useUserStore} from '@/store/user'
import type {LoginForm} from '@/types/auth.ts'
import {login as loginApi} from '@/api/auth'
import {getAppTitle} from "@/utils/env.ts";

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: [{required: true, message: '请输入用户名', trigger: 'blur'}],
  password: [{required: true, message: '请输入密码', trigger: 'blur'}],
}

// 登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      // 调用登录接口
      const res = await loginApi(loginForm)

      // 存储token和过期时间
      await userStore.login(res.data.accessToken, res.data.expiresTime)

      ElMessage.success('登录成功')
      await router.push('/')
    } catch (error) {
      ElMessage.error('登录失败')
      console.error(error)
    } finally {
      loading.value = false
    }
  })
}

// 动态线条背景
let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null
let points: Array<{ x: number; y: number; vx: number; vy: number }> = []
let animationId: number

const initCanvas = () => {
  canvas = document.getElementById('canvas') as HTMLCanvasElement
  if (!canvas) return

  ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置canvas尺寸
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // 创建点 - 增加数量使效果更明显
  const pointCount = 120
  for (let i = 0; i < pointCount; i++) {
    points.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.0, // 增加速度使运动更活跃
      vy: (Math.random() - 0.5) * 1.0,
    })
  }

  animate()
}

const animate = () => {
  if (!canvas || !ctx) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 更新点的位置
  points.forEach(point => {
    point.x += point.vx
    point.y += point.vy

    // 边界反弹
    if (point.x < 0 || point.x > canvas!.width) point.vx *= -1
    if (point.y < 0 || point.y > canvas!.height) point.vy *= -1

    // 绘制点 - 使用蓝粉色使颜色更明显
    ctx!.beginPath()
    ctx!.arc(point.x, point.y, 3, 0, Math.PI * 2) // 增大点半径
    ctx!.fillStyle = 'rgba(255, 105, 180, 0.8)' // 粉色点
    ctx!.fill()
  })

  // 绘制连线 - 扩大连接范围并增强视觉效果
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const pointI = points[i]
      const pointJ = points[j]
      if (!pointI || !pointJ) continue

      const dx = pointI.x - pointJ.x
      const dy = pointI.y - pointJ.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 200) { // 增大连接距离
        ctx!.beginPath()
        ctx!.moveTo(pointI.x, pointI.y)
        ctx!.lineTo(pointJ.x, pointJ.y)
        // 使用蓝粉色渐变效果
        const opacity = 0.3 * (1 - distance / 200)
        ctx!.strokeStyle = `rgba(65, 105, 225, ${opacity})` // 蓝色连线
        ctx!.lineWidth = 1.5 // 增加线宽
        ctx!.stroke()
      }
    }
  }

  animationId = requestAnimationFrame(animate)
}

const handleResize = () => {
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

onMounted(() => {
  initCanvas()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #ff758c 100%); /* 蓝粉渐变 */
  display: flex;
  align-items: center;
  justify-content: center;

  .canvas-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .login-box {
    position: relative;
    z-index: 2;
    width: 420px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);

    .login-title {
      text-align: center;
      margin-bottom: 30px;

      h2 {
        font-size: 28px;
        font-weight: bold;
        color: #333;
        margin: 0 0 10px 0;
      }

      p {
        font-size: 14px;
        color: #999;
        margin: 0;
      }
    }

    .login-form {
      .login-btn {
        width: 100%;
        margin-top: 10px;
      }
    }
  }
}
</style>