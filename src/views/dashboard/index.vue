<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <el-icon class="stat-icon" color="#409eff">
              <User/>
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">1,234</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <el-icon class="stat-icon" color="#67c23a">
              <Document/>
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">567</div>
              <div class="stat-label">订单数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <el-icon class="stat-icon" color="#e6a23c">
              <TrendCharts/>
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">¥89,234</div>
              <div class="stat-label">销售额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <el-icon class="stat-icon" color="#f56c6c">
              <ChatDotRound/>
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">123</div>
              <div class="stat-label">消息数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>快捷操作</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" icon="Plus">新增用户</el-button>
            <el-button type="success" icon="DocumentAdd">新增订单</el-button>
            <el-button type="warning" icon="Download">导出数据</el-button>
            <el-button type="info" icon="Setting">系统设置</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>系统信息</span>
          </template>
          <el-descriptions :column="1">
            <el-descriptions-item label="系统名称">Vue Admin</el-descriptions-item>
            <el-descriptions-item label="版本号">v1.0.0</el-descriptions-item>
            <el-descriptions-item label="框架">Vue 3 + TypeScript</el-descriptions-item>
            <el-descriptions-item label="UI框架">Element Plus</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-row style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>最近活动</span>
          </template>
          <el-timeline>
            <el-timeline-item timestamp="2024-02-04 10:30" placement="top">
              <el-card>
                <h4>用户张三登录系统</h4>
                <p>来自 IP: 192.168.1.100</p>
              </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2024-02-04 09:15" placement="top">
              <el-card>
                <h4>管理员修改了系统配置</h4>
                <p>更新了邮件服务器设置</p>
              </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2024-02-03 18:45" placement="top">
              <el-card>
                <h4>新增了5个用户</h4>
                <p>批量导入完成</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.dashboard-container {
  .stat-card {
    .stat-item {
      display: flex;
      align-items: center;
      gap: 20px;

      .stat-icon {
        font-size: 48px;
      }

      .stat-info {
        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 14px;
          color: #999;
        }
      }
    }
  }

  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>
