import { get } from "./request"
import type { JsonResp } from "./types"

export interface LiveSchedule {
  emoji: string
  start_time: string
  end_time: string
  topic: string
}

export interface LatestLiveRecord {
  live_key: string
  live_status: number
  live_time: string
  end_live_time: string
  live_duration: number
}

export interface WeekLiveRecord {
  live_key: string
  live_status: number
  live_time: string
  end_live_time: string
  live_duration: number
}

export const LiveRecordStatus = {
  UNKNOWN: 0,
  LIVING: 1,
  END_LIVING: 2,
  OVER_TIME_END: 3,
} as const

export type LiveRecordStatus = (typeof LiveRecordStatus)[keyof typeof LiveRecordStatus]

export async function getWeeklySchedule(bid: number): Promise<JsonResp<LiveSchedule[]>> {
  return get<LiveSchedule[]>(`/anchor/liveSchedule/weekly?bid=${bid}`)
}

export async function getLatestLiveRecord(roomId: number): Promise<JsonResp<LatestLiveRecord>> {
  return get<LatestLiveRecord>(`/anchor/liveRecord/latest?room_id=${roomId}`)
}

export async function getWeekLiveRecords(roomId: number): Promise<JsonResp<WeekLiveRecord[]>> {
  return get<WeekLiveRecord[]>(`/anchor/liveRecord/week?room_id=${roomId}`)
}
