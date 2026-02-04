<template>
  <div class="user-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button v-permission="'system:user:add'" type="primary" icon="Plus" @click="handleAdd">
            新增用户
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-permission="'system:user:edit'"
              type="primary"
              size="small"
              link
              icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-permission="'system:user:delete'"
              type="danger"
              size="small"
              link
              icon="Delete"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="handleSearch"
        @current-change="handleSearch"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface User {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  status: number
  createTime: string
}

const searchForm = ref({
  username: '',
})

const pagination = ref({
  page: 1,
  size: 10,
  total: 0,
})

const tableData = ref<User[]>([])

// 模拟获取用户列表
const getUserList = () => {
  // 模拟数据
  const mockData: User[] = [
    {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      email: 'admin@example.com',
      phone: '13800138000',
      status: 1,
      createTime: '2024-01-01 10:00:00',
    },
    {
      id: 2,
      username: 'user1',
      nickname: '用户1',
      email: 'user1@example.com',
      phone: '13800138001',
      status: 1,
      createTime: '2024-01-02 10:00:00',
    },
    {
      id: 3,
      username: 'user2',
      nickname: '用户2',
      email: 'user2@example.com',
      phone: '13800138002',
      status: 0,
      createTime: '2024-01-03 10:00:00',
    },
  ]

  tableData.value = mockData
  pagination.value.total = mockData.length
}

const handleSearch = () => {
  getUserList()
}

const handleReset = () => {
  searchForm.value.username = ''
  pagination.value.page = 1
  getUserList()
}

const handleAdd = () => {
  ElMessage.info('新增用户功能待开发')
}

const handleEdit = (row: User) => {
  ElMessage.info(`编辑用户: ${row.username}`)
}

const handleDelete = (row: User) => {
  ElMessageBox.confirm(`确定要删除用户 ${row.username} 吗？`, '提示', {
    type: 'warning',
  }).then(() => {
    ElMessage.success('删除成功')
    getUserList()
  }).catch(() => {
    // 取消
  })
}

onMounted(() => {
  getUserList()
})
</script>

<style scoped lang="scss">
.user-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
