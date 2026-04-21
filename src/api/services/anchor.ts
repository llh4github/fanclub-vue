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
  /** B站ID */
  bid: number
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
 * 主播每日直播时长统计
 */
export interface AnchorLiveDurationDateDuration {
  /** 统计日期 */
  statDate: string
  /** 直播时长(秒) */
  liveDuration: number
}

/**
 * 查询周日程请求参数
 */
export interface AnchorLiveWeekScheduleSpec {
  /** B站ID（通常称为UID） */
  bid?: number
  /** 当前周的任意一天，格式：YYYY-MM-DD */
  week: string
}

/**
 * 直播日程项
 */
export interface AnchorLiveScheduleItemView {
  /** 直播开始时间，格式：YYYY-MM-DD HH:mm:ss */
  startTime: string
  /** 直播结束时间，格式：YYYY-MM-DD HH:mm:ss */
  endTime: string
  /** 直播主题 */
  topic: string
}

/**
 * 周直播记录请求参数
 */
export interface AnchorWeekLiveRecordSpec {
  /** 直播间ID */
  roomId?: number
  /** 当前周的任意一天，格式：YYYY-MM-DD */
  week: string
}

/**
 * 直播时间记录
 */
export interface AnchorLiveTimeRecord {
  /** 直播开始时间，格式：YYYY-MM-DD HH:mm:ss */
  liveTime: string
  /** 直播结束时间，格式：YYYY-MM-DD HH:mm:ss */
  endLiveTime: string
  /** 直播时长(秒) */
  liveDuration: number
  /** 直播状态 */
  liveStatus: string
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

  /**
   * 查询直播时长历史
   * @param roomId 直播间ID
   * @param date 截止日期，格式：YYYY-MM-DD
   * @returns 直播时长历史列表
   */
  async queryLiveDurationHistory(
    roomId: number,
    date: string,
  ): Promise<JsonWrapper<AnchorLiveDurationDateDuration[]>> {
    return apiClient.get<AnchorLiveDurationDateDuration[]>('/anchor/live-duration/query-history', {
      roomId,
      date,
    })
  },

  /**
   * 查询周日程
   * @param params 查询参数
   * @returns 周日程列表
   */
  async queryWeekSchedule(
    params: AnchorLiveWeekScheduleSpec,
  ): Promise<JsonWrapper<AnchorLiveScheduleItemView[]>> {
    return apiClient.post<AnchorLiveScheduleItemView[]>('/anchor/live-schedule/query-week', params)
  },

  /**
   * 查询周直播记录
   * @param params 查询参数
   * @returns 周直播记录列表
   */
  async queryWeekLiveRecord(
    params: AnchorWeekLiveRecordSpec,
  ): Promise<JsonWrapper<AnchorLiveTimeRecord[]>> {
    return apiClient.post<AnchorLiveTimeRecord[]>('/anchor/live-record/week-live-record', params)
  },
}
