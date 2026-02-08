<template>
  <div class="role-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button v-permission="'system:role:add'" type="primary" icon="Plus" @click="handleAdd">
            新增角色
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column prop="roleName" label="角色名称"/>
        <el-table-column prop="roleKey" label="角色标识"/>
        <el-table-column prop="description" label="描述"/>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"/>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button
                v-permission="'system:role:edit'"
                type="primary"
                size="small"
                link
                icon="Edit"
                @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
                v-permission="'system:role:permission'"
                type="warning"
                size="small"
                link
                icon="Key"
                @click="handlePermission(row)"
            >
              权限
            </el-button>
            <el-button
                v-permission="'system:role:delete'"
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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'

interface Role {
  id: number
  roleName: string
  roleKey: string
  description: string
  status: number
  createTime: string
}

const tableData = ref<Role[]>([])

// 模拟获取角色列表
const getRoleList = () => {
  // 模拟数据
  const mockData: Role[] = [
    {
      id: 1,
      roleName: '超级管理员',
      roleKey: 'admin',
      description: '拥有所有权限',
      status: 1,
      createTime: '2024-01-01 10:00:00',
    },
    {
      id: 2,
      roleName: '普通用户',
      roleKey: 'user',
      description: '普通用户角色',
      status: 1,
      createTime: '2024-01-02 10:00:00',
    },
    {
      id: 3,
      roleName: '访客',
      roleKey: 'guest',
      description: '访客角色，只读权限',
      status: 1,
      createTime: '2024-01-03 10:00:00',
    },
  ]

  tableData.value = mockData
}

const handleAdd = () => {
  ElMessage.info('新增角色功能待开发')
}

const handleEdit = (row: Role) => {
  ElMessage.info(`编辑角色: ${row.roleName}`)
}

const handlePermission = (row: Role) => {
  ElMessage.info(`配置角色权限: ${row.roleName}`)
}

const handleDelete = (row: Role) => {
  ElMessageBox.confirm(`确定要删除角色 ${row.roleName} 吗？`, '提示', {
    type: 'warning',
  }).then(() => {
    ElMessage.success('删除成功')
    getRoleList()
  }).catch(() => {
    // 取消
  })
}

onMounted(() => {
  getRoleList()
})
</script>

<style scoped lang="scss">
.role-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
