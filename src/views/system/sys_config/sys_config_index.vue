<template>
  <div class="setting-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统参数配置</span>
          <el-button type="primary" icon="Plus" @click="handleAdd">
            新增配置
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm">
        <el-form-item label="参数名称">
          <el-input
              v-model="searchForm.configName"
              placeholder="请输入参数名称"
              clearable
          />
        </el-form-item>
        <el-form-item label="参数键名">
          <el-input
              v-model="searchForm.configKey"
              placeholder="请输入参数键名"
              clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
          v-loading="loading"
          :data="tableData"
          border
          stripe
      >
        <el-table-column prop="id" label="ID" width="60"/>
        <el-table-column prop="configName" label="参数名称" show-overflow-tooltip width="100"/>
        <el-table-column prop="configKey" label="参数键名" show-overflow-tooltip width="100"/>
        <el-table-column prop="configValue" label="参数值" show-overflow-tooltip width="300"/>
        <el-table-column prop="isLock" label="锁定" width="60">
          <template #default="{ row }">
            <el-tag v-if="row.isLock === 1" type="danger">是</el-tag>
            <el-tag v-else type="success">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" show-overflow-tooltip/>
        <el-table-column prop="gmtCreated" label="创建时间" width="160"/>
        <el-table-column prop="gmtModified" label="修改时间" width="160"/>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
                v-permission="'system:config:edit'"
                type="primary"
                size="small"
                link
                icon="Edit"
                @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
                v-permission="'system:config:delete'"
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
          :page-sizes="[10, 20, 30, 50]"
          :total="pagination.total"
          layout="sizes, prev, pager, next, jumper"
          style="margin-top: 20px; justify-content: flex-end"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新增/编辑配置弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="500px"
        :close-on-click-modal="false"
    >
      <el-form
          ref="sysConfigFormRef"
          :model="form"
          :rules="rules"
          label-width="100px"
      >
        <el-form-item label="配置名" prop="configName">
          <el-input
              v-model="form.configName"
              placeholder="请输入配置名称"
          />
        </el-form-item>
        <el-form-item label="配置key" prop="configKey">
          <el-input
              v-model="form.configKey"
              placeholder="请输入配置key"
          />
        </el-form-item>
        <el-form-item label="配置value" prop="configValue">
          <el-input
              v-model="form.configValue"
              type="textarea"
              placeholder="请输入配置value"
              :rows="10"
          />
        </el-form-item>
        <el-form-item label="是否锁定" prop="isLock">
          <el-radio-group v-model="form.isLock">
            <el-radio :value="0">否</el-radio>
            <el-radio :value="1">是</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
              v-model="form.remark"
              type="textarea"
              placeholder="请输入备注"
              :rows="2"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {getSysConfigList, addSysConfig, updateSysConfig, deleteSysConfig} from '@/api/sys_config.ts'
import type {
  SysConfigListVo,
  AddSysConfigRequest,
  UpdateSysConfigRequest
} from '@/types/sys_config.ts'

interface SysConfigQuery {
  configName?: string
  configKey?: string
  current: number
  size: number
}

const loading = ref(true)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)

const searchForm = ref({
  configName: '',
  configKey: '',
})

const pagination = ref({
  page: 1,
  size: 10,
  total: 0,
})

const tableData = ref<SysConfigListVo[]>([])
const sysConfigFormRef = ref()

const form = ref<AddSysConfigRequest | UpdateSysConfigRequest>({
  configName: '',
  configKey: '',
  configValue: '',
  isLock: 0,
  remark: ''
})

// 表单验证规则
const rules = {
  configName: [
    {required: true, message: '参数名称不能为空', trigger: 'blur'}
  ],
  configKey: [
    {required: true, message: '参数键名不能为空', trigger: 'blur'}
  ],
  configValue: [
    {required: true, message: '参数值不能为空', trigger: 'blur'}
  ]
}

// 获取列表数据
const fetchList = async () => {
  loading.value = true
  try {
    const params: SysConfigQuery = {
      current: pagination.value.page,
      size: pagination.value.size,
    }
    params.configName = searchForm.value.configName
    params.configKey = searchForm.value.configKey
    const res = await getSysConfigList(params)
    tableData.value = res.data
    // 根据每页数量判断是否有下一页
    pagination.value.total = res.data.length === pagination.value.size
        ? (pagination.value.page + 1) * pagination.value.size
        : (pagination.value.page - 1) * pagination.value.size + tableData.value.length
  } catch (err) {
    console.error(err)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleSearch = () => {
  fetchList()
}

// 重置查询
const handleReset = () => {
  searchForm.value.configName = ''
  searchForm.value.configKey = ''
  pagination.value.page = 1
  fetchList()
}

// 分页大小改变
const handleSizeChange = () => {
  pagination.value.page = 1
  fetchList()
}

// 当前页改变
const handleCurrentChange = () => {
  fetchList()
}

// 添加
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增系统配置'
  dialogVisible.value = true

  // 重置表单
  setTimeout(() => {
    form.value = {
      configName: '',
      configKey: '',
      configValue: '',
      isLock: 0,
      remark: ''
    }
    sysConfigFormRef.value?.clearValidate()
  }, 0)
}

// 编辑
const handleEdit = (row: SysConfigListVo) => {
  isEdit.value = true
  dialogTitle.value = '编辑系统配置'
  dialogVisible.value = true
  // 填充表单数据
  setTimeout(() => {
    form.value = {
      id: row.id as number,
      configName: row.configName,
      configKey: row.configKey,
      configValue: row.configValue,
      isLock: row.isLock,
      remark: row.remark || ''
    }
    sysConfigFormRef.value?.clearValidate()
  }, 0)
}

// 删除单行
const handleDelete = async (row: SysConfigListVo) => {
  try {
    await ElMessageBox.confirm('确认删除选中的数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    if (row.id !== undefined) {
      const res = await deleteSysConfig({id: row.id})
      ElMessage.success(res.msg || '删除成功')
      await fetchList()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
    console.log('用户取消删除操作')
  }
}

// 提交表单
const handleSubmit = async () => {
  // 验证表单
  await sysConfigFormRef.value.validate()
  try {
    if (isEdit.value) {
      // 编辑
      const res = await updateSysConfig(form.value as UpdateSysConfigRequest)
      ElMessage.success(res.msg || '编辑成功')
    } else {
      // 新增
      const res = await addSysConfig(form.value as AddSysConfigRequest)
      ElMessage.success(res.msg || '新增成功')
    }
    dialogVisible.value = false
    await fetchList()
  } catch (err: any) {
    if (err.message) {
      ElMessage.error(err.message || (isEdit.value ? '编辑失败' : '新增失败'))
    }
  }
}

// 取消
const handleCancel = () => {
  dialogVisible.value = false
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped lang="scss">

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.dialog-footer {
  text-align: right;
}
</style>