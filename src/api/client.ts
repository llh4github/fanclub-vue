import type { JsonWrapper, ApiError } from './types'

/**
 * API 客户端配置
 */
export interface ApiClientConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
  debounceDelay?: number
}

/**
 * 防抖函数 - 对每个URL分别进行防抖
 */
function debounce(
  func: (url: string, options?: RequestInit) => Promise<any>,
  delay: number,
): (url: string, options?: RequestInit) => Promise<any> {
  const timeoutMap = new Map<string, ReturnType<typeof setTimeout>>()
  return (url: string, options?: RequestInit) => {
    const key = url
    if (timeoutMap.has(key)) {
      clearTimeout(timeoutMap.get(key) as ReturnType<typeof setTimeout>)
    }
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(async () => {
        timeoutMap.delete(key)
        try {
          const result = await func(url, options)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, delay)
      timeoutMap.set(key, timeoutId)
    })
  }
}

/**
 * API 客户端
 */
export class ApiClient {
  private config: ApiClientConfig
  private debouncedRequest: (url: string, options?: RequestInit) => Promise<any>

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 10000,
      debounceDelay: 300,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    }

    this.debouncedRequest = debounce(this.request.bind(this), this.config.debounceDelay as number)
  }

  /**
   * 发起 HTTP 请求
   */
  private async request<T>(url: string, options: RequestInit = {}): Promise<JsonWrapper<T>> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    // 获取存储的访问令牌
    const accessToken = localStorage.getItem('accessToken')

    try {
      const response = await fetch(`${this.config.baseURL}${url}`, {
        ...options,
        headers: {
          ...this.config.headers,
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw {
          code: errorData.code || String(response.status),
          msg: errorData.msg || response.statusText,
          module: errorData.module,
        } as ApiError
      }

      const data = (await response.json()) as JsonWrapper<T>

      if (data.code !== '200') {
        throw {
          code: data.code,
          msg: data.msg,
          module: data.module,
        } as ApiError
      }

      return data
    } catch (error) {
      clearTimeout(timeoutId)

      if ((error as any).name === 'AbortError') {
        throw {
          code: '408',
          msg: '请求超时',
        } as ApiError
      }

      throw error as ApiError
    }
  }

  /**
   * GET 请求
   */
  async get<T>(url: string, params?: Record<string, any>): Promise<JsonWrapper<T>> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''

    return this.debouncedRequest(url + queryString, {
      method: 'GET',
    }) as Promise<JsonWrapper<T>>
  }

  /**
   * POST 请求
   */
  async post<T>(url: string, data?: any): Promise<JsonWrapper<T>> {
    return this.debouncedRequest(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }) as Promise<JsonWrapper<T>>
  }

  /**
   * PUT 请求
   */
  async put<T>(url: string, data?: any): Promise<JsonWrapper<T>> {
    return this.debouncedRequest(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }) as Promise<JsonWrapper<T>>
  }

  /**
   * DELETE 请求
   */
  async delete<T>(url: string, data?: any): Promise<JsonWrapper<T>> {
    return this.debouncedRequest(url, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    }) as Promise<JsonWrapper<T>>
  }
}

/**
 * 默认 API 客户端实例
 */
export const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})
