<template>
  <div class="dashboard-container">
    <!-- 头部欢迎区域 -->
    <el-row :gutter="20" class="welcome-section">
      <el-col :span="16">
        <el-card class="welcome-card">
          <div class="welcome-content">
            <h2 class="welcome-title">欢迎回来，{{ userInfo?.username || '管理员' }} 👋</h2>
            <p class="welcome-subtitle">祝您工作愉快！</p>
            <div class="weather-info">
              <el-icon>
                <Sunny/>
              </el-icon>
              <span>晴朗 • 25°C</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="date-card">
          <div class="date-display">
            <div class="date-main">{{ currentDay }}</div>
            <div class="date-sub">{{ currentMonthYear }}</div>
            <div class="date-week">{{ currentWeek }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="main-content">
      <!-- 日历组件 -->
      <el-card class="calendar-card">
        <template #header>
          <div class="card-header">
            <span>📅 日历</span>
            <el-button link type="primary" @click="handleToday">今天</el-button>
          </div>
        </template>
        <el-calendar v-model="calendarDate" class="custom-calendar" controller-type="select">
          <template #date-cell="{ data }">
            <div class="calendar-day" :class="{ 'is-selected': data.isSelected }">
              <div class="day-number">{{ data.day.split('-')[2] }}</div>
              <div class="day-events">
                <span
                    v-for="event in getEventsForDate(data.date)"
                    :style="{
                      color: event.color,
                      maxWidth: '80px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'inline-block'
                    }"
                    :title="event.title"
                >
                  {{ event.title }}
                </span>
                <!--                <div-->

                <!--                    :key="event.id"-->
                <!--                    class="event-dot"-->
                <!--                    -->
                <!--                    :title="event.title"-->
                <!--                ></div>-->
              </div>
            </div>
          </template>
        </el-calendar>
      </el-card>
    </el-row>
    <!-- 技术栈 -->
    <el-row :gutter="20" class="main-content">
      <el-col :span="14">
        <!-- 技术栈信息 -->
        <el-card class="info-card">
          <template #header>
            <span>💻 技术栈</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="系统名称">{{ getAppTitle() }}</el-descriptions-item>
            <el-descriptions-item label="版本号">v1.0.0</el-descriptions-item>
            <el-descriptions-item label="前端框架">Vue ^3.5.24 + TypeScript</el-descriptions-item>
            <el-descriptions-item label="UI框架">Element Plus ^2.13.2</el-descriptions-item>
            <el-descriptions-item label="构建工具">Vite ^7.2.4</el-descriptions-item>
            <el-descriptions-item label="状态管理">Pinia</el-descriptions-item>
            <el-descriptions-item label="路由管理">Vue Router ^5.0.2</el-descriptions-item>
            <el-descriptions-item label="HTTP客户端">Axios ^1.13.4</el-descriptions-item>
            <el-descriptions-item label="开发环境">Node.js v22.20.0</el-descriptions-item>
            <el-descriptions-item label="包管理器">pnpm 10.28.2</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- WebSocket 测试 -->
      <el-col :span="10">
        <el-card class="ws-card">
          <template #header>
            <div class="card-header">
              <span>🔌 WebSocket 测试</span>
              <el-tag :type="wsConnected ? 'success' : 'danger'" size="small">
                {{ wsConnected ? '已连接' : '未连接' }}
              </el-tag>
            </div>
          </template>
          <div class="ws-test-area">
            <!-- 消息记录 -->
            <div ref="msgBoxRef" class="ws-message-box">
              <div v-if="messages.length === 0" class="ws-empty">暂无消息，试试发送一条吧~</div>
              <div
                  v-for="(msg, index) in messages"
                  :key="index"
                  class="ws-message-item"
                  :class="msg.type"
              >
                <span class="ws-msg-time">{{ msg.time }}</span>
                <span class="ws-msg-tag">{{ msg.type === 'sent' ? '发送' : '接收' }}</span>
                <span class="ws-msg-text">{{ msg.content }}</span>
              </div>
            </div>
            <!-- 发送区域 -->
            <div class="ws-send-area">
              <el-input
                  v-model="inputMsg"
                  placeholder="输入消息内容..."
                  clearable
                  @keyup.enter="handleSend"
              >
                <template #append>
                  <el-button
                      type="primary"
                      :disabled="!wsConnected"
                      :loading="sending"
                      @click="handleSend"
                  >
                    发送
                  </el-button>
                </template>
              </el-input>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onUnmounted, nextTick} from 'vue'
import {useUserStore} from '@/store/user'
import {getAppTitle} from '@/utils/env.ts'
import {wsService} from '@/utils/websocket'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 日期相关
const calendarDate = ref(new Date())

const currentDay = computed(() => {
  const now = new Date()
  return now.getDate().toString().padStart(2, '0')
})

const currentMonthYear = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short'
  })
})

const currentWeek = computed(() => {
  const now = new Date()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[now.getDay()]
})

// 日历事件数据
const calendarEvents = ref([
  {id: 1, date: '2026-02-10', title: '项目会议', color: '#409eff'},
  {id: 2, date: '2026-02-12', title: '需求评审fasdfasdfasdfasdfa', color: '#67c23a'},
  {id: 3, date: '2026-02-15', title: '代码发布', color: '#e6a23c'},
  {id: 4, date: '2026-02-18', title: '团队聚餐', color: '#f56c6c'},
])

const getEventsForDate = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0]
  return calendarEvents.value.filter(event => event.date === dateStr)
}

const handleToday = () => {
  calendarDate.value = new Date()
}

