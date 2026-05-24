import { post } from "./request"
import type { JsonResp } from "./types"

export interface LoginParams {
  username: string
  password: string
  captcha_token: string
  session_id: string
}

export interface LoginResponse {
  id: string
  username: string
  access_token: string
  refresh_token: string
  expiration_time: string
}

export async function login(params: LoginParams): Promise<JsonResp<LoginResponse>> {
  return post<LoginResponse>("/auth/login", params)
}

export async function logout(): Promise<JsonResp<string>> {
  return post<string>("/auth/logout")
}

export async function refreshToken(): Promise<JsonResp<LoginResponse>> {
  return post<LoginResponse>("/auth/refresh")
}
