import {get, post} from '@/utils/request'
import type {AddSysUserEvt, EditUserRoleEvt, SysUserListVo, UpdateSysUserEvt} from "@/types/sys_user.ts";
import type {ApiResponse, IdNumberRequest} from "@/types/common_types.ts";

// 获取用户列表
export const getUserList = (params: {
  phone?: string
  current: number
  size: number
}) => {
  return get<ApiResponse<SysUserListVo[]>>('/sysUser/list', params)
}

// 新增用户
export const addSysUser = (data: AddSysUserEvt) => {
  return post<ApiResponse>('/sysUser/add', data)
}

// 更新用户
export const updateSysUser = (data: UpdateSysUserEvt) => {
  return post<ApiResponse>('/sysUser/update', data)
}

// 删除用户
export const deleteSysUser = (data: IdNumberRequest) => {
  return post<ApiResponse>('/sysUser/del', data)
}

// 获取用户角色列表
export const getUserRoles = (sysUserId: number) => {
  return get<ApiResponse<number[]>>(`/sysUserRole/getRoles/${sysUserId}`)
}

// 编辑用户角色
export const editUserRoles = (data: EditUserRoleEvt) => {
  return post<ApiResponse>('/sysUserRole/editRoles', data)
}