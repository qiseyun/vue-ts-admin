<template>
  <div class="region-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>城市地区管理</span>
        </div>
      </template>

      <!-- Loading动画 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton animated>
          <template #template>
            <el-skeleton-item variant="text" style="width: 30%"/>
            <el-skeleton-item variant="text" style="width: 50%"/>
            <el-skeleton-item variant="text" style="width: 70%"/>
            <el-skeleton-item variant="text" style="width: 40%"/>
            <el-skeleton-item variant="text" style="width: 60%"/>
          </template>
        </el-skeleton>
      </div>

      <!-- 数据表格 -->
      <el-table
          v-show="!loading"
          :data="tableData"
          border
          row-key="id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" label="地区名称" width="300"/>
        <el-table-column prop="zip" label="邮编" width="150"/>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {ElMessage} from 'element-plus'
import {getRegionTree} from '@/api/region'
import type {RegionTreeVO} from '@/types/region'

const tableData = ref<RegionTreeVO[]>([])
const loading = ref<boolean>(true)

// 获取地区列表
const getRegionList = async () => {
  loading.value = true
  try {
    const res = await getRegionTree()
    tableData.value = res.data || []
  } catch (error) {
    console.error('获取地区列表失败:', error)
    ElMessage.error('获取地区列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getRegionList()
})
</script>

<style scoped lang="scss">
.region-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .loading-container {
    padding: 20px 0;
  }
}
</style>