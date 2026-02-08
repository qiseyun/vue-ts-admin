import request from '@/utils/request'
import type {AddSysUserEvt, UpdateSysUserEvt} from "@/types/sys_user.ts";
import type {IdNumberRequest} from "@/types/common_types.ts";

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
export const deleteUser = (data: IdNumberRequest) => {
  return request({
    url: '/sysUser/del',
    method: 'post',
    data
  })
}