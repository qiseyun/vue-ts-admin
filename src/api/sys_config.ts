import request from '@/utils/request'
import type {
  SysConfigQuery,
  AddSysConfigRequest,
  UpdateSysConfigRequest
} from '@/types/sys_config.ts'
import type {IdNumberRequest} from '@/types/common_types.ts'

// 获取系统配置列表
export const getSysConfigList = (params: SysConfigQuery) => {
  return request({
    url: '/sysConfig/list',
    method: 'GET',
    params
  })
}

// 添加系统配置
export const addSysConfig = (data: AddSysConfigRequest) => {
  return request({
    url: '/sysConfig/add',
    method: 'POST',
    data
  })
}

// 更新系统配置
export const updateSysConfig = (data: UpdateSysConfigRequest) => {
  return request({
    url: '/sysConfig/update',
    method: 'POST',
    data
  })
}

// 删除系统配置
export const deleteSysConfig = (data: IdNumberRequest) => {
  return request({
    url: '/sysConfig/del',
    method: 'POST',
    data
  })
}