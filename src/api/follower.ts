import { get } from "./request"
import type { JsonResp } from "./types"

export interface DailyFollowerNum {
  date: string
  num: number
}

export async function getLatestFollowerNum(bid: number): Promise<JsonResp<DailyFollowerNum>> {
  return get<DailyFollowerNum>(`/anchor/followerNum/latest?bid=${bid}`)
}

export async function getPastFollowerNum(
  bid: number,
  pastDays = 30,
): Promise<JsonResp<DailyFollowerNum[]>> {
  return get<DailyFollowerNum[]>(`/anchor/followerNum/past?bid=${bid}&past_days=${pastDays}`)
}
