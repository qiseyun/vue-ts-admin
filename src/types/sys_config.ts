// 系统参数配置类型定义
export interface SysConfigListVo {
  id: number
  configName: string
  configKey: string
  configValue: string
  isLock: number
  remark?: string
  gmtCreated: string
  gmtModified?: string
}

export interface SysConfigQuery {
  configName?: string
  configKey?: string
  current: number
  size: number
}

export interface AddSysConfigRequest {
  configName: string
  configKey: string
  configValue: string
  isLock?: number
  remark?: string
}

export interface UpdateSysConfigRequest {
  id: number
  configName: string
  configKey: string
  configValue: string
  isLock?: number
  remark?: string
}