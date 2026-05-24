import { initKeyExchange, completeKeyExchange, type InitKeyExchangeResp } from "@/api"
import { isSuccess } from "@/api/types"

const STORAGE_KEY = "crypto_session"

interface CryptoSession {
  sessionId: string
  aesKey: string
  expireAt: number
  rsaPublicKeyPem: string
}

let sessionId: string | null = null
let aesKey: Uint8Array | string | null = null
let publicKey: CryptoKey | null = null
let expireAt: number = 0

function loadFromStorage(): CryptoSession | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch {
    return null
  }
}

function saveToStorage(session: CryptoSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch (e) {
    console.warn("Failed to save crypto session to storage:", e)
  }
}

function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

function isExpired(): boolean {
  if (expireAt === 0) return true
  return Date.now() >= expireAt * 1000
}

async function importRsaPublicKey(pemKey: string): Promise<CryptoKey> {
  const binaryString = atob(pemKey)

  let derBase64 = binaryString
  if (binaryString.includes("-----BEGIN")) {
    derBase64 = binaryString
      .replace(/-----BEGIN[^-]+-----/g, "")
      .replace(/-----END[^-]+-----/g, "")
      .replace(/\s+/g, "")
  }

  const derBinary = atob(derBase64)
  const buffer = new ArrayBuffer(derBinary.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < derBinary.length; i++) {
    view[i] = derBinary.charCodeAt(i)
  }

  return crypto.subtle.importKey(
    "spki",
    buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"],
  )
}

export async function loadCachedSession(): Promise<boolean> {
  if (isKeyExchangeValid()) {
    console.log("Using in-memory crypto session")
    return true
  }

  const cached = loadFromStorage()
  if (!cached) return false

  if (Date.now() >= cached.expireAt * 1000) {
    console.log("Cached crypto session has expired")
    clearStorage()
    return false
  }

  try {
    sessionId = cached.sessionId
    aesKey = Uint8Array.from(atob(cached.aesKey), (c) => c.charCodeAt(0))
    expireAt = cached.expireAt
    publicKey = await importRsaPublicKey(cached.rsaPublicKeyPem)
    console.log("Loaded crypto session from storage")
    return true
  } catch (e) {
    console.error("Failed to load cached crypto session:", e)
    clearStorage()
    return false
  }
}

export async function performKeyExchange(): Promise<boolean> {
  if (await loadCachedSession()) {
    return true
  }

  try {
    const initResp = await initKeyExchange()
    if (!isSuccess(initResp.code) || !initResp.data) {
      console.error("Failed to initialize key exchange:", initResp.msg)
      return false
    }

    const data: InitKeyExchangeResp = initResp.data
    sessionId = data.session_id
    expireAt = data.expire_at

    const pemPublicKey = data.rsa_public_key
    publicKey = await importRsaPublicKey(pemPublicKey)

    aesKey = generateAesKey()
    const encryptedAesKey = await encryptWithRsa(publicKey, aesKey)

    const completeResp = await completeKeyExchange({
      session_id: sessionId,
      encrypted_aes_key: encryptedAesKey,
    })

    if (!isSuccess(completeResp.code) || !completeResp.data?.success) {
      console.error("Failed to complete key exchange:", completeResp.msg)
      resetKeyExchange()
      return false
    }

    if (completeResp.data?.key_expire_at) {
      expireAt = completeResp.data.key_expire_at
    }

    saveToStorage({
      sessionId: sessionId!,
      aesKey: btoa(String.fromCharCode(...aesKey)),
      expireAt,
      rsaPublicKeyPem: pemPublicKey,
    })

    console.log("Key exchange completed and cached")
    return true
  } catch (error) {
    console.error("Key exchange error:", error)
    resetKeyExchange()
    return false
  }
}

function generateAesKey(): Uint8Array {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return array
}

async function encryptWithRsa(key: CryptoKey, plaintext: Uint8Array): Promise<string> {
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    key,
    plaintext.buffer as ArrayBuffer,
  )

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)))
}

export async function encryptPassword(plaintext: string): Promise<string> {
  if (!publicKey) {
    throw new Error("RSA public key not initialized")
  }
  const encoder = new TextEncoder()
  return encryptWithRsa(publicKey, encoder.encode(plaintext))
}

export async function encryptWithAes(plaintext: string): Promise<string> {
  const keyBuffer = aesKey as Uint8Array
  const key = await crypto.subtle.importKey(
    "raw",
    keyBuffer.buffer as ArrayBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  )
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data)

  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)

  return btoa(String.fromCharCode(...combined))
}

export function getSessionId(): string | null {
  return sessionId
}

export function getAesKey(): Uint8Array | string | null {
  return aesKey
}

export function isKeyExchangeValid(): boolean {
  return sessionId !== null && aesKey !== null && !isExpired()
}

export function resetKeyExchange(): void {
  sessionId = null
  aesKey = null
  publicKey = null
  expireAt = 0
  clearStorage()
}

export async function ensureKeyExchange(): Promise<boolean> {
  if (isKeyExchangeValid()) {
    return true
  }
  return performKeyExchange()
}

export async function initCryptoSession(): Promise<boolean> {
  if (isKeyExchangeValid()) {
    console.log("Crypto session already initialized in memory")
    return true
  }

  if (await loadCachedSession()) {
    return true
  }

  console.log("No valid crypto session found, performing key exchange")
  return performKeyExchange()
}
