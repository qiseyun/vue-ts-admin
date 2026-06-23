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
        <el-table-column label="操作" width="520" fixed="right">
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
            <el-button v-permission="'system:flow:task:approve'" type="primary" size="small" plain @click="handleAddSignature(row)">
              加签
            </el-button>
            <el-button v-permission="'system:flow:task:approve'" type="warning" size="small" plain @click="handleReductionSignature(row)">
              减签
            </el-button>
            <el-button v-permission="'system:flow:task:approve'" type="danger" size="small" plain @click="handleTermination(row)">
              终止
            </el-button>
            <el-button v-permission="'system:flow:task:approve'" type="info" size="small" plain @click="handleRevoke(row)">
              撤销
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

    <!-- 操作弹窗（通过/驳回/转办/委派/加签/减签/终止/撤销共用） -->
    <el-dialog v-model="actionDialogVisible" :title="actionDialogTitle" width="550px" :close-on-click-modal="false">
      <el-form ref="actionFormRef" :model="actionForm" label-width="100px">
        <!-- 转办/委派/加签：指定目标处理人 -->
        <el-form-item
            v-if="['transfer', 'depute', 'addSignature'].includes(actionType)"
            label="目标处理人"
            prop="addHandlers"
            :required="['transfer', 'depute', 'addSignature'].includes(actionType)"
        >
          <el-input v-model="actionHandlersInput" placeholder="多个用逗号分隔，如 user:zhangsan,role:2" />
        </el-form-item>
        <!-- 减签：要移除的处理人 -->
        <el-form-item
            v-if="actionType === 'reductionSignature'"
            label="移除处理人"
            prop="reductionHandlers"
            required
        >
          <el-input v-model="actionReductionHandlersInput" placeholder="多个用逗号分隔，如 user:lisi" />
        </el-form-item>
        <!-- 通过/驳回：下一节点权限标识 -->
        <el-form-item
            v-if="actionType === 'pass' || actionType === 'reject'"
            label="权限标识"
        >
          <el-input v-model="actionPermissionFlag" placeholder="多个用逗号分隔，如 role:2,role:3（可选）" />
        </el-form-item>
        <!-- 通过/驳回：跳转节点 -->
        <el-form-item
            v-if="actionType === 'pass' || actionType === 'reject'"
            label="跳转节点"
        >
          <el-input v-model="actionNodeCode" placeholder="目标节点编码（可选，不填按连线流转）" />
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
  addSignature,
  reductionSignature,
  terminationTask,
  revokeFlow,
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
type ActionType = 'pass' | 'reject' | 'transfer' | 'depute' | 'addSignature' | 'reductionSignature' | 'termination' | 'revoke'

const actionDialogVisible = ref(false)
const actionDialogTitle = ref('')
const actionType = ref<ActionType>('pass')
const actionLoading = ref(false)
const actionFormRef = ref()
const currentTask = ref<FlowTaskVo | null>(null)
const actionHandlersInput = ref('')
const actionReductionHandlersInput = ref('')
const actionPermissionFlag = ref('')
const actionNodeCode = ref('')

const actionForm = ref({
  message: '',
})

const titleMap: Record<ActionType, string> = {
  pass: '审批通过',
  reject: '审批驳回',
  transfer: '转办',
  depute: '委派',
  addSignature: '加签',
  reductionSignature: '减签',
  termination: '终止流程',
  revoke: '撤销流程',
}

/** 需要 addHandlers 的操作类型 */
const needAddHandlers = (type: ActionType) => ['transfer', 'depute', 'addSignature'].includes(type)

const openActionDialog = (row: FlowTaskVo, type: ActionType) => {
  currentTask.value = row
  actionType.value = type
  actionDialogTitle.value = `${titleMap[type]} - ${row.flowName || ''}`
  actionForm.value = { message: '' }
  actionHandlersInput.value = ''
  actionReductionHandlersInput.value = ''
  actionPermissionFlag.value = ''
  actionNodeCode.value = ''
  actionDialogVisible.value = true
  setTimeout(() => actionFormRef.value?.clearValidate(), 0)
}

const handlePass = (row: FlowTaskVo) => openActionDialog(row, 'pass')
const handleReject = (row: FlowTaskVo) => openActionDialog(row, 'reject')
const handleTransfer = (row: FlowTaskVo) => openActionDialog(row, 'transfer')
const handleDepute = (row: FlowTaskVo) => openActionDialog(row, 'depute')
const handleAddSignature = (row: FlowTaskVo) => openActionDialog(row, 'addSignature')
const handleReductionSignature = (row: FlowTaskVo) => openActionDialog(row, 'reductionSignature')
const handleTermination = (row: FlowTaskVo) => openActionDialog(row, 'termination')
const handleRevoke = (row: FlowTaskVo) => openActionDialog(row, 'revoke')

const handleActionSubmit = async () => {
  if (!currentTask.value) return
  actionLoading.value = true
  try {
    const taskId = currentTask.value.id
    const instanceId = currentTask.value.instanceId

    // 构建请求体（skipType 由 API 自动确定，无需传入）
    const data: FlowActionDto = {
      message: actionForm.value.message,
    }

    // 转办/委派/加签需要 taskId + addHandlers
    if (needAddHandlers(actionType.value)) {
      if (!actionHandlersInput.value.trim()) {
        ElMessage.warning('请输入目标处理人')
        actionLoading.value = false
        return
      }
      data.taskId = taskId
      data.addHandlers = actionHandlersInput.value.split(',').map(s => s.trim()).filter(Boolean)
    }

    // 减签需要 taskId + reductionHandlers
    if (actionType.value === 'reductionSignature') {
      if (!actionReductionHandlersInput.value.trim()) {
        ElMessage.warning('请输入要移除的处理人')
        actionLoading.value = false
        return
      }
      data.taskId = taskId
      data.reductionHandlers = actionReductionHandlersInput.value.split(',').map(s => s.trim()).filter(Boolean)
    }

    // 撤销需要 instanceId
    if (actionType.value === 'revoke') {
      data.instanceId = instanceId
    }

    // 终止支持 taskId 或 instanceId
    if (actionType.value === 'termination') {
      data.taskId = taskId
    }

    // 通过/驳回支持 taskId、permissionFlag、nodeCode
    if (actionType.value === 'pass' || actionType.value === 'reject') {
      data.taskId = taskId
      if (actionPermissionFlag.value.trim()) {
        data.permissionFlag = actionPermissionFlag.value.split(',').map(s => s.trim()).filter(Boolean)
      }
      if (actionNodeCode.value.trim()) {
        data.nodeCode = actionNodeCode.value.trim()
      }
    }

    // 调用对应 API
    switch (actionType.value) {
      case 'pass': await passTask(data); break
      case 'reject': await rejectTask(data); break
      case 'transfer': await transferTask(data); break
      case 'depute': await deputeTask(data); break
      case 'addSignature': await addSignature(data); break
      case 'reductionSignature': await reductionSignature(data); break
      case 'termination': await terminationTask(data); break
      case 'revoke': await revokeFlow(data); break
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
