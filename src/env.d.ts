/// <reference types="vite/client" />

declare module "*.avif" {
  const src: string
  export default src
}

declare module "*.webp" {
  const src: string
  export default src
}

declare module "aos" {
  const AOS: {
    init: (options?: Record<string, unknown>) => void
    refresh: () => void
    destroy: () => void
  }
  export default AOS
}

declare module "dayjs" {
  interface Dayjs {
    format(format: string): string
  }
  function dayjs(date?: unknown): Dayjs
  export default dayjs
}

declare module "vitest" {
  export function describe(name: string, fn: () => void): void
  export function it(name: string, fn: () => void | Promise<void>): Promise<void>
  export function expect<T>(actual: T): {
    toBe(expected: T): void
    toEqual(expected: T): void
  }
}
