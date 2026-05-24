import { get } from "./request"
import type { JsonResp } from "./types"

export interface ImageUploadCredential {
  token: string
  object_key: string
  region: string
  expires_at: number
}

export async function getImageUploadCredential(
  filename: string,
): Promise<JsonResp<ImageUploadCredential>> {
  return get<ImageUploadCredential>("/oss/image/upload", { filename })
}
