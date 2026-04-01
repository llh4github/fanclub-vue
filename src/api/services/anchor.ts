import { apiClient } from '../client'
import type { JsonWrapper } from '../types'

/**
 * 直播状态枚举
 */
export enum LiveStatus {
  /** 直播中 */
  LIVING = 'LIVING',
  /** 直播结束 */
  END_LIVING = 'END_LIVING',
  /** 超时结束 */
  OVER_TIME_END = 'OVER_TIME_END',
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
  /** 直播结束时间 */
  endLiveTime?: string
  /** 直播时长(秒) */
  liveDuration?: number
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
 * 日期-粉丝数对
 */
export interface AnchorFollowerDateNum {
  /** 统计日期 */
  cntDate: string
  /** 粉丝数 */
  followerNum: number
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
   * 查询粉丝数历史
   * @param params 查询参数
   * @returns 粉丝数历史列表
   */
  async queryFollowerHistory(
    params: AnchorFollowerDateNumQuerySpec,
  ): Promise<JsonWrapper<AnchorFollowerDateNum[]>> {
    return apiClient.post<AnchorFollowerDateNum[]>('/anchor/follower/num/query-history', params)
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
