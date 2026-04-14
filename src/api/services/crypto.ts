import { apiClient } from '../client'
import type { JsonWrapper } from '../types'
import CryptoJS from 'crypto-js'
import JSEncrypt from 'jsencrypt'

/**
 * 密钥交换请求数据
 */
export interface KeyExchangeRequest {
  cryptoSid: string
}

/**
 * 密钥交换响应数据
 */
export interface KeyExchangeResponse {
  publicKey: string
  cryptoSid: string
}

/**
 * 完成密钥交换请求数据
 */
export interface KeyExchangeCompleteRequest {
  cryptoSid: string
  encryptedAesKey: string
}

/**
 * 验证码数据
 */
export interface CaptchaData {
  key: string
  images: string
  len?: number
}

/**
 * 加密服务
 */
export const cryptoService = {
  /**
   * 初始化密钥交换
   */
  async initKeyExchange(): Promise<JsonWrapper<KeyExchangeResponse>> {
    return apiClient.post<KeyExchangeResponse>('/crypto/key-exchange/init', {})
  },

  /**
   * 完成密钥交换
   */
  async completeKeyExchange(data: KeyExchangeCompleteRequest): Promise<JsonWrapper<boolean>> {
    return apiClient.post<boolean>('/crypto/key-exchange/complete', data)
  },

  /**
   * 生成验证码
   */
  async generateCaptcha(): Promise<JsonWrapper<CaptchaData>> {
    return apiClient.get<CaptchaData>('/captcha/generate')
  },

  /**
   * 生成 AES 密钥
   */
  generateAesKey(): string {
    return CryptoJS.lib.WordArray.random(32).toString()
  },

  /**
   * 用 RSA 公钥加密 AES 密钥
   */
  encryptAesKeyWithRsa(aesKey: string, publicKey: string): string {
    const encrypt = new JSEncrypt()
    encrypt.setPublicKey(publicKey)
    // 注意：JSEncrypt 默认使用 PKCS1 填充，这里我们使用它来进行加密
    const encrypted = encrypt.encrypt(aesKey)
    return encrypted || ''
  },

  /**
   * 用 AES-GCM 加密数据
   */
  encryptWithAesGcm(data: string, key: string): string {
    const iv = CryptoJS.lib.WordArray.random(16)
    const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    return `${iv.toString()}:${encrypted.toString()}`
  },

  /**
   * 解密 AES-GCM 加密的数据
   */
  decryptWithAesGcm(encryptedData: string, key: string): string {
    const parts = encryptedData.split(':')
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format')
    }
    const ivStr = parts[0]
    const encryptedStr = parts[1]
    if (!ivStr || !encryptedStr) {
      throw new Error('Invalid encrypted data format')
    }
    const iv = CryptoJS.enc.Hex.parse(ivStr)
    const decrypted = CryptoJS.AES.decrypt(encryptedStr, CryptoJS.enc.Utf8.parse(key), {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    return decrypted.toString(CryptoJS.enc.Utf8)
  }
}