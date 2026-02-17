/**
 * 菜单列表返回值类型
 */
export interface SysPermissionListVo {
  id: number
  pid: number
  name: string
  permission: string
  keepAlive: string
  type: number
  children?: SysPermissionListVo[]
}

/**
 * 新增或编辑菜单请求参数类型
 */
export interface AddOrEditPermissionEvt {
  id?: number
  name: string
  permission: string
  parentId: number
  keepAlive: number
  type: number
  describe?: string
}