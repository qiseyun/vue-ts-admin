<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <el-button
              type="primary"
              icon="ArrowLeft"
              @click="goBack"
              class="back-button"
          >
            返回
          </el-button>
          <span class="title">个人中心</span>
        </div>
      </template>

      <el-row :gutter="30">
        <!-- 左侧头像区域 -->
        <el-col :span="8">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <el-upload
                  class="avatar-uploader"
                  :show-file-list="false"
                  :http-request="handleAvatarUpload"
                  :before-upload="beforeAvatarUpload"
              >
                <img v-if="userInfo.headPortrait" :src="userInfo.headPortrait" class="avatar" alt=""/>
                <el-icon v-else class="avatar-uploader-icon">
                  <Plus/>
                </el-icon>
              </el-upload>
            </div>
            <p class="username">{{ userInfo.realName }}</p>
          </div>
        </el-col>

        <!-- 右侧信息区域 -->
        <el-col :span="16">
          <el-tabs v-model="activeTab" class="profile-tabs">
            <el-tab-pane label="基本信息" name="info">
              <el-form
                  ref="formRef"
                  :model="form"
                  :rules="rules"
                  label-width="80px"
                  class="profile-form"
              >
                <el-form-item label="用户名">
                  <el-input v-model="form.username" disabled/>
                </el-form-item>

                <el-form-item label="真实姓名" prop="realName">
                  <el-input v-model="form.realName" disabled/>
                </el-form-item>

                <el-form-item label="手机号">
                  <el-input v-model="form.telephone" disabled/>
                </el-form-item>

                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="form.email"/>
                </el-form-item>

                <el-form-item label="密码" prop="password">
                  <el-input
                      v-model="form.password"
                      type="password"
                      show-password
                      placeholder="请输入密码,不输入不会修改密码"
                  />
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="submitForm">保存修改</el-button>
                  <el-button @click="resetForm">重置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="安全设置" name="security">
              <div class="security-info">
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="最后登录时间">
                    {{ userInfo.lastLoginTime || '暂无记录' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="登录IP">
                    {{ userInfo.lastLoginIp || '暂无记录' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="账户状态">
                    <el-tag type="success">正常</el-tag>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, computed, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {ElMessage, type FormInstance, type FormRules, type UploadProps} from 'element-plus'
import {useUserStore} from '@/store/user'
import type {UserInfo} from '@/types/auth.ts'
import {uploadFile} from '@/api/common_api.ts'
import {updateMyInfo} from '@/api/sys_user.ts'
import {getUserInfo} from "@/api/auth.ts";

const router = useRouter()

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const activeTab = ref('info')

// 表单数据
const form = reactive({
  id: 0,
  username: '',
  realName: '',
  telephone: '',
  email: '',
  password: '',
  headPortrait: ''
})

// 表单验证规则
const rules: FormRules = {
  realName: [
    {required: true, message: '请输入真实姓名', trigger: 'blur'}
  ],
  email: [
    {required: true, message: '请输入邮箱', trigger: 'blur'},
    {type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur'}
  ]
}

// 计算属性获取用户信息
const userInfo = computed(() => userStore.userInfo || {} as UserInfo)

// 处理头像上传
const handleAvatarUpload: UploadProps['httpRequest'] = async (options) => {
  const {file} = options

  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', 'image')

  try {
    const response = await uploadFile(formData)
    form.headPortrait = response.data
    userInfo.value.headPortrait = response.data
    ElMessage.success('头像上传成功')
    return response
  } catch (error) {
    ElMessage.error('上传失败')
    throw error
  }
}

// 头像上传前检查
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('头像必须是 JPG 或 PNG 格式!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const formData = {
        id: form.id,
        headPortrait: form.headPortrait,
        email: form.email,
        password: form.password
      }
      console.log(formData)
      await updateMyInfo(formData)
      ElMessage.success('信息更新成功')
      const res = await getUserInfo()
      console.log(res.data)
      // 更新本地存储的用户信息
      userStore.setUserInfo({
        ...res.data
      } as UserInfo)
    } catch (error) {
      ElMessage.error('更新失败')
      console.error(error)
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  // 重新填充当前用户信息
  if (userInfo.value) {
    form.id = userInfo.value.id
    form.username = userInfo.value.username
    form.realName = userInfo.value.realName
    form.telephone = userInfo.value.telephone
    form.email = userInfo.value.email || ''
    form.headPortrait = userInfo.value.headPortrait || ''
    form.password = ''
  }
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 初始化表单数据
const initFormData = () => {
  if (userInfo.value) {
    form.id = userInfo.value.id
    form.username = userInfo.value.username
    form.realName = userInfo.value.realName
    form.telephone = userInfo.value.telephone
    form.email = userInfo.value.email || ''
    form.headPortrait = userInfo.value.headPortrait || ''
  }
}

onMounted(() => {
  initFormData()
})
</script>

<style scoped lang="scss">
.profile-container {
  padding: 20px;

  .profile-card {
    max-width: 1000px;
    margin: 0 auto;

    .card-header {
      display: flex;
      align-items: center;
      gap: 15px;

      .back-button {
        padding: 8px 16px;
      }

      .title {
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }
    }

    .avatar-section {
      text-align: center;
      padding: 20px;

      .avatar-wrapper {
        margin-bottom: 20px;

        .avatar-uploader {
          :deep(.el-upload) {
            border: 1px dashed #d9d9d9;
            border-radius: 6px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: var(--el-transition-duration-fast);

            &:hover {
              border-color: var(--el-color-primary);
            }
          }

          .avatar-uploader-icon {
            font-size: 28px;
            color: #8c939d;
            width: 120px;
            height: 120px;
            text-align: center;
            line-height: 120px;
          }

          .avatar {
            width: 120px;
            height: 120px;
            display: block;
            border-radius: 50%;
            object-fit: cover;
          }
        }
      }

      .username {
        font-size: 20px;
        font-weight: bold;
        margin: 10px 0;
        color: #333;
      }

      .user-role {
        color: #999;
        margin: 5px 0;
      }
    }

    .profile-tabs {
      :deep(.el-tabs__content) {
        padding: 20px 0;
      }

      .profile-form {
        max-width: 500px;
      }

      .security-info {
        max-width: 500px;
      }
    }
  }
}
</style>