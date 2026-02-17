import {get, post} from '@/utils/request'
import type {
  SysRoleListVo,
  AddSysRoleRequest,
  UpdateSysRoleRequest,
  SysRoleQuery,
  EditRPEvt,
} from "@/types/sys_role.ts";
import type {ApiResponse, IdNumberRequest} from "@/types/common_types.ts";

// 获取角色列表
export const getRoleList = (params: SysRoleQuery) => {
  return get<ApiResponse<SysRoleListVo[]>>('/sysRole/getRoleList', params)
}

// 新增角色
export const addSysRole = (data: AddSysRoleRequest) => {
  return post<ApiResponse>('/sysRole/add', data)
}

// 更新角色
export const updateSysRole = (data: UpdateSysRoleRequest) => {
  return post<ApiResponse>('/sysRole/update', data)
}

// 删除角色
export const deleteSysRole = (data: IdNumberRequest) => {
  return post<ApiResponse>('/sysRole/del', data)
}

// 编辑角色权限
export const editRolePermissions = (data: EditRPEvt) => {
  return post<ApiResponse>('/sysRP/edit', data)
}

// 获取角色权限列表
export const getRolePermissions = (roleId: number) => {
  return get<ApiResponse<number[]>>(`/sysPermissions/rolePermissions/${roleId}`)
}