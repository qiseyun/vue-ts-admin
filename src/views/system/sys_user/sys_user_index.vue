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

      <el-table :data="tableData" border stripe>
        <el-table-column prop="id" label="ID" width="60"/>
        <el-table-column prop="username" label="用户名" width="120"/>
        <el-table-column prop="realName" label="真实姓名" width="120"/>
        <el-table-column prop="phone" label="手机号" width="120"/>
        <el-table-column prop="email" label="邮箱" width="180"/>
        <el-table-column prop="deptId" label="部门ID" width="60"/>
        <el-table-column label="状态" width="60">
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
          :rules="userFormRules"
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
              v-model="userFormData.password"
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
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {ElMessage, ElMessageBox, ElDialog, ElForm, ElFormItem, ElInput} from 'element-plus'
import {getUserList, addUser, type SysUserListVo, type AddSysUserEvt} from '@/api/user'

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

// 获取用户列表
const fetchUserList = async () => {
  try {
    const params: UserQuery = {
      current: pagination.value.page,
      size: pagination.value.size,
    }
    params.phone = searchForm.value.phone
    const response = await getUserList(params)
    tableData.value = response.data || []
    pagination.value.total = response.data.total
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
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

const userFormData = ref<AddSysUserEvt>({
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
      username: row.username,
      telephone: row.phone,
      password: '', // 编辑时不显示原密码
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
      // 编辑用户 - 这里可以添加编辑API调用（假设我们有当前编辑的用户ID）
      ElMessage.warning('编辑用户功能待实现，当前仅支持新增用户')
      // 如果需要编辑功能，需要传入用户ID
      // await updateUser(currentUserId, userFormData.value)
    } else {
      // 新增用户
      await addUser(userFormData.value)
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
    // await deleteUser(row.id) // 注释掉，因为可能后端没有提供此接口
    ElMessage.warning('删除用户功能待实现')

    fetchUserList()
  } catch (error) {
    // 取消删除
    console.log('用户取消删除操作')
  }
}

onMounted(() => {
  fetchUserList()
})
</script>

<style scoped lang="scss">
.user-container {
  padding: 20px;

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
