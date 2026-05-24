import { post } from "./request"
import type { JsonResp } from "./types"

export interface InitKeyExchangeResp {
  expire_at: number
  rsa_public_key: string
  session_id: string
}

export interface CompleteKeyExchangeReq {
  encrypted_aes_key: string
  session_id: string
}

export interface CompleteKeyExchangeResp {
  message: string
  success: boolean
  key_expire_at?: number
}

export async function initKeyExchange(): Promise<JsonResp<InitKeyExchangeResp>> {
  return post<InitKeyExchangeResp>("/crypto/init", {})
}

export async function completeKeyExchange(
  data: CompleteKeyExchangeReq,
): Promise<JsonResp<CompleteKeyExchangeResp>> {
  return post<CompleteKeyExchangeResp>("/crypto/complete", data)
}
