declare module "solarlunar" {
  interface Solar2LunarResult {
    lMonth: number
    lDay: number
    lYear: number
    lYearCn: string
    isLeap: boolean
    sMonth: number
    sDay: number
    sYear: number
    year: number
    month: number
    day: number
    dayCn: string
    monthCn: string
  }

  export function solar2lunar(year: number, month: number, day: number): Solar2LunarResult

  export function lunar2solar(
    year: number,
    month: number,
    day: number,
    isLeap?: boolean,
  ): Solar2LunarResult

  export function format(year: number, month: number, day: number, fmt?: string): string

  export function isLeapYear(year: number): boolean

  export function getDaysInMonth(year: number, month: number): number
}
