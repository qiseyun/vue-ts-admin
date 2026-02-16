import {MockMethod} from 'vite-plugin-mock'

const commonMock: MockMethod[] = [
  // 文件上传接口
  {
    url: '/mock-api/file/upload/qiniu',
    method: 'post',
    response: () => {
      return {
        code: 0,
        msg: '上传成功',
        data: {
          url: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
          name: 'mock_file.png',
        },
      }
    },
  },
]

export default commonMock
