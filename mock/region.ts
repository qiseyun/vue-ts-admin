import {MockMethod} from 'vite-plugin-mock'

// 模拟地区数据
const mockRegions = [
  {
    id: 110000,
    name: '北京市',
    pid: 0,
    zip: '100000',
    children: [
      {
        id: 110100,
        name: '北京市',
        pid: 110000,
        zip: '100000',
        children: [
          {id: 110101, name: '东城区', pid: 110100, zip: '100010'},
          {id: 110102, name: '西城区', pid: 110100, zip: '100032'},
          {id: 110105, name: '朝阳区', pid: 110100, zip: '100020'},
          {id: 110106, name: '丰台区', pid: 110100, zip: '100071'},
        ],
      },
    ],
  },
  {
    id: 310000,
    name: '上海市',
    pid: 0,
    zip: '200000',
    children: [
      {
        id: 310100,
        name: '上海市',
        pid: 310000,
        zip: '200000',
        children: [
          {id: 310101, name: '黄浦区', pid: 310100, zip: '200001'},
          {id: 310104, name: '徐汇区', pid: 310100, zip: '200030'},
          {id: 310105, name: '长宁区', pid: 310100, zip: '200050'},
          {id: 310106, name: '静安区', pid: 310100, zip: '200040'},
        ],
      },
    ],
  },
]

const regionMock: MockMethod[] = [
  // 获取地区树列表
  {
    url: '/mock-api/region/tree',
    method: 'get',
    response: () => {
      return {
        code: 0,
        msg: '获取成功',
        data: mockRegions,
      }
    },
  },
]

export default regionMock
