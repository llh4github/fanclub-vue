import { get, post } from "./request"
import type { JsonResp } from "./types"

export interface TopicBrief {
  id: string
  title: string
  description: string
  open_at: string
  close_at: string
}

export interface CreateSubmissionResp {
  submission_id: string
}

export async function getTopicCount(bid: number): Promise<JsonResp<number>> {
  return get(`/treehole/topic/count?bid=${bid}`)
}

export async function getTopicList(bid: number): Promise<JsonResp<TopicBrief[]>> {
  return get(`/treehole/topic/list?bid=${bid}`)
}

export async function addSubmission(params: {
  topic_id: number | string
  content: string
  captcha_token: string
}): Promise<JsonResp<CreateSubmissionResp>> {
  return post("/treehole/submission/add", params)
}
