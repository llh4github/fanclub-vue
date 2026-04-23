import { apiClient } from '../client'
import type { JsonWrapper } from '../types'

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
  async generateAesKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt'],
    )
  },

  /**
   * 导出 AES 密钥为字符串
   */
  async exportAesKey(key: CryptoKey): Promise<string> {
    const rawKey = await window.crypto.subtle.exportKey('raw', key)
    return this.arrayBufferToBase64(rawKey)
  },

  /**
   * 导入 AES 密钥
   */
  async importAesKey(keyStr: string): Promise<CryptoKey> {
    const rawKey = new Uint8Array(Array.from(atob(keyStr), (c) => c.charCodeAt(0)))
    return await window.crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, [
      'encrypt',
      'decrypt',
    ])
  },

  /**
   * ArrayBuffer 转 Base64
   */
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i] || 0)
    }
    return btoa(binary)
  },

  /**
   * Base64 转 ArrayBuffer
   */
  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  },

  /**
   * 用 RSA 公钥加密 AES 密钥
   */
  async encryptAesKeyWithRsa(aesKey: CryptoKey, publicKey: string): Promise<string> {
    // 导出 AES 密钥为原始字节
    const aesKeyRaw = await window.crypto.subtle.exportKey('raw', aesKey)

    // 导入 RSA 公钥
    const rsaPublicKey = await this.importRsaPublicKey(publicKey)

    // 用 RSA-OAEP 加密 AES 密钥
    // 后端使用 RSA/ECB/OAEPWithSHA-1AndMGF1Padding
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      rsaPublicKey,
      aesKeyRaw,
    )

    // 转换为 base64
    return this.arrayBufferToBase64(encrypted)
  },

  /**
   * 导入 RSA 公钥
   */
  async importRsaPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
    // 处理可能的 PEM 格式公钥
    let cleanPublicKey = publicKeyBase64
    // 移除 PEM 头尾
    cleanPublicKey = cleanPublicKey.replace(/-----BEGIN PUBLIC KEY-----/g, '')
    cleanPublicKey = cleanPublicKey.replace(/-----END PUBLIC KEY-----/g, '')
    // 移除所有空白字符
    cleanPublicKey = cleanPublicKey.replace(/\s/g, '')

    // 解码 base64
    const binaryDer = new Uint8Array(Array.from(atob(cleanPublicKey), (c) => c.charCodeAt(0)))

    // 导入公钥
    return await window.crypto.subtle.importKey(
      'spki',
      binaryDer,
      {
        name: 'RSA-OAEP',
        hash: { name: 'SHA-1' },
      },
      false,
      ['encrypt'],
    )
  },

  /**
   * 用 AES-GCM 加密数据
   * 与后端实现保持一致：IV长度12字节，tag长度128位
   */
  async encryptWithAesGcm(data: string, key: CryptoKey): Promise<string> {
    // 生成 12 字节的 IV（与后端保持一致）
    const iv = window.crypto.getRandomValues(new Uint8Array(12))

    // 加密数据
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128,
      },
      key,
      new TextEncoder().encode(data),
    )

    // 合并 IV 和密文（与后端格式一致：IV + 密文）
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(encrypted), iv.length)

    // 转换为 Base64
    return this.arrayBufferToBase64(combined.buffer)
  },

  /**
   * 解密 AES-GCM 加密的数据
   * 与后端实现保持一致：IV长度12字节，tag长度128位
   */
  async decryptWithAesGcm(encryptedData: string, key: CryptoKey): Promise<string> {
    // 解码 Base64
    const combined = new Uint8Array(Array.from(atob(encryptedData), (c) => c.charCodeAt(0)))

    // 提取 IV（前 12 字节）
    const iv = combined.slice(0, 12)
    const ciphertext = combined.slice(12)

    // 解密数据
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128,
      },
      key,
      ciphertext,
    )

    // 转换为字符串
    return new TextDecoder().decode(decrypted)
  },
}
