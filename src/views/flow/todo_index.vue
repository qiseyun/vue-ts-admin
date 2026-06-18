<template>
  <div class="flow-todo-container">
    <el-card>
      <template #header>
        <span>我的待办</span>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="流程编码">
          <el-input v-model="searchForm.flowCode" placeholder="请输入流程编码" clearable />
        </el-form-item>
        <el-form-item label="流程状态">
          <el-select v-model="searchForm.flowStatus" placeholder="请选择" clearable style="width: 140px">
            <el-option
                v-for="(label, value) in FlowStatusEnum"
                :key="value"
                :label="label"
                :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table v-loading="loading" :data="tableData" border stripe row-key="id">
        <el-table-column prop="id" label="ID" width="300" />
        <el-table-column prop="flowName" label="流程名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="nodeName" label="当前节点" width="140" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.flowStatus)" size="small">
              {{ FlowStatusEnum[row.flowStatus] || row.flowStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="到达时间" width="170" />
        <el-table-column label="操作" width="420" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'system:flow:task:approve'" type="success" size="small" @click="handlePass(row)">
              通过
            </el-button>
            <el-button v-permission="'system:flow:task:approve'" type="danger" size="small" @click="handleReject(row)">
              驳回
            </el-button>
            <el-button v-permission="'system:flow:task:approve'" type="warning" size="small" @click="handleTransfer(row)">
              转办
            </el-button>
            <el-button v-permission="'system:flow:task:approve'" type="info" size="small" @click="handleDepute(row)">
              委派
            </el-button>
            <el-button v-permission="'system:flow:task:approve'" type="danger" size="small" plain @click="handleTermination(row)">
              终止
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
          @size-change="handleSizeChange"
          @current-change="fetchData"
      />
    </el-card>

    <!-- 操作弹窗（通过/驳回/转办/委派/终止共用） -->
    <el-dialog v-model="actionDialogVisible" :title="actionDialogTitle" width="520px" :close-on-click-modal="false">
      <el-form ref="actionFormRef" :model="actionForm" label-width="100px">
        <!-- 转办/委派：指定处理人 -->
        <el-form-item
            v-if="actionType === 'transfer' || actionType === 'depute'"
            label="目标处理人"
            prop="addHandlers"
        >
          <el-input v-model="actionHandlersInput" placeholder="多个用逗号分隔，如 user:zhangsan,user:lisi" />
        </el-form-item>
        <!-- 审批意见 -->
        <el-form-item label="审批意见">
          <el-input
              v-model="actionForm.message"
              placeholder="请输入审批意见"
              type="textarea" :rows="3" maxlength="500" show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="actionDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="actionLoading" @click="handleActionSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getMyTodoList,
  passTask,
  rejectTask,
  transferTask,
  deputeTask,
  terminationTask,
} from '@/api/flow'
import type { FlowTaskVo, FlowActionDto } from '@/types/flow'
import { FlowStatusEnum } from '@/types/flow'

// ========== 搜索 ==========
const searchForm = ref({ flowCode: '', flowStatus: '' })
const pagination = ref({ page: 1, size: 10, total: 0 })
const tableData = ref<FlowTaskVo[]>([])
const loading = ref(false)

const getStatusType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    toDo: 'primary',
    pass: 'success',
    reject: 'danger',
    complete: 'success',
    termination: 'danger',
  }
  return map[status] || 'info'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getMyTodoList({
      flowCode: searchForm.value.flowCode,
      flowStatus: searchForm.value.flowStatus,
      current: pagination.value.page,
      size: pagination.value.size,
    })
    const list = res.data || []
    tableData.value = list
    pagination.value.total = list.length === pagination.value.size
        ? (pagination.value.page + 1) * pagination.value.size
        : (pagination.value.page - 1) * pagination.value.size + list.length
  } catch {
    ElMessage.error('获取待办列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.value.page = 1; fetchData() }
const handleReset = () => {
  searchForm.value = { flowCode: '', flowStatus: '' }
  pagination.value.page = 1
  fetchData()
}
const handleSizeChange = () => { pagination.value.page = 1; fetchData() }

// ========== 操作弹窗 ==========
const actionDialogVisible = ref(false)
const actionDialogTitle = ref('')
const actionType = ref<'pass' | 'reject' | 'transfer' | 'depute' | 'termination'>('pass')
const actionLoading = ref(false)
const actionFormRef = ref()
const currentTask = ref<FlowTaskVo | null>(null)
const actionHandlersInput = ref('')

const actionForm = ref({
  message: '',
})

const titleMap: Record<string, string> = {
  pass: '审批通过',
  reject: '审批驳回',
  transfer: '转办',
  depute: '委派',
  termination: '终止流程',
}

const openActionDialog = (row: FlowTaskVo, type: typeof actionType.value) => {
  currentTask.value = row
  actionType.value = type
  actionDialogTitle.value = `${titleMap[type]} - ${row.flowName || ''}`
  actionForm.value = { message: '' }
  actionHandlersInput.value = ''
  actionDialogVisible.value = true
  setTimeout(() => actionFormRef.value?.clearValidate(), 0)
}

const handlePass = (row: FlowTaskVo) => openActionDialog(row, 'pass')
const handleReject = (row: FlowTaskVo) => openActionDialog(row, 'reject')
const handleTransfer = (row: FlowTaskVo) => openActionDialog(row, 'transfer')
const handleDepute = (row: FlowTaskVo) => openActionDialog(row, 'depute')
const handleTermination = (row: FlowTaskVo) => openActionDialog(row, 'termination')

const handleActionSubmit = async () => {
  if (!currentTask.value) return
  actionLoading.value = true
  try {
    const taskId = currentTask.value.id
    const data: FlowActionDto = {
      taskId,
      skipType: actionType.value.toUpperCase(),
      message: actionForm.value.message,
    }

    // 转办/委派需要 addHandlers
    if (actionType.value === 'transfer' || actionType.value === 'depute') {
      if (!actionHandlersInput.value.trim()) {
        ElMessage.warning('请输入目标处理人')
        actionLoading.value = false
        return
      }
      data.addHandlers = actionHandlersInput.value.split(',').map(s => s.trim()).filter(Boolean)
    }

    switch (actionType.value) {
      case 'pass':
        data.skipType = 'PASS'
        await passTask(data)
        break
      case 'reject':
        data.skipType = 'REJECT'
        await rejectTask(data)
        break
      case 'transfer':
        data.skipType = 'TRANSFER'
        await transferTask(data)
        break
      case 'depute':
        data.skipType = 'DEPUTE'
        await deputeTask(data)
        break
      case 'termination':
        data.skipType = 'TERMINATION'
        await terminationTask(data)
        break
    }
    ElMessage.success('操作成功')
    actionDialogVisible.value = false
    await fetchData()
  } catch (e: any) {
    if (e?.message) ElMessage.error(e.message)
  } finally {
    actionLoading.value = false
  }
}

onMounted(() => { fetchData() })
</script>

<style scoped lang="scss">
.flow-todo-container {
  .dialog-footer { text-align: right; }
}
</style>
