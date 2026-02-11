<template>
  <div class="user-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button v-permission="'system:user:add'" type="primary" icon="Plus" @click="handleAdd">
            新增用户
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm">
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="loading" :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="60"/>
        <el-table-column prop="username" label="用户名" width="120"/>
        <el-table-column prop="realName" label="真实姓名" width="120"/>
        <el-table-column prop="phone" label="手机号" width="120"/>
        <el-table-column prop="email" label="邮箱" width="180">
          <template #default="{ row }">
            <span
                v-if="row.email"
                class="copyable-email"
                @click="copyText(row.email)"
                title="点击复制邮箱"
            >
              {{ row.email }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="deptId" label="部门ID" width="60"/>
        <el-table-column label="状态" width="70">
          <template #default="{ row }">
            <el-tag :type="row.lockFlag === 0 ? 'success' : 'danger'">
              {{ row.lockFlag === 0 ? '正常' : '锁定' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="gmtCreated" label="创建时间" width="180"/>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
                v-permission="'system:user:edit'"
                type="primary"
                size="small"
                link
                icon="Edit"
                @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
                v-permission="'system:user:delete'"
                type="danger"
                size="small"
                link
                icon="Delete"
                @click="handleDelete(row)"
            >
              删除
            </el-button>
            <el-button
                v-permission="'system:user:edit_role'"
                type="warning"
                size="small"
                link
                icon="UserFilled"
                @click="handleRoleAssign(row)"
            >
              角色
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

    <!-- 新增/编辑用户弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="500px"
        :close-on-click-modal="false"
    >
      <el-form
          ref="userFormRef"
          :model="userFormData"
          :rules="isEdit ? editUserFormRules : userFormRules"
          label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="userFormData.username"
              placeholder="请输入用户名"
              maxlength="20"
          />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input
              v-model="userFormData.realName"
              placeholder="请输入真实姓名"
              maxlength="20"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="telephone">
          <el-input
              v-model="userFormData.telephone"
              placeholder="请输入手机号"
              maxlength="11"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input
              v-model="(userFormData as AddSysUserEvt).password"
              type="password"
              placeholder="请输入密码"
              show-password
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
              v-model="userFormData.email"
              placeholder="请输入邮箱"
              maxlength="50"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户角色分配弹窗 -->
    <el-dialog
        v-model="roleDialogVisible"
        title="分配用户角色"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-transfer
          v-model="selectedRoleIds"
          :data="roleTransferData"
          :titles="['可分配角色', '已分配角色']"
          :filter="filterRoleMethod"
      >
        <template #default="{ option }">
          <span :title="option.label + ' ' + option.code">{{ option.label }}</span>
          <el-tag size="small" type="info" style="margin-left: 8px">
            {{ option.code }}
          </el-tag>
        </template>
      </el-transfer>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleRoleSubmit" :loading="roleLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {ElMessage, ElMessageBox, ElDialog, ElForm, ElFormItem, ElInput} from 'element-plus'
import {
  getUserList,
  addSysUser,
  updateSysUser,
  deleteSysUser,
  getUserRoles,
  editUserRoles
} from '@/api/sys_user.ts'
import {getRoleList} from '@/api/sys_role.ts'
import type {SysUserListVo, AddSysUserEvt, UpdateSysUserEvt} from "@/types/sys_user.ts";
import type {IdNumberRequest} from "@/types/common_types.ts";
import {copyText} from "@/utils/common_utils.ts";

interface UserQuery {
  phone?: string
  current: number
  size: number
}

const searchForm = ref({
  phone: '',
})

const pagination = ref({
  page: 1,
  size: 10,
  total: 0,
})

const tableData = ref<SysUserListVo[]>([])
const loading = ref(false)

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const params: UserQuery = {
      current: pagination.value.page,
      size: pagination.value.size,
    }
    params.phone = searchForm.value.phone
    const response = await getUserList(params)
    tableData.value = response.data || []
    // 根据每页数量判断是否有下一页
    pagination.value.total = tableData.value.length === pagination.value.size
        ? (pagination.value.page + 1) * pagination.value.size
        : (pagination.value.page - 1) * pagination.value.size + tableData.value.length
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  fetchUserList()
}

const handleReset = () => {
  searchForm.value.phone = ''
  pagination.value.page = 1
  fetchUserList()
}

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const userFormRef = ref()

// 角色分配相关
const roleDialogVisible = ref(false)
const roleLoading = ref(false)
const selectedRoleIds = ref<number[]>([])
const roleTransferData = ref<Array<{
  key: number
  label: string
  code: string
  disabled: boolean
}>>([])
const currentUser = ref<SysUserListVo | null>(null)

const userFormData = ref<AddSysUserEvt | UpdateSysUserEvt>({
  username: '',
  telephone: '',
  password: '',
  realName: '',
  email: '',
})

const userFormRules = {
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 3, max: 20, message: '用户名长度在3-20个字符之间', trigger: 'blur'}
  ],
  realName: [
    {required: true, message: '请输入真实姓名', trigger: 'blur'},
    {min: 2, max: 10, message: '真实姓名长度在2-10个字符之间', trigger: 'blur'}
  ],
  telephone: [
    {required: true, message: '请输入手机号', trigger: 'blur'},
    {pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, max: 20, message: '密码长度在6-20个字符之间', trigger: 'blur'}
  ],
  email: [
    {pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '请输入正确的邮箱格式', trigger: 'blur'}
  ]
}

