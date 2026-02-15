import {get, post} from '@/utils/request'
import type {SysMenuListVo} from '@/types/sys_menu'
import type {IdNumberRequest} from '@/types/common_types.ts'
import type {ApiResponse} from '@/types/common_types'
import type {AddOrEditMenuOrButtonEvt} from '@/types/sys_menu'

/**
 * 获取菜单树列表
 * @param data 请求参数，id必须为0
 */
export const getMenuTree = (data: IdNumberRequest) => {
  return get<ApiResponse<SysMenuListVo[]>>('/sysMenu/tree', data)
}

/**
 * 新增菜单
 * @param data 菜单信息
 */
export const addMenu = (data: AddOrEditMenuOrButtonEvt) => {
  return post<ApiResponse<void>>('/sysMenu/add', data)
}

/**
 * 编辑菜单
 * @param data 菜单信息
 */
export const updateMenu = (data: AddOrEditMenuOrButtonEvt) => {
  return post<ApiResponse<void>>('/sysMenu/update', data)
}

/**
 * 删除菜单
 * @param data 菜单信息
 */
export const deleteMenu = (data: IdNumberRequest) => {
  return post<ApiResponse<void>>('/sysMenu/del', data)
}