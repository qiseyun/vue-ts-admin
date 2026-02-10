export interface SysRoleListVo {
  id: number
  roleName: string
  roleCode: string
  roleDesc: string
  status: number
  createTime: string
}

export interface AddSysRoleRequest {
  roleName: string
  roleCode: string
  roleDesc: string
}

export interface UpdateSysRoleRequest {
  id: number
  roleName: string
  roleCode: string
  roleDesc: string
}

export interface SysRoleQuery {
  roleName?: string
  roleCode?: string
  current: number
  size: number
}

// 编辑角色权限请求参数
export interface EditRPEvt {
  roleId: number
  ids: number[]
}