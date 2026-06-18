<template>
  <div class="flow-instance-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>流程实例管理</span>
          <el-button v-permission="'system:flow:ins:start'" type="primary" icon="VideoPlay" @click="handleStart">
            发起流程
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="流程编码">
          <el-input v-model="searchForm.flowCode" placeholder="请输入流程编码" clearable />
        </el-form-item>
        <el-form-item label="业务ID">
          <el-input v-model="searchForm.businessId" placeholder="请输入业务ID" clearable />
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
        <el-form-item label="发起人">
          <el-input v-model="searchForm.createBy" placeholder="请输入发起人" clearable />
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
        <el-table-column prop="businessId" label="业务ID" width="130" show-overflow-tooltip />
        <el-table-column prop="nodeName" label="当前节点" width="130" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.flowStatus)" size="small">
              {{ FlowStatusEnum[row.flowStatus] || row.flowStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="发起人" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
                v-permission="'system:flow:ins:list'"
                type="primary"
                size="small"
                link
                icon="View"
                @click="handleDetail(row)"
            >
              详情
            </el-button>
            <el-button
                v-permission="'system:flow:ins:edit'"
                type="warning"
                size="small"
                link
                icon="VideoPause"
                @click="handleToggleActive(row)"
            >
              挂起
            </el-button>
            <el-button
                v-permission="'system:flow:ins:delete'"
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
          @size-change="handleSizeChange"
          @current-change="fetchData"
      />
    </el-card>

    <!-- 发起流程弹窗 -->
    <el-dialog v-model="startDialogVisible" title="发起流程" width="550px" :close-on-click-modal="false">
      <el-form ref="startFormRef" :model="startForm" :rules="startFormRules" label-width="100px">
        <el-form-item label="流程编码" prop="flowCode">
          <el-input v-model="startForm.flowCode" placeholder="请输入流程编码" maxlength="40" />
        </el-form-item>
        <el-form-item label="业务ID" prop="businessId">
          <el-input v-model="startForm.businessId" placeholder="请输入关联业务ID" maxlength="40" />
        </el-form-item>
        <el-form-item label="审批消息">
          <el-input v-model="startForm.message" placeholder="请输入审批消息" maxlength="200" />
        </el-form-item>
        <el-form-item label="权限标识">
          <el-input v-model="startFormPermissionFlag" placeholder="多个用逗号分隔，如 role:2,role:3" />
        </el-form-item>
        <el-form-item label="流程变量">
          <el-input
              v-model="startFormVariable"
              placeholder='JSON 格式，如 {"reason":"请假"}'
              type="textarea" :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="startDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="startLoading" @click="handleStartSubmit">发起</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 实例详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="实例详情" width="700px" :close-on-click-modal="false">
      <el-descriptions v-if="detailRow" :column="2" border>
        <el-descriptions-item label="实例ID">{{ detailRow.id }}</el-descriptions-item>
        <el-descriptions-item label="流程名称">{{ detailRow.flowName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="业务ID">{{ detailRow.businessId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="当前节点">{{ detailRow.nodeName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="流程状态">
          <el-tag :type="getStatusType(detailRow.flowStatus)" size="small">
            {{ FlowStatusEnum[detailRow.flowStatus] || detailRow.flowStatus }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发起人">{{ detailRow.createBy || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailRow.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detailRow.updateTime || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getFlowInsList,
  getFlowInsDetail,
  startFlow,
  unactiveFlowIns,
  deleteFlowIns,
} from '@/api/flow'
import type { FlowInsVo, StartFlowEvt } from '@/types/flow'
import { FlowStatusEnum } from '@/types/flow'

// ========== 搜索 ==========
const searchForm = ref({
  flowCode: '',
  businessId: '',
  flowStatus: '',
  createBy: '',
})

const pagination = ref({ page: 1, size: 10, total: 0 })
const tableData = ref<FlowInsVo[]>([])
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
    const res = await getFlowInsList({
      flowCode: searchForm.value.flowCode,
      businessId: searchForm.value.businessId,
      flowStatus: searchForm.value.flowStatus,
      createBy: searchForm.value.createBy,
      current: pagination.value.page,
      size: pagination.value.size,
    })
    const list = res.data || []
    tableData.value = list
    pagination.value.total = list.length === pagination.value.size
        ? (pagination.value.page + 1) * pagination.value.size
        : (pagination.value.page - 1) * pagination.value.size + list.length
  } catch {
    ElMessage.error('获取流程实例列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { pagination.value.page = 1; fetchData() }
const handleReset = () => {
  searchForm.value = { flowCode: '', businessId: '', flowStatus: '', createBy: '' }
  pagination.value.page = 1
  fetchData()
}
const handleSizeChange = () => { pagination.value.page = 1; fetchData() }

// ========== 发起流程 ==========
const startDialogVisible = ref(false)
const startFormRef = ref()
const startLoading = ref(false)
const startFormVariable = ref('')
const startFormPermissionFlag = ref('')

const startForm = ref<StartFlowEvt>({
  flowCode: '',
  businessId: '',
  message: '',
})

const startFormRules = {
  flowCode: [{ required: true, message: '请输入流程编码', trigger: 'blur' }],
  businessId: [{ required: true, message: '请输入业务ID', trigger: 'blur' }],
}

const handleStart = () => {
  startDialogVisible.value = true
  startFormVariable.value = ''
  startFormPermissionFlag.value = ''
  setTimeout(() => {
    startForm.value = { flowCode: '', businessId: '', message: '' }
    startFormRef.value?.clearValidate()
  }, 0)
}

const handleStartSubmit = async () => {
  await startFormRef.value.validate()
  startLoading.value = true
  try {
    const data: StartFlowEvt = { ...startForm.value }
    if (startFormVariable.value.trim()) {
      try { data.variable = JSON.parse(startFormVariable.value) }
      catch { ElMessage.error('流程变量 JSON 格式无效'); startLoading.value = false; return }
    }
    if (startFormPermissionFlag.value.trim()) {
      data.permissionFlag = startFormPermissionFlag.value.split(',').map(s => s.trim()).filter(Boolean)
    }
    await startFlow(data)
    ElMessage.success('流程发起成功')
    startDialogVisible.value = false
    await fetchData()
  } catch (e: any) {
    if (e?.message) ElMessage.error(e.message)
  } finally {
    startLoading.value = false
  }
}

// ========== 挂起 ==========
const handleToggleActive = async (row: FlowInsVo) => {
  try {
    await ElMessageBox.confirm(`确定挂起该流程实例吗？挂起后将无法继续流转。`, '挂起确认', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
    })
    await unactiveFlowIns(row.id)
    ElMessage.success('已挂起')
    await fetchData()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.message || '操作失败')
  }
}

// ========== 删除 ==========
const handleDelete = async (row: FlowInsVo) => {
  try {
    await ElMessageBox.confirm('确定删除该流程实例吗？不可恢复。', '删除确认', {
      confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'error',
    })
    await deleteFlowIns({ idList: [row.id] })
    ElMessage.success('删除成功')
    if (tableData.value.length === 1 && pagination.value.page > 1) pagination.value.page--
    await fetchData()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.message || '删除失败')
  }
}

// ========== 详情 ==========
const detailDialogVisible = ref(false)
const detailRow = ref<FlowInsVo | null>(null)

const handleDetail = async (row: FlowInsVo) => {
  try {
    const res = await getFlowInsDetail(row.id)
    detailRow.value = res.data
    detailDialogVisible.value = true
  } catch {
    ElMessage.error('获取实例详情失败')
  }
}

onMounted(() => { fetchData() })
</script>

<style scoped lang="scss">
.flow-instance-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .dialog-footer {
    text-align: right;
  }
}
</style>
