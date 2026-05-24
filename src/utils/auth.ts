export interface UserInfo {
  id: string | number
  username?: string
  access_token: string
  refresh_token?: string
  expiration_time: string
}

const ACCESS_TOKEN_KEY = "access_token"
const USER_ID_KEY = "user_id"
const USERNAME_KEY = "username"
const REFRESH_TOKEN_KEY = "refresh_token"

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY)
}

export function getUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function isLoggedIn(): boolean {
  return !!getAccessToken()
}

export function setAuthData(data: UserInfo): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token)
  localStorage.setItem(USER_ID_KEY, String(data.id))
  if (data.username) {
    localStorage.setItem(USERNAME_KEY, data.username)
  }
  if (data.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token)
  }
}

export function clearAuthData(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(USER_ID_KEY)
  localStorage.removeItem(USERNAME_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}
