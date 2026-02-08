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