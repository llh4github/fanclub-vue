import type { JsonWrapper, ApiError } from './types';

/**
 * API 客户端配置
 */
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * API 客户端
 */
export class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    };
  }

  /**
   * 发起 HTTP 请求
   */
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<JsonWrapper<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.baseURL}${url}`, {
        ...options,
        headers: {
          ...this.config.headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          code: errorData.code || String(response.status),
          msg: errorData.msg || response.statusText,
          module: errorData.module,
        } as ApiError;
      }

      const data = await response.json() as JsonWrapper<T>;
      
      if (data.code !== '200') {
        throw {
          code: data.code,
          msg: data.msg,
          module: data.module,
        } as ApiError;
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw {
          code: '408',
          msg: '请求超时',
        } as ApiError;
      }

      throw error as ApiError;
    }
  }

  /**
   * GET 请求
   */
  async get<T>(url: string, params?: Record<string, any>): Promise<JsonWrapper<T>> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    
    return this.request<T>(url + queryString, {
      method: 'GET',
    });
  }

  /**
   * POST 请求
   */
  async post<T>(url: string, data?: any): Promise<JsonWrapper<T>> {
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT 请求
   */
  async put<T>(url: string, data?: any): Promise<JsonWrapper<T>> {
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE 请求
   */
  async delete<T>(url: string): Promise<JsonWrapper<T>> {
    return this.request<T>(url, {
      method: 'DELETE',
    });
  }
}

/**
 * 默认 API 客户端实例
 */
export const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});
