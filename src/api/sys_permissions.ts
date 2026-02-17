import {get, post} from '@/utils/request'
import type {SysPermissionListVo} from '@/types/sys_permissions.ts'
import type {IdNumberRequest} from '@/types/common_types.ts'
import type {ApiResponse} from '@/types/common_types'
import type {AddOrEditPermissionEvt} from '@/types/sys_permissions.ts'

/**
 * 获取菜单树列表
 * @param data 请求参数，id必须为0
 */
export const getPermissionsTree = (data: IdNumberRequest) => {
  return get<ApiResponse<SysPermissionListVo[]>>('/sysPermissions/tree', data)
}

/**
 * 新增菜单
 * @param data 菜单信息
 */
export const addPermission = (data: AddOrEditPermissionEvt) => {
  return post<ApiResponse<void>>('/sysPermissions/add', data)
}

/**
 * 编辑菜单
 * @param data 菜单信息
 */
export const updatePermission = (data: AddOrEditPermissionEvt) => {
  return post<ApiResponse<void>>('/sysPermissions/update', data)
}

/**
 * 删除菜单
 * @param data 菜单信息
 */
export const deletePermission = (data: IdNumberRequest) => {
  return post<ApiResponse<void>>('/sysPermissions/del', data)
}