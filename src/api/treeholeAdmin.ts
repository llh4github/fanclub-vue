import { get, post, put, del } from "./request"
import type { JsonResp } from "./types"

export interface TreeholeTopic {
  id: string
  title: string
  description: string
  open_at: string
  close_at: string
  is_active: boolean
  bid: number
  created_time: string
  updated_time: string
}

export interface TopicPageItem {
  id: string | number
  bid: number
  title: string
  description: string
  open_at: string
  close_at: string
  is_active: boolean
  created_time: string
  total_submission_count: number
  hidden_submission_count: number
}

export interface CreateTopicReq {
  bid: number
  title: string
  description: string
  open_at: string
  close_at: string
  is_active: boolean
}

export interface UpdateTopicReq {
  id: string
  title?: string
  description?: string
  open_at?: string
  close_at?: string
  is_active?: boolean
}

export interface PageReq {
  page_index?: number
  page_size?: number
}

export interface PageResp<T> {
  page_index: number
  page_size: number
  total_row_count: number
  total_page: number
  records: T[]
}

export function getTopicPage(params: {
  bid?: number
  is_active?: boolean
  page_index?: number
  page_size?: number
}): Promise<JsonResp<PageResp<TopicPageItem>>> {
  const filteredParams: Record<string, string | number> = {}
  if (params.bid !== undefined) filteredParams.bid = params.bid
  if (params.is_active !== undefined) filteredParams.is_active = params.is_active ? 1 : 0
  if (params.page_index !== undefined) filteredParams.page_index = params.page_index
  if (params.page_size !== undefined) filteredParams.page_size = params.page_size
  return get("/treehole/topic/admin/page", filteredParams)
}

export function createTopic(data: CreateTopicReq): Promise<JsonResp<TreeholeTopic>> {
  return post("/treehole/topic/add", data)
}

export function updateTopic(data: UpdateTopicReq): Promise<JsonResp<string>> {
  return put("/treehole/topic/update", data)
}

export function setTopicStatus(id: string, isActive: boolean): Promise<JsonResp<string>> {
  return put("/treehole/topic/status", { id, is_active: isActive })
}

export function deleteTopic(id: string): Promise<JsonResp<string>> {
  return del(`/treehole/topic/delete?id=${id}`)
}

export interface TopicDetail {
  id: string
  bid: number
  title: string
  description: string
  open_at: string
  close_at: string
  is_active: boolean
  created_time: string
  updated_time: string
  total_submission_count: number
  hidden_submission_count: number
}

export function getTopicDetail(id: string | number): Promise<JsonResp<TopicDetail>> {
  return get("/treehole/topic/get", { id })
}

export interface Submission {
  id: string
  submission_id: string
  topic_id: string | number
  topic_title?: string
  summary: string
  content?: string
  audit_status: number
  submitter?: string
  submit_time: string
  review_time?: string
  review_comment?: string
}

export interface SubmissionPageReq {
  topic_id?: string | number
  submission_id?: string
  audit_status?: number
  summary?: string
  page_index?: number
  page_size?: number
}

export function getSubmissionPage(
  params: SubmissionPageReq,
): Promise<JsonResp<PageResp<Submission>>> {
  const filteredParams: Record<string, string | number> = {}
  if (params.topic_id !== undefined) filteredParams.topic_id = params.topic_id
  if (params.submission_id !== undefined) filteredParams.submission_id = params.submission_id
  if (params.audit_status !== undefined) filteredParams.audit_status = params.audit_status
  if (params.summary !== undefined) filteredParams.summary = params.summary
  if (params.page_index !== undefined) filteredParams.page_index = params.page_index
  if (params.page_size !== undefined) filteredParams.page_size = params.page_size
  return get("/treehole/submission/admin/page", filteredParams)
}

export function updateSubmissionStatus(
  id: string,
  auditStatus: number,
  comment?: string,
): Promise<JsonResp<string>> {
  return put("/treehole/submission/admin/audit", {
    id,
    audit_status: auditStatus,
    comment,
  })
}

export function deleteSubmission(id: string): Promise<JsonResp<string>> {
  return del(`/treehole/submission/delete?id=${id}`)
}

export interface SubmissionNavItem {
  id: string
  submission_id: string
  content_html: string
  submit_time: string
  audit_status: number
  has_summary?: boolean
}

export interface SubmissionNavResp {
  page_index: number
  record: SubmissionNavItem | null
  total_count: number
}

export function getSubmissionNavigate(
  topicId: string | number,
  pageIndex: number = 1,
  onlyApproved: boolean = false,
): Promise<JsonResp<SubmissionNavResp>> {
  return get("/treehole/submission/admin/navigate", {
    topic_id: topicId,
    page_index: pageIndex,
    only_approved: onlyApproved,
  })
}
