import axios from 'axios'
import {ElMessage} from 'element-plus'

// 创建专门用于文件上传的axios实例
const uploadService = axios.create({
  baseURL: import.meta.env.VITE_UPLOAD_FILES_API_BASE_URL,
  timeout: 30000,
})

// 文件上传请求拦截器
uploadService.interceptors.request.use(
    (config) => {
      // 从localStorage获取token
      const token = localStorage.getItem('token')
      // 如果有token，在请求头中添加token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      console.error('上传请求错误：', error)
      return Promise.reject(error)
    }
)

// 文件上传响应拦截器
uploadService.interceptors.response.use(
    (response) => {
      const res = response.data
      // 如果返回的状态码不是0，说明接口有问题
      if (res.code !== 0) {
        ElMessage.error(res.msg || '上传失败')
        return Promise.reject(new Error(res.msg || '上传失败'))
      }
      return res
    },
    (error) => {
      console.error('上传响应错误：', error)
      ElMessage.error('上传失败，请稍后重试')
      return Promise.reject(error)
    }
)

export default uploadService