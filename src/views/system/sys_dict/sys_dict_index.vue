<template>
  <div class="dict-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>字典管理</span>
          <el-button v-permission="'system:dict:add'" type="primary" icon="Plus" @click="handleAddType">
            新增字典类型
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm">
        <el-form-item label="类型名称">
          <el-input v-model="searchForm.typeName" placeholder="请输入类型名称" clearable />
        </el-form-item>
        <el-form-item label="类型编码">
          <el-input v-model="searchForm.typeCode" placeholder="请输入类型编码" clearable />
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
        row-key="id"
        @expand-change="handleExpandChange"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand-wrapper">
              <div class="expand-header">
                <span class="expand-title">{{ row.typeName }} - 字典列表</span>
                <el-button
                  v-permission="'system:dict:add'"
                  type="primary"
                  size="small"
                  icon="Plus"
                  @click="handleAddEnum(row)"
                >
                  新增字典项
                </el-button>
              </div>
              <el-table
                v-loading="row._enumLoading"
                :data="row._enumData"
                border
                size="small"
              >
                <el-table-column prop="id" label="ID" width="60" />
                <el-table-column prop="enumName" label="枚举名称" width="150" />
                <el-table-column prop="enumCode" label="枚举值" width="120" />
                <el-table-column prop="sort" label="排序" width="80" />
                <el-table-column prop="remark" label="备注" />
                <el-table-column label="锁定" width="80">
                  <template #default="{ row: enumRow }">
                    <el-tag :type="enumRow.isLock ? 'warning' : 'success'" size="small">
                      {{ getDictLabel('is_lock', enumRow.isLock ? '1' : '0') }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="160" fixed="right">
                  <template #default="{ row: enumRow }">
                    <el-button
                      v-permission="'system:dict:edit'"
                      type="primary"
                      size="small"
                      link
                      icon="Edit"
                      @click="handleEditEnum(row, enumRow)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      v-permission="'system:dict:delete'"
                      type="danger"
                      size="small"
                      link
                      icon="Delete"
                      @click="handleDeleteEnum(enumRow)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="typeName" label="类型名称" width="150" />
        <el-table-column prop="typeCode" label="类型编码" width="150" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="删除状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isDelete === 0 ? 'success' : 'danger'" size="small">
              {{ getDictLabel('is_delete', String(row.isDelete)) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="锁定" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isLock ? 'warning' : 'success'" size="small">
              {{ getDictLabel('is_lock', row.isLock ? '1' : '0') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="gmtCreated" label="创建时间" width="180" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button
              v-permission="'system:dict:edit'"
              type="primary"
              size="small"
              link
              icon="Edit"
              @click="handleEditType(row)"
            >
              编辑
            </el-button>
            <el-button
              v-permission="'system:dict:delete'"
              type="danger"
              size="small"
              link
              icon="Delete"
              @click="handleDeleteType(row)"
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
        layout="sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="handleSearch"
        @current-change="handleSearch"
      />
    </el-card>

    <!-- 新增/编辑字典类型弹窗 -->
    <el-dialog
      v-model="typeDialogVisible"
      :title="typeDialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="typeFormRef" :model="typeFormData" :rules="typeFormRules" label-width="100px">
        <el-form-item label="类型名称" prop="typeName">
          <el-input v-model="typeFormData.typeName" placeholder="请输入类型名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="类型编码" prop="typeCode">
          <el-input v-model="typeFormData.typeCode" placeholder="请输入类型编码" maxlength="50" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="typeFormData.remark" placeholder="请输入备注" maxlength="200" type="textarea" />
        </el-form-item>
        <el-form-item label="是否锁定">
          <el-switch v-model="typeFormData.isLock" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="typeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleTypeSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增/编辑字典枚举弹窗 -->
    <el-dialog
      v-model="enumDialogVisible"
      :title="enumDialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="enumFormRef" :model="enumFormData" :rules="enumFormRules" label-width="100px">
        <el-form-item label="枚举名称" prop="enumName">
          <el-input v-model="enumFormData.enumName" placeholder="请输入枚举名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="枚举值" prop="enumCode">
          <el-input v-model="enumFormData.enumCode" placeholder="请输入枚举值" maxlength="50" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="enumFormData.sort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="enumFormData.remark" placeholder="请输入备注" maxlength="200" type="textarea" />
        </el-form-item>
        <el-form-item label="是否锁定">
          <el-switch v-model="enumFormData.isLock" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="enumDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleEnumSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getDictTypeList,
  addDictType,
  updateDictType,
  deleteDictType,
  getDictList,
  addDictEnum,
  updateDictEnum,
  deleteDictEnum,
} from '@/api/sys_dict'
import type { DictTypeVo, DictEnumVo, SaveDictTypeEvt, SaveDictEnumEvt } from '@/types/sys_dict'
import type { IdNumberRequest } from '@/types/common_types'
import { fetchDictMap, getDictLabel } from '@/utils/dict_utils'

interface DictTypeRow extends DictTypeVo {
  _enumData: DictEnumVo[]
  _enumLoading: boolean
  _expanded: boolean
}

const searchForm = ref({
  typeName: '',
  typeCode: '',
})

const pagination = ref({
  page: 1,
  size: 10,
  total: 0,
})

const tableData = ref<DictTypeRow[]>([])
const loading = ref(false)

// 获取字典类型列表
const fetchDictTypeList = async () => {
  loading.value = true
  try {
    const response = await getDictTypeList({
      typeName: searchForm.value.typeName,
      typeCode: searchForm.value.typeCode,
      current: pagination.value.page,
      size: pagination.value.size,
    })
    const list = response.data || []
    tableData.value = list.map((item) => ({
      ...item,
      _enumData: [],
      _enumLoading: false,
      _expanded: false,
    }))
    pagination.value.total = list.length === pagination.value.size
      ? (pagination.value.page + 1) * pagination.value.size
      : (pagination.value.page - 1) * pagination.value.size + list.length
  } catch {
    ElMessage.error('获取字典类型列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  fetchDictTypeList()
}

const handleReset = () => {
  searchForm.value.typeName = ''
  searchForm.value.typeCode = ''
  pagination.value.page = 1
  fetchDictTypeList()
}

// 展开行时加载字典枚举
const handleExpandChange = async (row: DictTypeRow, expandedRows: DictTypeRow[]) => {
  const isExpanded = expandedRows.some((r) => r.id === row.id)
  row._expanded = isExpanded
  if (isExpanded && row._enumData.length === 0) {
    row._enumLoading = true
    try {
      const response = await getDictList(row.id)
      row._enumData = response.data || []
    } catch {
      ElMessage.error('获取字典列表失败')
    } finally {
      row._enumLoading = false
    }
  }
}

// ========== 字典类型 CRUD ==========
const typeDialogVisible = ref(false)
const typeDialogTitle = ref('')
const isEditType = ref(false)
const typeFormRef = ref()
const typeFormData = ref<SaveDictTypeEvt & { isLock: boolean }>({
  typeName: '',
  typeCode: '',
  remark: '',
  isLock: false,
})

const typeFormRules = {
  typeName: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
  typeCode: [{ required: true, message: '请输入类型编码', trigger: 'blur' }],
}

const handleAddType = () => {
  isEditType.value = false
  typeDialogTitle.value = '新增字典类型'
  typeDialogVisible.value = true
  setTimeout(() => {
    typeFormData.value = { typeName: '', typeCode: '', remark: '', isLock: false }
    typeFormRef.value?.clearValidate()
  }, 0)
}

const handleEditType = (row: DictTypeRow) => {
  isEditType.value = true
  typeDialogTitle.value = '编辑字典类型'
  typeDialogVisible.value = true
  setTimeout(() => {
    typeFormData.value = {
      id: row.id,
      typeName: row.typeName,
      typeCode: row.typeCode,
      remark: row.remark,
      isLock: row.isLock,
    }
    typeFormRef.value?.clearValidate()
  }, 0)
}

const handleTypeSubmit = async () => {
  await typeFormRef.value.validate()
  try {
    if (isEditType.value) {
      await updateDictType(typeFormData.value)
      ElMessage.success('编辑字典类型成功')
    } else {
      await addDictType(typeFormData.value)
      ElMessage.success('新增字典类型成功')
    }
    typeDialogVisible.value = false
    await fetchDictTypeList()
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message || (isEditType.value ? '编辑失败' : '新增失败'))
    }
  }
}

const handleDeleteType = async (row: DictTypeRow) => {
  try {
    await ElMessageBox.confirm(`确定要删除字典类型 ${row.typeName} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const deleteParams: IdNumberRequest = { id: row.id }
    await deleteDictType(deleteParams)
    ElMessage.success('删除字典类型成功')
    if (tableData.value.length === 1 && pagination.value.page > 1) {
      pagination.value.page--
    }
    await fetchDictTypeList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// ========== 字典枚举 CRUD ==========
const enumDialogVisible = ref(false)
const enumDialogTitle = ref('')
const isEditEnum = ref(false)
const enumFormRef = ref()
const enumFormData = ref<SaveDictEnumEvt & { isLock: boolean }>({
  dictTypeCode: '',
  dictTypeId: 0,
  enumName: '',
  enumCode: '',
  sort: 1,
  remark: '',
  isLock: false,
})
const currentEnumTypeRow = ref<DictTypeRow | null>(null)

const enumFormRules = {
  enumName: [{ required: true, message: '请输入枚举名称', trigger: 'blur' }],
  enumCode: [{ required: true, message: '请输入枚举值', trigger: 'blur' }],
}

const handleAddEnum = (row: DictTypeRow) => {
  isEditEnum.value = false
  enumDialogTitle.value = `新增字典项 - ${row.typeName}`
  currentEnumTypeRow.value = row
  enumDialogVisible.value = true
  setTimeout(() => {
    enumFormData.value = {
      dictTypeCode: row.typeCode,
      dictTypeId: row.id,
      enumName: '',
      enumCode: '',
      sort: 1,
      remark: '',
      isLock: false,
    }
    enumFormRef.value?.clearValidate()
  }, 0)
}

const handleEditEnum = (typeRow: DictTypeRow, enumRow: DictEnumVo) => {
  isEditEnum.value = true
  enumDialogTitle.value = `编辑字典项 - ${typeRow.typeName}`
  currentEnumTypeRow.value = typeRow
  enumDialogVisible.value = true
  setTimeout(() => {
    enumFormData.value = {
      id: enumRow.id,
      dictTypeCode: enumRow.dictTypeCode,
      dictTypeId: typeRow.id,
      enumName: enumRow.enumName,
      enumCode: enumRow.enumCode,
      sort: enumRow.sort,
      remark: enumRow.remark,
      isLock: enumRow.isLock,
    }
    enumFormRef.value?.clearValidate()
  }, 0)
}

const handleEnumSubmit = async () => {
  await enumFormRef.value.validate()
  try {
    if (isEditEnum.value) {
      await updateDictEnum(enumFormData.value)
      ElMessage.success('编辑字典项成功')
    } else {
      await addDictEnum(enumFormData.value)
      ElMessage.success('新增字典项成功')
    }
    enumDialogVisible.value = false
    // 刷新对应类型的枚举列表
    if (currentEnumTypeRow.value) {
      const row = tableData.value.find((r) => r.id === currentEnumTypeRow.value!.id)
      if (row) {
        row._enumLoading = true
        const response = await getDictList(row.id)
        row._enumData = response.data || []
        row._enumLoading = false
      }
    }
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message || (isEditEnum.value ? '编辑失败' : '新增失败'))
    }
  }
}

const handleDeleteEnum = async (enumRow: DictEnumVo) => {
  try {
    await ElMessageBox.confirm(`确定要删除字典项 ${enumRow.enumName} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const deleteParams: IdNumberRequest = { id: enumRow.id }
    await deleteDictEnum(deleteParams)
    ElMessage.success('删除字典项成功')
    // 刷新对应类型的枚举列表
    const typeRow = tableData.value.find((r) => r.typeCode === enumRow.dictTypeCode)
    if (typeRow) {
      typeRow._enumLoading = true
      const response = await getDictList(typeRow.id)
      typeRow._enumData = response.data || []
      typeRow._enumLoading = false
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

onMounted(() => {
  fetchDictMap('is_lock,is_delete')
  fetchDictTypeList()
})
</script>

<style scoped lang="scss">
.dict-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dialog-footer {
    text-align: right;
  }

  .expand-wrapper {
    padding: 8px 16px;

    .expand-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .expand-title {
        font-weight: 500;
        font-size: 14px;
      }
    }
  }
}
</style>
