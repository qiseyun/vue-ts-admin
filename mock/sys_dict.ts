import { MockMethod } from 'vite-plugin-mock'

// 模拟字典类型数据
const mockDictTypes = [
  { isDelete: 0, createBy: 0, updateBy: 0, gmtCreated: '2026-05-08T20:52:05', gmtModified: '2026-05-08T20:52:05', id: 1, typeName: '删除状态', typeCode: 'is_delete', remark: '逻辑删除标记', isLock: true },
  { isDelete: 0, createBy: 0, updateBy: 0, gmtCreated: '2026-05-08T20:52:30', gmtModified: '2026-05-08T20:52:30', id: 2, typeName: '禁用状态', typeCode: 'is_disable', remark: '', isLock: true },
  { isDelete: 0, createBy: 0, updateBy: 0, gmtCreated: '2026-05-08T20:52:46', gmtModified: '2026-05-08T20:52:46', id: 3, typeName: '性别', typeCode: 'gender', remark: '', isLock: false },
  { isDelete: 0, createBy: 0, updateBy: 0, gmtCreated: '2026-05-08T20:53:00', gmtModified: '2026-05-08T20:53:00', id: 4, typeName: '锁定状态', typeCode: 'is_lock', remark: '', isLock: true },
]

// 模拟字典枚举数据
const mockDictEnums = [
  { id: 1, dictTypeCode: 'is_delete', dictTypeId: 1, enumName: '未删除', enumCode: '0', sort: 1, remark: '', isLock: true },
  { id: 2, dictTypeCode: 'is_delete', dictTypeId: 1, enumName: '已删除', enumCode: '1', sort: 2, remark: '', isLock: true },
  { id: 3, dictTypeCode: 'is_disable', dictTypeId: 2, enumName: '启用', enumCode: '0', sort: 1, remark: '', isLock: true },
  { id: 4, dictTypeCode: 'is_disable', dictTypeId: 2, enumName: '禁用', enumCode: '1', sort: 2, remark: '', isLock: true },
  { id: 5, dictTypeCode: 'gender', dictTypeId: 3, enumName: '男', enumCode: '1', sort: 1, remark: '', isLock: false },
  { id: 6, dictTypeCode: 'gender', dictTypeId: 3, enumName: '女', enumCode: '2', sort: 2, remark: '', isLock: false },
  { id: 7, dictTypeCode: 'is_lock', dictTypeId: 4, enumName: '未锁定', enumCode: '0', sort: 1, remark: '', isLock: true },
  { id: 8, dictTypeCode: 'is_lock', dictTypeId: 4, enumName: '已锁定', enumCode: '1', sort: 2, remark: '', isLock: true },
]
let nextEnumId = 9
let nextTypeId = 5

const sysDictMock: MockMethod[] = [
  // 字典类型列表查询
  {
    url: '/mock-api/dictType/list',
    method: 'get',
    response: ({ query }) => {
      const { id, typeName, typeCode, remark } = query
      let list = [...mockDictTypes]

      if (id) list = list.filter(item => item.id === Number(id))
      if (typeName) list = list.filter(item => item.typeName.includes(typeName))
      if (typeCode) list = list.filter(item => item.typeCode.includes(typeCode))
      if (remark) list = list.filter(item => item.remark.includes(remark))

      return { code: 0, msg: 'success', data: list }
    },
  },
  // 新增字典类型
  {
    url: '/mock-api/dictType/add',
    method: 'post',
    response: ({ body }) => {
      const newType = {
        id: nextTypeId++,
        ...body,
        isDelete: 0,
        createBy: 0,
        updateBy: 0,
        gmtCreated: new Date().toISOString().replace('T', ' ').substring(0, 19),
        gmtModified: new Date().toISOString().replace('T', ' ').substring(0, 19),
      }
      mockDictTypes.push(newType)
      return { code: 0, msg: '添加成功', data: null }
    },
  },
  // 更新字典类型
  {
    url: '/mock-api/dictType/update',
    method: 'post',
    response: ({ body }) => {
      const index = mockDictTypes.findIndex(item => item.id === body.id)
      if (index > -1) {
        mockDictTypes[index] = { ...mockDictTypes[index], ...body, gmtModified: new Date().toISOString().replace('T', ' ').substring(0, 19) }
      }
      return { code: 0, msg: '更新成功', data: null }
    },
  },
  // 删除字典类型
  {
    url: '/mock-api/dictType/del',
    method: 'post',
    response: ({ body }) => {
      const index = mockDictTypes.findIndex(item => item.id === body.id)
      if (index > -1) mockDictTypes.splice(index, 1)
      return { code: 0, msg: '删除成功', data: null }
    },
  },
  // 根据字典类型ID获取枚举列表
  {
    url: '/mock-api/dict/getDictList',
    method: 'get',
    response: ({ query }) => {
      const dictTypeId = Number(query.dictTypeId)
      const list = mockDictEnums.filter(item => item.dictTypeId === dictTypeId)
      return { code: 0, msg: 'success', data: list }
    },
  },
  // 新增字典枚举
  {
    url: '/mock-api/dict/add',
    method: 'post',
    response: ({ body }) => {
      const newEnum = { id: nextEnumId++, ...body }
      mockDictEnums.push(newEnum)
      return { code: 0, msg: '添加成功', data: null }
    },
  },
  // 更新字典枚举
  {
    url: '/mock-api/dict/update',
    method: 'post',
    response: ({ body }) => {
      const index = mockDictEnums.findIndex(item => item.id === body.id)
      if (index > -1) mockDictEnums[index] = { ...mockDictEnums[index], ...body }
      return { code: 0, msg: '更新成功', data: null }
    },
  },
  // 删除字典枚举
  {
    url: '/mock-api/dict/del',
    method: 'post',
    response: ({ body }) => {
      const index = mockDictEnums.findIndex(item => item.id === body.id)
      if (index > -1) mockDictEnums.splice(index, 1)
      return { code: 0, msg: '删除成功', data: null }
    },
  },
  // 根据字典类型code批量获取字典Map
  {
    url: '/mock-api/dict/getDictMap',
    method: 'get',
    response: ({ query }) => {
      const codes = (query.dictTypeCodes || '').split(',').map((s: string) => s.trim()).filter(Boolean)
      const data: Record<string, typeof mockDictEnums> = {}
      codes.forEach((code: string) => {
        data[code] = mockDictEnums.filter(item => item.dictTypeCode === code)
      })
      return { code: 0, msg: 'success', data }
    },
  },
]

export default sysDictMock
