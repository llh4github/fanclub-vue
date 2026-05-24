import { get, post } from "./request"
import type { JsonResp } from "./types"

export interface ClickCaptcha {
  captcha_key: string
  master_image: string
  thumb_image: string
}

export async function getClickCaptcha(scene: string): Promise<JsonResp<ClickCaptcha>> {
  return get<ClickCaptcha>("/captcha/click", { scene })
}

export interface SlideCaptcha {
  captcha_key: string
  image_base64: string
  tile_base64: string
  tile_x: number
  tile_y: number
  tile_width: number
  tile_height: number
}

export async function getSlideCaptcha(scene: string): Promise<JsonResp<SlideCaptcha>> {
  return get<SlideCaptcha>("/captcha/slide/generate", { scene })
}

export interface CaptchaVerifyResult {
  success: boolean
  token?: string
}

export async function verifyClickCaptcha(
  captchaKey: string,
  dots: string,
  scene: string,
): Promise<JsonResp<CaptchaVerifyResult>> {
  return post("/captcha/click/verify", { captcha_key: captchaKey, dots, scene })
}
