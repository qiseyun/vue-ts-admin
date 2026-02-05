/**
 * 获取环境变量
 */
export function getEnv(key: keyof ImportMetaEnv): string {
  return import.meta.env[key] || ''
}

/**
 * 获取 API 基础路径
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || ''
}

/**
 * 获取应用标题
 */
export function getAppTitle(): string {
  return import.meta.env.VITE_APP_TITLE || 'vue-ts-admin'
}

/**
 * 是否为生产环境
 */
export function isProd(): boolean {
  return import.meta.env.VITE_APP_ENV === 'production'
}

/**
 * 是否为开发环境
 */
export function isDev(): boolean {
  return import.meta.env.VITE_APP_ENV === 'development'
}
