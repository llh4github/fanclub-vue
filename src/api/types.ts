export const RESP_SUCCESS = "OK"
export const RESP_SUCCESS_NUM = "0"

export function isSuccess(code: string | undefined): boolean {
  return code === RESP_SUCCESS || code === RESP_SUCCESS_NUM
}

export interface JsonResp<T> {
  code: string
  msg: string
  data: T
  ts: number
}

export interface PageResult<T> {
  records: T[]
  total_page: number
  total_row_count: number
}
