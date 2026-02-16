import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import {ElMessage} from 'element-plus'

// 判断是否启用mock
const isMockEnabled = import.meta.env.VITE_MOCK_ENABLE === 'true'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: isMockEnabled ? '/mock-api' : '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

// 请求拦截器
service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // 从localStorage获取token
      const token = localStorage.getItem('token')
      // 如果有token，在请求头中添加token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      console.error('请求错误：', error)
      return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    (response: AxiosResponse) => {
      const res = response.data
      // 如果返回的状态码不是0，说明接口有问题
      if (res.code !== 0) {
        // Token异常处理
        const tokenErrorCodes = [401, 11011, 11012, 11013, 11014, 11015, 11016]
        if (tokenErrorCodes.includes(res.code)) {
          ElMessage.error(res.msg || '登录状态已失效，请重新登录')
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          localStorage.removeItem('permissions')
          localStorage.removeItem('expiresTime')
          window.location.href = '/login'
          return Promise.reject(new Error(res.msg || '登录状态已失效'))
        }
        ElMessage.error(res.msg || '请求失败')
        return Promise.reject(new Error(res.msg || '请求失败'))
      }

      return res
    },
    (error) => {
      console.error('响应错误：', error)
      if (error.response) {
        switch (error.response.status) {
          case 401:
            ElMessage.error('登录已过期，请重新登录')
            localStorage.removeItem('token')
            localStorage.removeItem('userInfo')
            localStorage.removeItem('permissions')
            localStorage.removeItem('expiresTime')
            window.location.href = '/login'
            break
          case 403:
            ElMessage.error('没有权限访问')
            break
          case 404:
            ElMessage.error('请求的资源不存在')
            break
          case 500:
            ElMessage.error('服务器错误')
            break
          default:
            ElMessage.error(error.response.data.msg || '请求失败')
        }
      } else {
        ElMessage.error('网络错误，请检查网络连接')
      }

      return Promise.reject(error)
    }
)

// 封装请求方法
export function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  return service.request(config).then(response => response.data)
}

export function get<T = any>(url: string, params?: any): Promise<T> {
  return service.get(url, {params})
}

export function post<T = any>(url: string, data?: any): Promise<T> {
  return service.post(url, data)
}

export function put<T = any>(url: string, data?: any): Promise<T> {
  return service.put(url, data)
}

export function del<T = any>(url: string): Promise<T> {
  return service.delete(url)
}

export default service
