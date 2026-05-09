import { get, post } from '@/utils/request'
import type { ApiResponse, IdNumberRequest } from '@/types/common_types'
import type { DictEnumVo, DictMap, DictTypeVo, SaveDictEnumEvt, SaveDictTypeEvt } from '@/types/sys_dict'

// 字典类型列表查询
export const getDictTypeList = (params: {
  id?: number
  typeName?: string
  typeCode?: string
  remark?: string
  current: number
  size: number
}) => {
  return get<ApiResponse<DictTypeVo[]>>('/dictType/list', params)
}

// 新增字典类型
export const addDictType = (data: SaveDictTypeEvt) => {
  return post<ApiResponse>('/dictType/add', data)
}

// 更新字典类型
export const updateDictType = (data: SaveDictTypeEvt) => {
  return post<ApiResponse>('/dictType/update', data)
}

// 删除字典类型
export const deleteDictType = (data: IdNumberRequest) => {
  return post<ApiResponse>('/dictType/del', data)
}

// 根据字典类型ID获取枚举列表
export const getDictList = (dictTypeId: number) => {
  return get<ApiResponse<DictEnumVo[]>>('/dict/getDictList', { dictTypeId })
}

// 新增字典枚举
export const addDictEnum = (data: SaveDictEnumEvt) => {
  return post<ApiResponse>('/dict/add', data)
}

// 更新字典枚举
export const updateDictEnum = (data: SaveDictEnumEvt) => {
  return post<ApiResponse>('/dict/update', data)
}

// 删除字典枚举
export const deleteDictEnum = (data: IdNumberRequest) => {
  return post<ApiResponse>('/dict/del', data)
}

// 根据字典类型code批量获取字典Map
export const getDictMap = (dictTypeCodes: string) => {
  return get<ApiResponse<DictMap>>('/dict/getDictMap', { dictTypeCodes })
}