// ===== WebSocket 测试 =====
interface WsMessage {
  time: string
  type: 'sent' | 'received'
  content: string
}

const messages = ref<WsMessage[]>([])
const inputMsg = ref('')
const sending = ref(false)
const wsConnected = ref(false)
const msgBoxRef = ref<HTMLElement | null>(null)
let unregisterHandler: (() => void) | null = null

// 格式化时间
const formatTime = () => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
}

// 添加消息并滚动到底部
const addMessage = (msg: WsMessage) => {
  messages.value.push(msg)
  nextTick(() => {
    if (msgBoxRef.value) {
      msgBoxRef.value.scrollTop = msgBoxRef.value.scrollHeight
    }
  })
}

// 发送消息
const handleSend = () => {
  const text = inputMsg.value.trim()
  if (!text || !wsConnected.value) return

  sending.value = true
  try {
    wsService.send(text)
    addMessage({ time: formatTime(), type: 'sent', content: text })
    inputMsg.value = ''
  } catch (e) {
    console.error('发送失败:', e)
  } finally {
    sending.value = false
  }
}

// 轮询检测连接状态
let statusTimer: ReturnType<typeof setInterval> | null = null

const checkStatus = () => {
  wsConnected.value = wsService.isConnected
}

onMounted(() => {
  // 初始状态
  checkStatus()

  // 定时刷新连接状态
  statusTimer = setInterval(checkStatus, 1000)

  // 注册消息接收
  unregisterHandler = wsService.onMessage((data) => {
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    addMessage({ time: formatTime(), type: 'received', content })
  })

  console.log('仪表板已加载')
})

onUnmounted(() => {
  if (statusTimer) clearInterval(statusTimer)
  if (unregisterHandler) unregisterHandler()
})
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);

  // 欢迎区域
  .welcome-section {
    margin-bottom: 20px;

    .welcome-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;

      :deep(.el-card__body) {
        padding: 30px;
      }

      .welcome-content {
        .welcome-title {
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 10px 0;
        }

        .welcome-subtitle {
          font-size: 16px;
          opacity: 0.9;
          margin: 0 0 20px 0;
        }

        .weather-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          opacity: 0.8;
        }
      }
    }

    .date-card {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      border: none;
      height: 100%;

      :deep(.el-card__body) {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 20px;
      }

      .date-display {
        text-align: center;

        .date-main {
          font-size: 48px;
          font-weight: 700;
          line-height: 1;
          margin-bottom: 5px;
        }

        .date-sub {
          font-size: 18px;
          opacity: 0.9;
          margin-bottom: 5px;
        }

        .date-week {
          font-size: 16px;
          opacity: 0.8;
        }
      }
    }
  }

  // 主要内容区域
  .main-content {
    margin-bottom: 20px;

    // 日历卡片
    .calendar-card {
      margin-bottom: 20px;
      border-radius: 12px;
      overflow: hidden;

      :deep(.el-card__header) {
        background: #f8f9fa;
        border-bottom: 1px solid #ebeef5;
        padding: 16px 20px;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
      }

      .custom-calendar {
        :deep(.el-calendar-table .el-calendar-day) {
          height: 60px;
        }

        .calendar-day {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;

          &.is-selected {
            background-color: #ecf5ff;
            border-radius: 4px;
          }

          .day-number {
            font-size: 14px;
            margin-bottom: 4px;
          }

          .day-events {
            display: flex;
            width: 100%;
            gap: 2px;

            .event-dot {
              border-radius: 50%;
            }
          }
        }
      }
    }

    // 信息卡片
    .info-card {
      margin-bottom: 20px;
      border-radius: 12px;

      :deep(.el-card__header) {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        font-weight: 600;
      }

      :deep(.el-descriptions__label) {
        font-weight: 500;
      }
    }

    // WebSocket 测试卡片
    .ws-card {
      margin-bottom: 20px;
      border-radius: 12px;

      :deep(.el-card__header) {
        background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
        color: white;
        border: none;
        font-weight: 600;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .ws-test-area {
        .ws-message-box {
          height: 240px;
          overflow-y: auto;
          border: 1px solid #ebeef5;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
          background: #fafafa;

          .ws-empty {
            color: #909399;
            text-align: center;
            padding-top: 90px;
            font-size: 13px;
          }

          .ws-message-item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            padding: 6px 0;
            font-size: 13px;
            font-family: 'Consolas', 'Monaco', monospace;

            + .ws-message-item {
              border-top: 1px dashed #ebeef5;
            }

            .ws-msg-time {
              color: #909399;
              white-space: nowrap;
              min-width: 70px;
            }

            .ws-msg-tag {
              display: inline-block;
              padding: 1px 6px;
              border-radius: 3px;
              font-size: 11px;
              white-space: nowrap;
              min-width: 32px;
              text-align: center;
            }

            .ws-msg-text {
              color: #303133;
              word-break: break-all;
              flex: 1;
            }

            &.sent {
              .ws-msg-tag {
                background: #ecf5ff;
                color: #409eff;
              }
            }

            &.received {
              .ws-msg-tag {
                background: #f0f9eb;
                color: #67c23a;
              }
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .dashboard-container {
    .welcome-section {
      .welcome-card {
        .welcome-content {
          .welcome-title {
            font-size: 24px;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 15px;

    .welcome-section {
      .el-col {
        width: 100% !important;
        margin-bottom: 15px;
      }
    }

    .main-content {
      .el-col {
        width: 100% !important;
        margin-bottom: 15px;
      }
    }
  }
}
</style>
