import {MockMethod} from 'vite-plugin-mock'
import authMock from './auth'
import sysUserMock from './sys_user'
import sysPermissionsMock from './sys_permissions'
import sysRoleMock from './sys_role'
import commonMock from './common'
import regionMock from './region'
import sysConfigMock from './sys_config'

export default [
  ...authMock,
  ...sysUserMock,
  ...sysPermissionsMock,
  ...sysRoleMock,
  ...commonMock,
  ...regionMock,
  ...sysConfigMock,
] as MockMethod[]
