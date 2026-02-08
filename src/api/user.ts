import request from '@/utils/request'

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

export interface IdEvt {
  id: number
}

// 获取用户列表
export const getUserList = (params: {
  phone?: string
  current: number
  size: number
}) => {
  return request({
    url: '/sysUser/list',
    method: 'get',
    params
  })
}

// 新增用户
export const addUser = (data: AddSysUserEvt) => {
  return request({
    url: '/sysUser/add',
    method: 'post',
    data
  })
}

// 更新用户
export const updateUser = (data: UpdateSysUserEvt) => {
  return request({
    url: '/sysUser/update',
    method: 'post',
    data
  })
}

// 删除用户
export const deleteUser = (data: IdEvt) => {
  return request({
    url: '/sysUser/del',
    method: 'post',
    data
  })
}