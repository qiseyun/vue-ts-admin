<template>
  <div class="menu-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>权限管理</span>
          <el-button v-permission="'system:menu:add'" type="primary" icon="Plus" @click="handleAdd">
            新增菜单
          </el-button>
        </div>
      </template>

      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" icon="Search" @click="getMenuList">刷新</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" border row-key="id" :stripe="true">
        <el-table-column prop="name" label="菜单名称" width="250"/>
        <el-table-column prop="permission" label="权限标识">
          <template #default="{ row }">
            <span
                v-if="row.permission"
                @click="copyText(row.permission)"
                :title="'点击复制 ' + row.permission"
            >
              {{ row.permission }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="菜单类型" width="90">
          <template #default="{ row }">
            <el-tag :type="row.type === 0 ? 'primary' : row.type === 1 ? 'success' : 'warning'">
              {{ row.type === 0 ? '页面' : row.type === 1 ? '组件' : '接口' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="70">
          <template #default="{ row }">
            <el-tag :type="row.keepAlive === 0 ? 'success' : 'info'">
              {{ row.keepAlive === 0 ? '开启' : '关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
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
import {getMenuTree} from '@/api/sys_menu'
import type {SysMenuListVo} from '@/types/sys_menu'
import {copyText} from "@/utils/common_utils.ts";

// 使用后端返回的数据结构
interface MenuItem extends SysMenuListVo {
  // 可以在这里添加前端需要的额外字段
}

const tableData = ref<MenuItem[]>([])
const loading = ref(false)

// 获取菜单列表
const getMenuList = async () => {
  loading.value = true
  try {
    const res = await getMenuTree({id: 0})
    tableData.value = res.data || []
  } catch (error) {
    console.error('获取菜单列表失败:', error)
    ElMessage.error('获取菜单列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  ElMessage.info('新增菜单功能待开发')
}

const handleEdit = (row: MenuItem) => {
  ElMessage.info(`编辑菜单: ${row.name}`)
}

const handleDelete = (row: MenuItem) => {
  ElMessageBox.confirm(`确定要删除菜单 ${row.name} 吗？`, '提示', {
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
