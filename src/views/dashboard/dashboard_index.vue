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

    <!-- 主要内容区域 -->
    <el-row :gutter="20" class="main-content">
      <!-- 左侧：日历和快捷操作 -->
      <el-col :span="10">
        <!-- 日历组件 -->
        <el-card class="calendar-card">
          <template #header>
            <div class="card-header">
              <span>📅 日历</span>
              <el-button link type="primary" @click="handleToday">今天</el-button>
            </div>
          </template>
          <el-calendar v-model="calendarDate" class="custom-calendar">
            <template #date-cell="{ data }">
              <div class="calendar-day" :class="{ 'is-selected': data.isSelected }">
                <div class="day-number">{{ data.day.split('-')[2] }}</div>
                <div class="day-events">
                  <div
                      v-for="event in getEventsForDate(data.date)"
                      :key="event.id"
                      class="event-dot"
                      :style="{ backgroundColor: event.color }"
                      :title="event.title"
                  ></div>
                </div>
              </div>
            </template>
          </el-calendar>
        </el-card>
      </el-col>

      <!-- 右侧：系统信息和最近活动 -->
      <el-col :span="14">
        <!-- 系统信息 -->
        <el-card class="info-card">
          <template #header>
            <span>💻 系统信息</span>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="系统名称">{{ getAppTitle() }}</el-descriptions-item>
            <el-descriptions-item label="版本号">v1.0.0</el-descriptions-item>
            <el-descriptions-item label="前端框架">Vue 3.4 + TypeScript</el-descriptions-item>
            <el-descriptions-item label="UI框架">Element Plus 2.5</el-descriptions-item>
            <el-descriptions-item label="构建工具">Vite 5.0</el-descriptions-item>
            <el-descriptions-item label="状态管理">Pinia</el-descriptions-item>
            <el-descriptions-item label="路由管理">Vue Router 4</el-descriptions-item>
            <el-descriptions-item label="HTTP客户端">Axios</el-descriptions-item>
            <el-descriptions-item label="开发环境">Node.js 18+</el-descriptions-item>
            <el-descriptions-item label="包管理器">pnpm</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import {useUserStore} from '@/store/user'
import {getAppTitle} from '@/utils/env.ts'


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
  {id: 2, date: '2026-02-12', title: '需求评审', color: '#67c23a'},
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

onMounted(() => {
  // 可以在这里初始化数据或调用API获取实时数据
  console.log('仪表板已加载')
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
            gap: 2px;

            .event-dot {
              width: 6px;
              height: 6px;
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
