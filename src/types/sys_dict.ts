// 字典类型
export interface DictTypeVo {
  isDelete: number
  createBy: number
  updateBy: number
  gmtCreated: string
  gmtModified: string
  id: number
  typeName: string
  typeCode: string
  remark: string
  isLock: boolean
}

// 字典枚举项
export interface DictEnumVo {
  id: number
  dictTypeCode: string
  enumName: string
  enumCode: string
  sort: number
  remark: string
  isLock: boolean
  isDelete: number
}

// 字典 Map（key 为 dictTypeCode）
export interface DictMap {
  [dictTypeCode: string]: DictEnumVo[]
}

// 新增/编辑字典类型
export interface SaveDictTypeEvt {
  id?: number
  typeName: string
  typeCode: string
  remark?: string
  isLock?: boolean
}

// 新增/编辑字典枚举
export interface SaveDictEnumEvt {
  id?: number
  dictTypeCode: string
  dictTypeId: number
  enumName: string
  enumCode: string
  sort?: number
  remark?: string
  isLock?: boolean
}
