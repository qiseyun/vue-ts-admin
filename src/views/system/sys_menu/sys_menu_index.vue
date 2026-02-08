<template>
  <div class="menu-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>菜单管理</span>
          <el-button v-permission="'system:menu:add'" type="primary" icon="Plus" @click="handleAdd">
            新增菜单
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" border row-key="id" default-expand-all>
        <el-table-column prop="title" label="菜单名称" width="200"/>
        <el-table-column prop="path" label="路由路径"/>
        <el-table-column prop="component" label="组件路径"/>
        <el-table-column prop="icon" label="图标" width="100"/>
        <el-table-column prop="sort" label="排序" width="80"/>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
                v-permission="'system:menu:edit'"
                type="primary"
                size="small"
                link
                icon="Edit"
                @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
                v-permission="'system:menu:delete'"
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
import {onMounted, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'

interface Menu {
  id: number
  title: string
  path: string
  component: string
  icon: string
  sort: number
  status: number
  children?: Menu[]
}

const tableData = ref<Menu[]>([])

// 模拟获取菜单列表
const getMenuList = () => {
  // 模拟数据
  tableData.value = [
    {
      id: 1,
      title: '首页',
      path: '/dashboard',
      component: 'views/dashboard/index',
      icon: 'HomeFilled',
      sort: 1,
      status: 1,
    },
    {
      id: 2,
      title: '系统管理',
      path: '/system',
      component: 'Layout',
      icon: 'Setting',
      sort: 2,
      status: 1,
      children: [
        {
          id: 3,
          title: '用户管理',
          path: '/system/user',
          component: 'views/system/user/index',
          icon: 'User',
          sort: 1,
          status: 1,
        },
        {
          id: 4,
          title: '角色管理',
          path: '/system/role',
          component: 'views/system/role/index',
          icon: 'Avatar',
          sort: 2,
          status: 1,
        },
        {
          id: 5,
          title: '菜单管理',
          path: '/system/menu',
          component: 'views/system/menu/index',
          icon: 'Menu',
          sort: 3,
          status: 1,
        },
      ],
    },
  ]
}

const handleAdd = () => {
  ElMessage.info('新增菜单功能待开发')
}

const handleEdit = (row: Menu) => {
  ElMessage.info(`编辑菜单: ${row.title}`)
}

const handleDelete = (row: Menu) => {
  ElMessageBox.confirm(`确定要删除菜单 ${row.title} 吗？`, '提示', {
    type: 'warning',
  }).then(() => {
    ElMessage.success('删除成功')
    getMenuList()
  }).catch(() => {
    // 取消
  })
}

onMounted(() => {
  getMenuList()
})
</script>

<style scoped lang="scss">
.menu-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
