import type { JsonResp } from "./types"
import { isSuccess } from "./types"
import { useDebounceFn } from "@vueuse/core"
import { getAccessToken, setAuthData, clearAuthData } from "@/utils/auth"
import { refreshToken as refreshTokenApi } from "@/api/auth"
import type { LoginResponse } from "@/api/auth"
import type { Router } from "vue-router"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api"
export { API_BASE_URL }

const pendingRequests = new Map<string, AbortController>()

let authInterceptorCallback: ((isUnauthorized: boolean) => void) | null = null
let routerInstance: Router | null = null

export function setAuthInterceptor(
  callback: (isUnauthorized: boolean) => void,
  router?: Router,
): void {
  authInterceptorCallback = callback
  routerInstance = router || null
}

function stringifyBodyWithBigInt(body: unknown): string | undefined {
  if (body === undefined) return undefined
  return JSON.stringify(body, (_key, value) => {
    if (typeof value === "bigint") {
      return Number(value)
    }
    return value
  })
}

function parseBigIntJson(text: string): unknown {
  const BIGINT_REGEX = /:\s*(\d{15,})/g
  const withQuoted = text.replace(BIGINT_REGEX, ':"$1"')
  return JSON.parse(withQuoted)
}

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(callback: (token: string) => void): void {
  refreshSubscribers.push(callback)
}

function onTokenRefreshed(token: string): void {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

async function handleTokenRefresh(): Promise<boolean> {
  try {
    const resp = await refreshTokenApi()
    if (isSuccess(resp.code) && resp.data) {
      const newTokens: LoginResponse = resp.data
      setAuthData(newTokens)
      onTokenRefreshed(newTokens.access_token)
      return true
    }
  } catch {
    clearAuthData()
    routerInstance?.push("/admin/login")
    return false
  }

  clearAuthData()
  routerInstance?.push("/admin/login")
  return false
}

export async function request<T>(path: string, options?: RequestInit): Promise<JsonResp<T>> {
  const url = `${API_BASE_URL}${path}`

  const controller = new AbortController()
  const requestKey = `${options?.method || "GET"}-${path}`

  const lastController = pendingRequests.get(requestKey)
  if (lastController) {
    lastController.abort()
  }
  pendingRequests.set(requestKey, controller)

  const token = getAccessToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        ...headers,
        ...options?.headers,
      },
      ...options,
    })

    pendingRequests.delete(requestKey)

    if (response.status === 401) {
      const text = await response.text()
      const result = parseBigIntJson(text) as JsonResp<T>

      if (result.code === "AuthTokenExpired" || result.code === "AuthFailed") {
        if (!isRefreshing) {
          isRefreshing = true
          const success = await handleTokenRefresh()
          isRefreshing = false

          if (success) {
            return request<T>(path, options)
          }
        } else {
          return new Promise((resolve) => {
            subscribeTokenRefresh((newToken) => {
              headers["Authorization"] = `Bearer ${newToken}`
              fetch(url, {
                signal: controller.signal,
                headers,
                ...options,
              })
                .then((res) => res.text())
                .then((text) => {
                  resolve(parseBigIntJson(text) as JsonResp<T>)
                })
            })
          })
        }
      }

      authInterceptorCallback?.(true)
      return result
    }

    const text = await response.text()
    const result: JsonResp<T> = parseBigIntJson(text) as JsonResp<T>

    if (result.code !== "OK") {
      if (result.code === "AuthTokenExpired") {
        if (!isRefreshing) {
          isRefreshing = true
          const success = await handleTokenRefresh()
          isRefreshing = false

          if (success) {
            return request<T>(path, options)
          }
        }
      }
    }

    return result
  } catch (error) {
    pendingRequests.delete(requestKey)
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("请求被取消")
    }
    throw error
  }
}

export async function get<T>(
  path: string,
  params?: Record<string, string | number | boolean>,
): Promise<JsonResp<T>> {
  let url = path
  if (params) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      searchParams.append(key, String(value))
    }
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }
  return request<T>(url, { method: "GET" })
}

export async function post<T>(path: string, body?: unknown): Promise<JsonResp<T>> {
  return request<T>(path, {
    method: "POST",
    body: stringifyBodyWithBigInt(body),
  })
}

export async function put<T>(path: string, body?: unknown): Promise<JsonResp<T>> {
  return request<T>(path, {
    method: "PUT",
    body: stringifyBodyWithBigInt(body),
  })
}

export async function del<T>(path: string, body?: unknown): Promise<JsonResp<T>> {
  return request<T>(path, {
    method: "DELETE",
    body: stringifyBodyWithBigInt(body),
  })
}

export function debouncedGet<T>(path: string, duration = 300): () => Promise<JsonResp<T>> {
  return useDebounceFn(() => get<T>(path), duration)
}

export function debouncedPost<T>(
  path: string,
  body: unknown,
  duration = 300,
): () => Promise<JsonResp<T>> {
  return useDebounceFn(() => post<T>(path, body), duration)
}

export function debouncedPut<T>(
  path: string,
  body: unknown,
  duration = 300,
): () => Promise<JsonResp<T>> {
  return useDebounceFn(() => put<T>(path, body), duration)
}

export function debouncedDel<T>(
  path: string,
  body: unknown,
  duration = 300,
): () => Promise<JsonResp<T>> {
  return useDebounceFn(() => del<T>(path, body), duration)
}

export function cancelRequest(method: string, path: string): void {
  const requestKey = `${method}-${path}`
  const controller = pendingRequests.get(requestKey)
  if (controller) {
    controller.abort()
    pendingRequests.delete(requestKey)
  }
}
