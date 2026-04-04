import { io, Socket } from 'socket.io-client'

/**
 * WebSocket 客户端配置
 */
export interface WebSocketConfig {
  url: string
  options?: {
    reconnection?: boolean
    reconnectionAttempts?: number
    reconnectionDelay?: number
    timeout?: number
  }
}

/**
 * WebSocket 客户端服务
 */
export class WebSocketService {
  private socket: Socket | null = null
  private config: WebSocketConfig

  constructor(config: WebSocketConfig) {
    this.config = config
  }

  /**
   * 连接到 WebSocket 服务器
   */
  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.config.url, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 5000,
        ...this.config.options,
      })

      this.setupEventHandlers()
    }
    return this.socket
  }

  /**
   * 断开 WebSocket 连接
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  /**
   * 发送消息
   */
  emit(event: string, data?: any): void {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  /**
   * 监听消息
   */
  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  /**
   * 取消监听
   */
  off(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    if (this.socket) {
      this.socket.on('connect', () => {
        console.log('WebSocket 连接成功')
      })

      this.socket.on('disconnect', () => {
        console.log('WebSocket 连接断开')
      })

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket 连接错误:', error)
      })
    }
  }

  /**
   * 获取当前连接状态
   */
  isConnected(): boolean {
    return this.socket?.connected || false
  }
}

/**
 * 默认 WebSocket 服务实例
 */
export const webSocketService = new WebSocketService({
  url: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
})
