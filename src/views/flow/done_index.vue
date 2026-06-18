<template>
  <div class="flow-done-container">
    <el-card>
      <template #header>
        <span>我的已办</span>
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
        <el-table-column prop="nodeName" label="办理节点" width="140" show-overflow-tooltip />
        <el-table-column label="处理类型" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="getSkipTypeTag(row.skipType)">
              {{ SkipTypeEnum[row.skipType] || row.skipType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="结果" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.flowStatus)" size="small">
              {{ FlowStatusEnum[row.flowStatus] || row.flowStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="审批意见" min-width="160" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button
                v-permission="'system:flow:task:list'"
                type="primary"
                size="small"
                link
                icon="View"
                @click="handleDetail(row)"
            >
              详情
            </el-button>
            <el-button
                v-permission="'system:flow:task:list'"
                type="info"
                size="small"
                link
                icon="List"
                @click="handleHisList(row)"
            >
              历史
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="办理详情" width="600px" :close-on-click-modal="false">
      <el-descriptions v-if="detailRow" :column="2" border>
        <el-descriptions-item label="流程名称">{{ detailRow.flowName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="办理节点">{{ detailRow.nodeName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="处理类型">
          <el-tag size="small" :type="getSkipTypeTag(detailRow.skipType)">
            {{ SkipTypeEnum[detailRow.skipType] || detailRow.skipType }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="结果">
          <el-tag :type="getStatusType(detailRow.flowStatus)" size="small">
            {{ FlowStatusEnum[detailRow.flowStatus] || detailRow.flowStatus }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="审批意见" :span="2">{{ detailRow.message || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailRow.createTime || '-' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 审批历史弹窗 -->
    <el-dialog v-model="hisDialogVisible" title="审批历史" width="800px" :close-on-click-modal="false">
      <el-table v-loading="hisLoading" :data="hisList" border stripe size="small">
        <el-table-column type="index" label="序号" width="50" />
        <el-table-column prop="nodeName" label="节点" width="120" />
        <el-table-column label="操作" width="90">
          <template #default="{ row: r }">
            <el-tag size="small" :type="getSkipTypeTag(r.skipType)">
              {{ SkipTypeEnum[r.skipType] || r.skipType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="意见" min-width="160" show-overflow-tooltip />
        <el-table-column label="结果" width="80">
          <template #default="{ row: r }">
            <el-tag :type="getStatusType(r.flowStatus)" size="small">
              {{ FlowStatusEnum[r.flowStatus] || r.flowStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="时间" width="170" />
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="hisDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMyDoneList, getTaskHisList } from '@/api/flow'
import type { FlowHisTaskVo } from '@/types/flow'
import { FlowStatusEnum, SkipTypeEnum } from '@/types/flow'

// ========== 搜索 ==========
const searchForm = ref({ flowCode: '', flowStatus: '' })
const pagination = ref({ page: 1, size: 10, total: 0 })
const tableData = ref<FlowHisTaskVo[]>([])
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

const getSkipTypeTag = (skipType: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    PASS: 'success',
    REJECT: 'danger',
    TRANSFER: 'warning',
    DEPUTE: 'info',
    ADDSIGNATURE: 'primary',
    REDUCTIONSIGNATURE: 'warning',
    TERMINATION: 'danger',
    REVOKE: 'info',
  }
  return map[skipType] || 'info'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getMyDoneList({
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
    ElMessage.error('获取已办列表失败')
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

// ========== 详情 ==========
const detailDialogVisible = ref(false)
const detailRow = ref<FlowHisTaskVo | null>(null)

const handleDetail = (row: FlowHisTaskVo) => {
  detailRow.value = row
  detailDialogVisible.value = true
}

// ========== 审批历史 ==========
const hisDialogVisible = ref(false)
const hisLoading = ref(false)
const hisList = ref<FlowHisTaskVo[]>([])

const handleHisList = async (row: FlowHisTaskVo) => {
  hisDialogVisible.value = true
  hisLoading.value = true
  try {
    const res = await getTaskHisList(row.instanceId)
    hisList.value = res.data || []
  } catch {
    ElMessage.error('获取审批历史失败')
  } finally {
    hisLoading.value = false
  }
}

onMounted(() => { fetchData() })
</script>

<style scoped lang="scss">
.flow-done-container {
  .dialog-footer { text-align: right; }
}
</style>
