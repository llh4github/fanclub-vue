import { get, post, API_BASE_URL } from "./request"
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

export async function getSubmissionSummary(submissionId: string | number): Promise<JsonResp<string>> {
  return get("/treehole/submission/summary", { submission_id: submissionId })
}

export function getSubmissionSummaryStreamUrl(submissionId: string | number): string {
  return `${API_BASE_URL}/treehole/submission/summary/stream?submission_id=${submissionId}`
}
