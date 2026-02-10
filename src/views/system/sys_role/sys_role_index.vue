<template>
  <div class="role-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button v-permission="'system:role:add'" type="primary" icon="Plus" @click="handleAdd">
            新增角色
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm">
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" clearable/>
        </el-form-item>
        <el-form-item label="角色代码">
          <el-input v-model="searchForm.roleCode" placeholder="请输入角色代码" clearable/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column prop="roleName" label="角色名称"/>
        <el-table-column prop="roleCode" label="角色代码">
          <template #default="{ row }">
            <span
                v-if="row.roleCode"
                @click="copyText(row.roleCode)"
                :title="'点击复制 ' + row.roleCode"
            >
              {{ row.roleCode }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"/>
        <el-table-column prop="gmtCreated" label="创建时间" width="180"/>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button
                v-permission="'system:role:edit'"
                type="primary"
                size="small"
                link
                icon="Edit"
                @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
                v-permission="'system:role:permission'"
                type="warning"
                size="small"
                link
                icon="Key"
                @click="handlePermission(row)"
            >
              权限
            </el-button>
            <el-button
                v-permission="'system:role:delete'"
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
          layout="sizes, prev, pager, next, jumper"
          style="margin-top: 20px; justify-content: flex-end"
          @size-change="handleSearch"
          @current-change="handleSearch"
      />
    </el-card>

    <!-- 新增/编辑角色弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="500px"
        :close-on-click-modal="false"
    >
      <el-form
          ref="roleFormRef"
          :model="roleFormData"
          :rules="roleFormRules"
          label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input
              v-model="roleFormData.roleName"
              placeholder="请输入角色名称"
              maxlength="20"
          />
        </el-form-item>
        <el-form-item label="角色代码" prop="roleCode">
          <el-input
              v-model="roleFormData.roleCode"
              placeholder="请输入角色代码"
              maxlength="20"
          />
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input
              v-model="roleFormData.roleDesc"
              type="textarea"
              placeholder="请输入角色描述"
              maxlength="200"
              :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button v-permission="'system:role:add'" type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 角色权限编辑弹窗 -->
    <el-dialog
        v-model="permissionDialogVisible"
        title="编辑角色权限"
        width="600px"
        :close-on-click-modal="permissionDialogVisible"
        @close="handlePermissionDialogClose"
    >
      <div class="permission-tree-container">
        <el-tree
            ref="permissionTreeRef"
            :data="permissionTreeData"
            show-checkbox
            node-key="id"
            :props="{
              children: 'children',
              label: 'name'
            }"
            :default-checked-keys="defaultCheckedKeys"
            :default-expanded-keys="defaultExpandedKeys"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handlePermissionCancel">取消</el-button>
          <el-button type="primary" @click="handlePermissionSubmit" :loading="permissionLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {
  addSysRole,
  deleteSysRole,
  editRolePermissions,
  getRoleList,
  getRolePermissions,
  updateSysRole
} from '@/api/sys_role.ts'
import {getMenuTree} from '@/api/sys_menu'
import type {SysMenuListVo} from '@/types/sys_menu'
import type {AddSysRoleRequest, SysRoleListVo, SysRoleQuery, UpdateSysRoleRequest} from '@/types/sys_role.ts'
import type {IdNumberRequest} from '@/types/common_types.ts'
import {copyText} from "@/utils/common_utils.ts";

const searchForm = ref({
  roleName: '',
  roleCode: '',
})

const pagination = ref({
  page: 1,
  size: 10,
  total: 0,
})

const tableData = ref<SysRoleListVo[]>([])
const loading = ref(false)

// 获取角色列表
const fetchRoleList = async () => {
  loading.value = true
  try {
    const params: SysRoleQuery = {
      current: pagination.value.page,
      size: pagination.value.size,
    }
    params.roleName = searchForm.value.roleName
    params.roleCode = searchForm.value.roleCode

    const response = await getRoleList(params)
    tableData.value = response.data || []

    // 根据每页数量判断是否有下一页
    pagination.value.total = tableData.value.length === pagination.value.size
        ? (pagination.value.page + 1) * pagination.value.size
        : (pagination.value.page - 1) * pagination.value.size + tableData.value.length
  } catch (error) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  fetchRoleList()
}

const handleReset = () => {
  searchForm.value.roleName = ''
  searchForm.value.roleCode = ''
  pagination.value.page = 1
  fetchRoleList()
}

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const roleFormRef = ref()

// 权限管理相关
const permissionDialogVisible = ref(false)
const permissionTreeRef = ref()
const permissionTreeData = ref<SysMenuListVo[]>([])
const defaultCheckedKeys = ref<number[]>([])
const defaultExpandedKeys = ref<number[]>([])
const currentRoleId = ref<number>(0)
const permissionLoading = ref(false)

const roleFormData = ref<AddSysRoleRequest | UpdateSysRoleRequest>({
  roleName: '',
  roleCode: '',
  roleDesc: '',
})

