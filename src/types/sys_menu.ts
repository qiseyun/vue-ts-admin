/**
 * 菜单列表返回值类型
 */
export interface SysMenuListVo {
  id: number
  pid: number
  name: string
  permission: string
  keepAlive: string
  type: number
  children?: SysMenuListVo[]
}

/**
 * 新增或编辑菜单请求参数类型
 */
export interface AddOrEditMenuOrButtonEvt {
  id?: number
  name: string
  permission: string
  parentId: number
  keepAlive: number
  type: number
  describe?: string
}