import {get} from '@/utils/request'
import type {SysMenuListVo} from '@/types/sys_menu'
import type {IdNumberRequest} from '@/types/common_types.ts'
import type {ApiResponse} from '@/types/common_types'

/**
 * 获取菜单树列表
 * @param data 请求参数，id必须为0
 */
export const getMenuTree = (data: IdNumberRequest) => {
  return get<ApiResponse<SysMenuListVo[]>>('/sysMenu/tree', data)
}