const roleFormRules = {
  roleName: [
    {required: true, message: '请输入角色名称', trigger: 'blur'},
    {min: 2, max: 20, message: '角色名称长度在2-20个字符之间', trigger: 'blur'}
  ],
  roleCode: [
    {required: true, message: '请输入角色代码', trigger: 'blur'},
    {pattern: /^[a-zA-Z0-9_]+$/, message: '角色代码只能包含字母、数字和下划线', trigger: 'blur'}
  ],
  roleDesc: [
    {required: true, message: '请输入角色描述', trigger: 'blur'},
    {max: 200, message: '角色描述最多200个字符', trigger: 'blur'}
  ]
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增角色'
  dialogVisible.value = true

  // 重置表单
  setTimeout(() => {
    roleFormData.value = {
      roleName: '',
      roleCode: '',
      roleDesc: '',
    }
    roleFormRef.value?.clearValidate()
  }, 0)
}

const handleEdit = (row: SysRoleListVo) => {
  isEdit.value = true
  dialogTitle.value = '编辑角色'
  dialogVisible.value = true

  // 填充表单数据
  setTimeout(() => {
    roleFormData.value = {
      id: row.id,
      roleName: row.roleName,
      roleCode: row.roleCode,
      roleDesc: row.roleDesc,
    }
    roleFormRef.value?.clearValidate()
  }, 0)
}

const handleSubmit = async () => {
  // 验证表单
  await roleFormRef.value.validate()
  try {
    if (isEdit.value) {
      // 编辑角色
      await updateSysRole(roleFormData.value as UpdateSysRoleRequest)
      ElMessage.success('编辑角色成功')
    } else {
      // 新增角色
      await addSysRole(roleFormData.value as AddSysRoleRequest)
      ElMessage.success('新增角色成功')
    }
    dialogVisible.value = false
    await fetchRoleList()
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message || (isEdit.value ? '编辑角色失败' : '新增角色失败'))
    }
  }
}

const handlePermission = async (row: SysRoleListVo) => {
  // 先重置状态
  currentRoleId.value = 0
  defaultCheckedKeys.value = []
  // 确保树引用存在后再操作
  if (permissionTreeRef.value) {
    permissionTreeRef.value.setCheckedKeys([])
  }
  // 打开弹窗
  currentRoleId.value = row.id
  permissionDialogVisible.value = true
  try {
    // 并行获取权限树和角色权限
    const [treeRes, permissionRes] = await Promise.all([
      getMenuTree({id: 0}),
      getRolePermissions(row.id)
    ])
    // 设置权限树数据
    permissionTreeData.value = treeRes.data || []
    // 设置默认展开节点
    const getAllNodeIds = (nodes: any[]): number[] => {
      let ids: number[] = []
      nodes.forEach(node => {
        ids.push(node.id)
        if (node.children && node.children.length > 0) {
          ids = ids.concat(getAllNodeIds(node.children))
        }
      })
      return ids
    }
    defaultExpandedKeys.value = getAllNodeIds(permissionTreeData.value)
    // 设置选中的权限节点
    defaultCheckedKeys.value = Array.isArray(permissionRes.data) ? permissionRes.data : []
    // 等待DOM更新后设置选中状态
    await nextTick(() => {
      if (permissionTreeRef.value) {
        permissionTreeRef.value.setCheckedKeys(defaultCheckedKeys.value)
      }
    })
  } catch (error) {
    console.error('获取权限数据失败:', error)
    ElMessage.error('获取权限数据失败')
    // 出错时清空状态
    defaultCheckedKeys.value = []
    permissionTreeData.value = []
    defaultExpandedKeys.value = []
    await nextTick(() => {
      if (permissionTreeRef.value) {
        permissionTreeRef.value.setCheckedKeys([])
      }
    })
  }
}

const handleDelete = async (row: SysRoleListVo) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色 ${row.roleName} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 调用删除API
    const deleteParams: IdNumberRequest = {id: row.id}
    await deleteSysRole(deleteParams)
    ElMessage.success('删除角色成功')

    // 如果当前页只剩一条数据且不是第一页，返回上一页
    if (tableData.value.length === 1 && pagination.value.page > 1) {
      pagination.value.page--
    }
    await fetchRoleList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除角色失败')
    }
    // 取消删除
    console.log('用户取消删除操作')
  }
}

// 关闭权限弹窗时的清理
const handlePermissionDialogClose = () => {
  // 清空选中状态
  defaultCheckedKeys.value = []
  currentRoleId.value = 0
  permissionLoading.value = false

  // 重置树组件的选中状态
  if (permissionTreeRef.value) {
    permissionTreeRef.value.setCheckedKeys([])
  }
}

// 取消按钮处理
const handlePermissionCancel = () => {
  permissionDialogVisible.value = false
}

// 提交权限修改
const handlePermissionSubmit = async () => {
  try {
    permissionLoading.value = true

    // 获取选中的权限节点
    const checkedKeys = permissionTreeRef.value.getCheckedKeys()
    // 合并选中和半选中的权限（通常只需要完全选中的）
    const permissionIds = [...checkedKeys]

    await editRolePermissions({
      roleId: currentRoleId.value,
      ids: permissionIds
    })

    ElMessage.success('权限配置成功')
    permissionDialogVisible.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '权限配置失败')
  } finally {
    // 必须在finally中重置loading状态
    permissionLoading.value = false
  }
}

onMounted(() => {
  fetchRoleList()
})
</script>

<style scoped lang="scss">
.role-container {

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dialog-footer {
    text-align: right;
  }

  .permission-tree-container {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 10px;
  }
}
</style>
