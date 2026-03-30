import { apiClient } from '../client'
import type { JsonWrapper } from '../types'

/**
 * 直播状态枚举
 */
export enum LiveStatus {
  /** 直播中 */
  LIVING = 'LIVING',
  /** 未直播 */
  NOT_LIVING = 'NOT_LIVING',
  /** 超时 */
  OVER_TIME = 'OVER_TIME',
  /** 未知 */
  UNKNOWN = 'UNKNOWN',
}

/**
 * 直播状态响应数据
 */
export interface AnchorLiveRecordLiveStatus {
  /** 直播开始时间 */
  liveTime?: string
  /** 直播状态 */
  liveStatus: LiveStatus
}

/**
 * 查询指定日期的粉丝数量请求参数
 */
export interface AnchorFollowerDateNumQuerySpec {
  /** B站UID */
  biliId: number
  /** 统计日期，格式：YYYY-MM-DD */
  cntDate: string
}

/**
 * 主播 API 服务
 */
export const anchorService = {
  /**
   * 查询指定日期的粉丝数量
   * @param params 查询参数
   * @returns 粉丝数量
   */
  async queryFollowerNum(params: AnchorFollowerDateNumQuerySpec): Promise<JsonWrapper<number>> {
    return apiClient.post<number>('/anchor/follower/num/query', params)
  },

  /**
   * 查询直播状态
   * @param roomId 直播间ID
   * @returns 直播状态
   */
  async getLiveStatus(roomId: number): Promise<JsonWrapper<AnchorLiveRecordLiveStatus>> {
    return apiClient.get<AnchorLiveRecordLiveStatus>('/anchor/live-record/live-status', { roomId })
  },
}