const editUserFormRules = {
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 3, max: 20, message: '用户名长度在3-20个字符之间', trigger: 'blur'}
  ],
  realName: [
    {required: true, message: '请输入真实姓名', trigger: 'blur'},
    {min: 2, max: 10, message: '真实姓名长度在2-10个字符之间', trigger: 'blur'}
  ],
  telephone: [
    {required: true, message: '请输入手机号', trigger: 'blur'},
    {pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur'}
  ],
  email: [
    {pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '请输入正确的邮箱格式', trigger: 'blur'}
  ]
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增用户'
  dialogVisible.value = true

  // 重置表单
  setTimeout(() => {
    userFormData.value = {
      username: '',
      telephone: '',
      password: '',
      realName: '',
      email: '',
    }
    userFormRef.value?.clearValidate()
  }, 0)
}

const handleEdit = (row: SysUserListVo) => {
  isEdit.value = true
  dialogTitle.value = '编辑用户'
  dialogVisible.value = true
  // 填充表单数据
  setTimeout(() => {
    userFormData.value = {
      id: row.id,
      username: row.username,
      telephone: row.phone,
      realName: row.realName,
      email: row.email || '',
    }
    userFormRef.value?.clearValidate()
  }, 0)
}

const handleSubmit = async () => {
  // 验证表单
  await userFormRef.value.validate()
  try {
    if (isEdit.value) {
      // 编辑用户
      await updateSysUser(userFormData.value as UpdateSysUserEvt)
      ElMessage.success('编辑用户成功')
    } else {
      // 新增用户
      await addSysUser(userFormData.value as AddSysUserEvt)
      ElMessage.success('新增用户成功')
    }
    dialogVisible.value = false
    await fetchUserList()
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message || (isEdit.value ? '编辑用户失败' : '新增用户失败'))
    }
  }
}

const handleDelete = async (row: SysUserListVo) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 ${row.username} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 调用删除API
    const deleteParams: IdNumberRequest = {id: row.id}
    await deleteSysUser(deleteParams)
    ElMessage.success('删除用户成功')

    // 如果当前页只剩一条数据且不是第一页，返回上一页
    if (tableData.value.length === 1 && pagination.value.page > 1) {
      pagination.value.page--
    }
    await fetchUserList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除用户失败')
    }
    // 取消删除
    console.log('用户取消删除操作')
  }
}

// 处理角色分配
const handleRoleAssign = async (row: SysUserListVo) => {
  currentUser.value = row
  roleDialogVisible.value = true
  roleLoading.value = true

  try {
    // 并行获取系统角色列表和用户已有角色
    const [rolesResponse, userRolesResponse] = await Promise.all([
      getRoleList({current: 1, size: 10000}), // 获取所有角色
      getUserRoles(row.id)
    ])

    // 处理角色数据为穿梭框格式
    const roles = rolesResponse.data || []
    roleTransferData.value = roles.map(role => ({
      key: role.id,
      label: role.roleName,
      code: role.roleCode,
      disabled: false
    }))

    // 设置用户已有的角色
    selectedRoleIds.value = Array.isArray(userRolesResponse.data) ? userRolesResponse.data : []
  } catch (error: any) {
    console.error('获取角色数据失败:', error)
    ElMessage.error(error.message || '获取角色数据失败')
  } finally {
    roleLoading.value = false
  }
}

// 角色过滤方法
const filterRoleMethod = (query: string, item: { label: string; code: string }) => {
  return item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.code.toLowerCase().includes(query.toLowerCase())
}

// 提交角色分配
const handleRoleSubmit = async () => {
  if (!currentUser.value) return

  roleLoading.value = true
  try {
    await editUserRoles({
      sysUserId: currentUser.value.id,
      roleIds: selectedRoleIds.value
    })
    ElMessage.success('角色分配成功')
    roleDialogVisible.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '角色分配失败')
  } finally {
    roleLoading.value = false
  }
}

onMounted(() => {
  fetchUserList()
})
</script>

<style scoped lang="scss">
.user-container {

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dialog-footer {
    text-align: right;
  }

  .copyable-email {
    color: #409eff;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      background-color: #ecf5ff;
      text-decoration: underline;
    }

    &:active {
      background-color: #d9ecff;
    }
  }
}
</style>
