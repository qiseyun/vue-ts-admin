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
export const updateUser = (id: number, data: Partial<AddSysUserEvt>) => {
  return request({
    url: `/sysUser/update/${id}`,
    method: 'put',
    data
  })
}

// 删除用户
export const deleteUser = (id: number) => {
  return request({
    url: `/sysUser/delete/${id}`,
    method: 'delete'
  })
}