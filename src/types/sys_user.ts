export interface SysUserListVo {
  id: number
  username: string
  realName: string
  phone: string
  avatar?: string
  deptId: number
  lockFlag: number
  email?: string
  gmtCreated: string
}

export interface AddSysUserEvt {
  username: string
  telephone: string
  password: string
  realName: string
  email?: string
}

export interface UpdateSysUserEvt {
  id: number
  username: string
  telephone: string
  realName: string
  email?: string
}

export interface EditUserRoleEvt {
  sysUserId: number
  roleIds: number[]
}