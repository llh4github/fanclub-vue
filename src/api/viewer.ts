import { get } from "./request"
import type { JsonResp } from "./types"
import { Liko } from "@/config"

export interface ViewerScBvCheckResult {
  exists: boolean
  count: number
}

export async function checkScBv(bv: string): Promise<JsonResp<ViewerScBvCheckResult>> {
  return get<ViewerScBvCheckResult>("/viewer/scBv/check", {
    bv,
    room_id: Liko.RoomID,
  })
}
