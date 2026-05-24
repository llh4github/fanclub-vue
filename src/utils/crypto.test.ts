import { describe, it, expect } from "vitest"

async function importAesKey(keyBase64: string): Promise<CryptoKey> {
  const key = await crypto.subtle.importKey(
    "raw",
    Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0)),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  )
  return key
}

async function encryptWithAes(plaintext: string, keyBase64: string): Promise<string> {
  const key = await importAesKey(keyBase64)
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data)

  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)

  return btoa(String.fromCharCode(...combined))
}

async function decryptWithAes(encryptedBase64: string, keyBase64: string): Promise<string> {
  const key = await importAesKey(keyBase64)
  const encryptedBuffer = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0))

  const iv = encryptedBuffer.slice(0, 12)
  const ciphertext = encryptedBuffer.slice(12)

  const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext)

  return new TextDecoder().decode(decryptedBuffer)
}

describe("AES Encryption/Decryption", () => {
  it("should encrypt and decrypt with fixed key", async () => {
    const key = "1234567890abcdef1234567890abcdef"
    const keyBase64 = btoa(key)
    const plaintext = "123456qaz"

    const encrypted = await encryptWithAes(plaintext, keyBase64)
    console.log("Frontend Encrypted (base64):", encrypted)

    const decrypted = await decryptWithAes(encrypted, keyBase64)
    console.log("Frontend Decrypted:", decrypted)

    expect(decrypted).toBe(plaintext)
  })

  it("should handle special characters", async () => {
    const key = "1234567890abcdef1234567890abcdef"
    const keyBase64 = btoa(key)
    const plaintext = "密码测试123!@#$%^&*()"

    const encrypted = await encryptWithAes(plaintext, keyBase64)
    const decrypted = await decryptWithAes(encrypted, keyBase64)

    expect(decrypted).toBe(plaintext)
  })

  it("should match Go backend output", async () => {
    const key = "1234567890abcdef1234567890abcdef"
    const keyBase64 = btoa(key)
    const plaintext = "123456qaz"
    const goEncryptedOutput = "eNg0vtfs45+gYF2zOlopUNQOMvGVo2qMvPd0RBfgv/UxxCT0wQ=="

    const decrypted = await decryptWithAes(goEncryptedOutput, keyBase64)
    console.log("Decrypted from Go output:", decrypted)

    expect(decrypted).toBe(plaintext)
  })
})

describe("AES Key Format", () => {
  it("should have 32-byte key for AES-256", async () => {
    const key = "1234567890abcdef1234567890abcdef"
    const keyBytes = new TextEncoder().encode(key)
    console.log("Key length in bytes:", keyBytes.length)
    expect(keyBytes.length).toBe(32)
  })
})

export { encryptWithAes, decryptWithAes }
