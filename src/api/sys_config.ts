import {get, post} from '@/utils/request'
import type {
  SysConfigQuery,
  AddSysConfigRequest,
  UpdateSysConfigRequest,
  SysConfigListVo
} from '@/types/sys_config.ts'
import type {ApiResponse, IdNumberRequest} from '@/types/common_types.ts'

// 获取系统配置列表
export const getSysConfigList = (params: SysConfigQuery) => {
  return get<ApiResponse<SysConfigListVo[]>>('/sysConfig/list', params)
}

// 添加系统配置
export const addSysConfig = (data: AddSysConfigRequest) => {
  return post<ApiResponse>('/sysConfig/add', data)
}

// 更新系统配置
export const updateSysConfig = (data: UpdateSysConfigRequest) => {
  return post<ApiResponse>('/sysConfig/update', data)
}

// 删除系统配置
export const deleteSysConfig = (data: IdNumberRequest) => {
  return post<ApiResponse>('/sysConfig/del', data)
}