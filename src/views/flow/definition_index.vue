<template>
  <div class="flow-definition-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>流程定义管理</span>
          <div class="header-actions">
            <el-button v-permission="'system:flow:def:add'" type="primary" icon="Plus" @click="handleDesign()">
              新增流程
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="流程名称">
          <el-input v-model="searchForm.flowName" placeholder="请输入流程名称" clearable />
        </el-form-item>
        <el-form-item label="流程编码">
          <el-input v-model="searchForm.flowCode" placeholder="请输入流程编码" clearable />
        </el-form-item>
        <el-form-item label="发布状态">
          <el-select v-model="searchForm.isPublish" placeholder="请选择" clearable style="width: 140px">
            <el-option
                v-for="(label, value) in PublishStatusEnum"
                :key="value"
                :label="label"
                :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table
          v-loading="loading"
          :data="tableData"
          border
          stripe
          row-key="id"
      >
        <el-table-column prop="id" label="ID" width="300" />
        <el-table-column prop="flowName" label="流程名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="flowCode" label="流程编码" width="160" show-overflow-tooltip />
        <el-table-column prop="version" label="版本" width="70" />
        <el-table-column label="发布状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.isPublish === 1 ? 'success' : 'info'" size="small">
              {{ PublishStatusEnum[row.isPublish] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="激活" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isActive === 1 ? 'success' : 'danger'" size="small">
              {{ row.isActive === 1 ? '激活' : '挂起' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="140" show-overflow-tooltip />
        <el-table-column prop="updateTime" label="更新时间" width="170" />
        <el-table-column label="操作" width="340" fixed="right">
          <template #default="{ row }">
            <el-button
                v-permission="'system:flow:def:add'"
                type="primary"
                size="small"
                link
                icon="Edit"
                @click="handleDesign(row.id, row.isPublish)"
            >
              设计
            </el-button>
            <el-button
                v-permission="'system:flow:def:add'"
                type="success"
                size="small"
                link
                icon="CopyDocument"
                @click="handleCopy(row)"
            >
              复制
            </el-button>
            <el-button
                v-if="row.isPublish !== 1"
                v-permission="'system:flow:def:edit'"
                type="warning"
                size="small"
                link
                icon="Upload"
                @click="handlePublish(row)"
            >
              发布
            </el-button>
            <el-button
                v-if="row.isPublish === 1"
                v-permission="'system:flow:def:edit'"
                type="warning"
                size="small"
                link
                icon="Download"
                @click="handleUnpublish(row)"
            >
              停用
            </el-button>
            <el-button
                v-permission="'system:flow:def:edit'"
                type="info"
                size="small"
                link
                :icon="row.isActive === 1 ? 'VideoPause' : 'VideoPlay'"
                @click="handleToggleActive(row)"
            >
              {{ row.isActive === 1 ? '挂起' : '激活' }}
            </el-button>
            <el-button
                v-permission="'system:flow:def:delete'"
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

      <!-- 分页 -->
      <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          style="margin-top: 20px; justify-content: flex-end"
          @size-change="handleSizeChange"
          @current-change="fetchData"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getFlowDefList,
  publishFlowDef,
  unpublishFlowDef,
  activeFlowDef,
  unactiveFlowDef,
  deleteFlowDef,
  copyFlowDef,
} from '@/api/flow'
import type { FlowDefVo } from '@/types/flow'
import { PublishStatusEnum } from '@/types/flow'

const router = useRouter()

// ========== 搜索 ==========
const searchForm = ref({
  flowName: '',
  flowCode: '',
  isPublish: undefined as number | undefined,
})

// ========== 分页 ==========
const pagination = ref({ page: 1, size: 10, total: 0 })

// ========== 表格 ==========
const tableData = ref<FlowDefVo[]>([])
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getFlowDefList({
      flowName: searchForm.value.flowName,
      flowCode: searchForm.value.flowCode,
      isPublish: searchForm.value.isPublish,
      current: pagination.value.page,
      size: pagination.value.size,
    })
    const list = res.data || []
    tableData.value = list
    pagination.value.total = list.length === pagination.value.size
        ? (pagination.value.page + 1) * pagination.value.size
        : (pagination.value.page - 1) * pagination.value.size + list.length
  } catch {
    ElMessage.error('获取流程定义列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.value.page = 1; fetchData() }
const handleReset = () => {
  searchForm.value = { flowName: '', flowCode: '', isPublish: undefined }
  pagination.value.page = 1
  fetchData()
}
const handleSizeChange = () => { pagination.value.page = 1; fetchData() }

// ========== 流程设计器 ==========
const handleDesign = (definitionId?: string, isPublish?: number) => {
  const query: Record<string, string> = {}
  if (definitionId) {
    query.id = definitionId
    // 已发布状态下进入设计器为只读；未发布可编辑
    if (isPublish === 1) {
      query.disabled = 'true'
    }
  }
  router.push({ path: '/flow/warmFlow', query })
}

// ========== 发布/停用 ==========
const handlePublish = async (row: FlowDefVo) => {
  try {
    await ElMessageBox.confirm(`确定发布流程「${row.flowName}」吗？`, '发布确认', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
    })
    await publishFlowDef(row.id)
    ElMessage.success('发布成功')
    await fetchData()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.message || '发布失败')
  }
}

const handleUnpublish = async (row: FlowDefVo) => {
  try {
    await ElMessageBox.confirm(`确定停用流程「${row.flowName}」吗？`, '停用确认', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
    })
    await unpublishFlowDef(row.id)
    ElMessage.success('已停用')
    await fetchData()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.message || '操作失败')
  }
}

// ========== 激活/挂起 ==========
const handleToggleActive = async (row: FlowDefVo) => {
  const isActive = row.isActive === 1
  const actionText = isActive ? '挂起' : '激活'
  try {
    await ElMessageBox.confirm(`确定${actionText}流程「${row.flowName}」吗？`, `${actionText}确认`, {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
    })
    if (isActive) {
      await unactiveFlowDef(row.id)
    } else {
      await activeFlowDef(row.id)
    }
    ElMessage.success(`已${actionText}`)
    await fetchData()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.message || '操作失败')
  }
}

// ========== 复制 ==========
const handleCopy = async (row: FlowDefVo) => {
  try {
    await ElMessageBox.confirm(`确定复制流程「${row.flowName}」吗？`, '复制确认', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'info',
    })
    await copyFlowDef(row.id)
    ElMessage.success('复制成功')
    await fetchData()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.message || '复制失败')
  }
}

// ========== 删除 ==========
const handleDelete = async (row: FlowDefVo) => {
  try {
    await ElMessageBox.confirm(`确定删除流程「${row.flowName}」吗？不可恢复。`, '删除确认', {
      confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'error',
    })
    await deleteFlowDef({ idList: [row.id] })
    ElMessage.success('删除成功')
    if (tableData.value.length === 1 && pagination.value.page > 1) pagination.value.page--
    await fetchData()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.message || '删除失败')
  }
}

onMounted(() => { fetchData() })
</script>

<style scoped lang="scss">
.flow-definition-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
