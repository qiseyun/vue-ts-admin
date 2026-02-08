// 用户信息类型
export interface UserInfo {
  id: number
  username: string
  telephone: string
  realName: string
  headPortrait: string
  email: string
  userType: number
}

// 登录表单类型
export interface LoginForm {
  username: string
  password: string
}

// 登录响应类型
export interface LoginResponse {
  accessToken: string
  expiresTime: number
}
