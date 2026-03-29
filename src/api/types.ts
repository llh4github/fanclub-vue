/**
 * 通用响应结构（JSON）
 */
export interface JsonWrapper<T> {
  /** 响应码 */
  code: string;
  /** 响应消息 */
  msg: string;
  /** 业务模块名，通常在请求异常时有值 */
  module?: string;
  /** 响应数据 */
  data?: T;
}

/**
 * API 错误类型
 */
export interface ApiError {
  code: string;
  msg: string;
  module?: string;
}
