import {MockMethod} from 'vite-plugin-mock'

// 模拟系统配置数据
const mockConfigs = [
  {
    id: 1,
    configName: '系统名称',
    configKey: 'sys.name',
    configValue: 'mikuyun管理后台',
    isLock: 1,
    remark: '系统显示名称',
    gmtCreated: '2024-01-01 10:00:00',
    gmtModified: '2024-01-01 10:00:00',
  },
  {
    id: 2,
    configName: '系统版本',
    configKey: 'sys.version',
    configValue: 'v1.0.0',
    isLock: 1,
    remark: '当前系统版本号',
    gmtCreated: '2024-01-01 10:00:00',
    gmtModified: '2024-01-01 10:00:00',
  },
  {
    id: 3,
    configName: '文件上传大小限制',
    configKey: 'upload.maxSize',
    configValue: '10485760',
    isLock: 0,
    remark: '单位：字节，默认10MB',
    gmtCreated: '2024-01-02 10:00:00',
    gmtModified: '2024-01-02 10:00:00',
  },
]

const sysConfigMock: MockMethod[] = [
  // 获取系统配置列表
  {
    url: '/mock-api/sysConfig/list',
    method: 'get',
    response: ({query}) => {
      const {configName, configKey, current = 1, size = 10} = query
      let list = [...mockConfigs]
      
      // 根据配置名称筛选
      if (configName) {
        list = list.filter(config => config.configName.includes(configName))
      }
      
      // 根据配置键筛选
      if (configKey) {
        list = list.filter(config => config.configKey.includes(configKey))
      }
      
      return {
        code: 0,
        msg: '获取成功',
        data: list,
      }
    },
  },
  // 添加系统配置
  {
    url: '/mock-api/sysConfig/add',
    method: 'post',
    response: ({body}) => {
      const newConfig = {
        id: mockConfigs.length + 1,
        ...body,
        isLock: body.isLock || 0,
        gmtCreated: new Date().toISOString().replace('T', ' ').substring(0, 19),
        gmtModified: new Date().toISOString().replace('T', ' ').substring(0, 19),
      }
      mockConfigs.push(newConfig)
      return {
        code: 0,
        msg: '添加成功',
        data: null,
      }
    },
  },
  // 更新系统配置
  {
    url: '/mock-api/sysConfig/update',
    method: 'post',
    response: ({body}) => {
      const index = mockConfigs.findIndex(config => config.id === body.id)
      if (index > -1) {
        mockConfigs[index] = {
          ...mockConfigs[index],
          ...body,
          gmtModified: new Date().toISOString().replace('T', ' ').substring(0, 19),
        }
      }
      return {
        code: 0,
        msg: '更新成功',
        data: null,
      }
    },
  },
  // 删除系统配置
  {
    url: '/mock-api/sysConfig/del',
    method: 'post',
    response: ({body}) => {
      const index = mockConfigs.findIndex(config => config.id === body.id)
      if (index > -1) {
        mockConfigs.splice(index, 1)
      }
      return {
        code: 0,
        msg: '删除成功',
        data: null,
      }
    },
  },
]

export default sysConfigMock
