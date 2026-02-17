<template>
  <div class="permissions-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>权限管理</span>
          <el-button v-permission="'system:permission:add'" type="primary" icon="Plus" @click="handleAdd">
            新增菜单
          </el-button>
        </div>
      </template>

      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" icon="Search" @click="getPermissionList">刷新</el-button>
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
              {{ row.type === -1 ? '根节点' : row.type === 0 ? '页面' : row.type === 1 ? '组件' : '接口' }}
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
                v-permission="'system:permission:edit'"
                type="primary"
                size="small"
                link
                icon="Edit"
                @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
                v-permission="'system:permission:delete'"
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

    <!-- 新增/编辑菜单对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="500px"
        :before-close="handleClose"
    >
      <el-form
          ref="formRef"
          :model="formData"
          :rules="getFormRules"
          label-width="100px"
      >
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入菜单名称"/>
        </el-form-item>

        <el-form-item label="权限标识" prop="permission">
          <el-input v-model="formData.permission" placeholder="请输入权限标识"/>
        </el-form-item>

        <el-form-item label="菜单类型" prop="type" v-if="!isEdit">
          <el-select v-model="formData.type" placeholder="请选择菜单类型" @change="handleTypeChange" :disabled="isEdit">
            <el-option label="根节点" :value="-1"/>
            <el-option label="页面" :value="0"/>
            <el-option label="组件" :value="1"/>
          </el-select>
        </el-form-item>

        <el-form-item label="父级菜单" prop="parentId" v-if="showParentSelect">
          <el-select v-model="formData.parentId" placeholder="请选择父级菜单" style="width: 100%" :disabled="isEdit">
            <el-option
                v-for="item in addSelectData"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="keepAlive">
          <el-radio-group v-model="formData.keepAlive">
            <el-radio :label="0">开启</el-radio>
            <el-radio :label="1">关闭</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="描述" prop="describe">
          <el-input
              v-model="formData.describe"
              type="textarea"
              :rows="3"
              placeholder="请输入描述信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, computed, reactive} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {getPermissionsTree, addPermission, updatePermission, deletePermission} from '@/api/sys_permissions.ts'
import type {SysPermissionListVo, AddOrEditPermissionEvt} from '@/types/sys_permissions.ts'
import {copyText} from "@/utils/common_utils.ts"
import type {FormInstance, FormRules} from 'element-plus'

// 使用后端返回的数据结构
interface PermissionItem extends SysPermissionListVo {
  // 可以在这里添加前端需要的额外字段
}

// 表格数据
const tableData = ref<PermissionItem[]>([])
// 父级菜单选项
const addSelectData = ref<PermissionItem[]>([])
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<AddOrEditPermissionEvt>({
  name: '',
  permission: '',
  parentId: 0,
  keepAlive: 0,
  type: -1,
  describe: ''
})

// 表单验证规则
const getFormRules = computed<FormRules>(() => {
  const rules: FormRules = {
    name: [
      {required: true, message: '请输入菜单名称', trigger: 'blur'}
    ],
    permission: [
      {required: true, message: '请输入权限标识', trigger: 'blur'}
    ]
  }

  // 新增时才需要验证菜单类型和父级菜单
  if (!isEdit.value) {
    rules.type = [
      {required: true, message: '请选择菜单类型', trigger: 'change'}
    ]
    rules.parentId = [
      {required: true, message: '请选择父级菜单', trigger: 'change'}
    ]
  }

  return rules
})

// 是否显示父级菜单选择
const showParentSelect = computed(() => {
  return !isEdit.value && formData.type !== -1
})

// 获取菜单列表
const getPermissionList = async () => {
  loading.value = true
  try {
    const res = await getPermissionsTree({id: -1})
    tableData.value = res.data || []
    addSelectData.value = res.data || []
  } catch (error) {
    console.error('获取菜单列表失败:', error)
    ElMessage.error('获取菜单列表失败')
  } finally {
    loading.value = false
  }
}

// 处理菜单类型变化
const handleTypeChange = (val: number) => {
  if (val === -1) {
    addSelectData.value = []
    formData.parentId = 0
  } else {
    formData.parentId = null as unknown as number
  }
}

// 新增菜单
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增菜单'
  resetForm()
  dialogVisible.value = true
}

// 编辑菜单
const handleEdit = (row: PermissionItem) => {
  isEdit.value = true
  dialogTitle.value = '编辑菜单'
  resetForm()
  // 填充表单数据
  formData.id = row.id
  formData.name = row.name
  formData.permission = row.permission
  formData.parentId = row.pid
  formData.keepAlive = parseInt(row.keepAlive)
  formData.type = row.type
  dialogVisible.value = true
}

// 删除菜单
const handleDelete = (row: PermissionItem) => {
  ElMessageBox.confirm(`确定要删除菜单 ${row.name} 吗？`, '提示', {
    type: 'warning',
  }).then(async () => {
    try {
      // 这里需要调用删除接口，暂时用成功提示
      const res = await deletePermission({id: row.id})
      ElMessage.success(res.msg || '删除成功')
      await getPermissionList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 取消
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          // 编辑
          const res = await updatePermission(formData)
          ElMessage.success(res.msg || '编辑成功')
        } else {
          // 新增
          const res = await addPermission(formData)
          ElMessage.success(res.msg || '新增成功')
        }
        dialogVisible.value = false
        await getPermissionList()
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error(isEdit.value ? '编辑失败' : '新增失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(formData, {
    name: '',
    permission: '',
    parentId: 0,
    keepAlive: 0,
    type: -1,
    describe: ''
  })
}

onMounted(() => {
  getPermissionList()
})
</script>

<style scoped lang="scss">
.permissions-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
