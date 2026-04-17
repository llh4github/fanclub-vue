import { apiClient } from '../client'
import type { JsonWrapper } from '../types'

/**
 * 登录请求数据
 */
export interface LoginRequest {
  username: string
  password: string
  captcha: string
  captchaKey: string
  cryptoSid: string
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: string
  userId: number
  uname: string
  nickname?: string
}

/**
 * 更新密码请求数据
 */
export interface UpdatePasswordRequest {
  id?: number
  password: string
  cryptoSid: string
}

/**
 * 认证 API 服务
 */
export const authService = {
  /**
   * 登录
   */
  async login(data: LoginRequest): Promise<JsonWrapper<LoginResponse>> {
    return apiClient.post<LoginResponse>('/auth/login', data)
  },

  /**
   * 登出
   */
  async logout(): Promise<JsonWrapper<void>> {
    return apiClient.post<void>('/auth/logout')
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<JsonWrapper<{ id: number; username: string; role: string }>> {
    return apiClient.get<{ id: number; username: string; role: string }>('/auth/user')
  },

  /**
   * 更新密码
   */
  async updatePassword(data: UpdatePasswordRequest): Promise<JsonWrapper<boolean>> {
    return apiClient.put<boolean>('/sys/user/updatePassword', data)
  },
}
