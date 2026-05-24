import solarLunar from "solarlunar"

export interface HolidayOption {
  label: string
  value: string
  date: Date
  isLunar: boolean
  holidayName: string
  theme?: string
}

interface LunarHoliday {
  month: number
  day: number
  name: string
  theme: string
}

interface SolarHoliday {
  month: number
  day: number
  name: string
  theme: string
}

const lunarHolidays: LunarHoliday[] = [
  { month: 1, day: 1, name: "春节", theme: "新年愿望" },
  { month: 1, day: 15, name: "元宵节", theme: "团圆故事" },
  { month: 5, day: 5, name: "端午节", theme: "踏青分享" },
  { month: 7, day: 7, name: "七夕节", theme: "浪漫时刻" },
  { month: 8, day: 15, name: "中秋节", theme: "赏花赏月赏秋香" },
  { month: 12, day: 8, name: "腊八节", theme: "看看粥吧" },
  { month: 12, day: 23, name: "小年", theme: "辞旧迎新" },
]

const solarHolidays: SolarHoliday[] = [
  { month: 1, day: 1, name: "元旦", theme: "新年展望" },
  { month: 2, day: 14, name: "情人节", theme: "甜蜜时刻" },
  { month: 4, day: 1, name: "愚人节", theme: "趣味玩笑" },
  { month: 5, day: 1, name: "劳动节", theme: "出游趣事" },
  { month: 6, day: 1, name: "儿童节", theme: "儿时趣事" },
  { month: 10, day: 1, name: "国庆节", theme: "国庆游玩计划" },
  { month: 11, day: 11, name: "双十一", theme: "好物推荐" },
  { month: 12, day: 25, name: "圣诞节", theme: "白色相簿的故事" },
]

interface GeneralTopic {
  name: string
  theme: string
}

const generalTopics: GeneralTopic[] = [
  { name: "常规", theme: "台词回" },
  { name: "常规", theme: "桌面回" },
  { name: "常规", theme: "好物分享" },
  { name: "常规", theme: "烦恼相谈" },
]

function formatYearMonth(date: Date): string {
  const year = String(date.getFullYear()).slice(-2)
  const month = date.getMonth() + 1
  return `${year}年${month}月`
}

function generateLunarHolidayOptions(year: number): HolidayOption[] {
  const options: HolidayOption[] = []

  for (const holiday of lunarHolidays) {
    try {
      let currentYear = year
      let foundDate: Date | null = null

      for (let m = 1; m <= 12 && !foundDate; m++) {
        for (let d = 1; d <= 30 && !foundDate; d++) {
          try {
            const info = solarLunar.solar2lunar(currentYear, m, d)
            if (info.lMonth === holiday.month && info.lDay === holiday.day) {
              foundDate = new Date(currentYear, m - 1, d)
            }
          } catch {
            continue
          }
        }
      }

      if (!foundDate) {
        for (let m = 1; m <= 12 && !foundDate; m++) {
          for (let d = 28; d <= 31 && !foundDate; d++) {
            try {
              const info = solarLunar.solar2lunar(year + 1, m, d)
              if (info.lMonth === holiday.month && info.lDay === holiday.day) {
                foundDate = new Date(year + 1, m - 1, d)
              }
            } catch {
              continue
            }
          }
        }
      }

      if (foundDate) {
        const yearMonth = formatYearMonth(foundDate)
        options.push({
          label: `${yearMonth}${holiday.name}${holiday.theme}`,
          value: `${yearMonth}${holiday.name}${holiday.theme}`,
          date: foundDate,
          isLunar: true,
          holidayName: holiday.name,
          theme: holiday.theme,
        })
      }
    } catch {
      continue
    }
  }

  return options
}

function generateSolarHolidayOptions(year: number): HolidayOption[] {
  const options: HolidayOption[] = []

  for (const holiday of solarHolidays) {
    try {
      const date = new Date(year, holiday.month - 1, holiday.day)
      const yearMonth = formatYearMonth(date)
      options.push({
        label: `${yearMonth}${holiday.name}${holiday.theme}`,
        value: `${yearMonth}${holiday.name}${holiday.theme}`,
        date,
        isLunar: false,
        holidayName: holiday.name,
        theme: holiday.theme,
      })
    } catch {
      continue
    }
  }

  return options
}

function generateGeneralTopicOptions(): HolidayOption[] {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  return generalTopics.map((topic) => ({
    label: `${topic.name}${topic.theme}`,
    value: `${topic.name}${topic.theme}`,
    date: new Date(year, month - 1, 1),
    isLunar: false,
    holidayName: topic.name,
    theme: topic.theme,
  }))
}

export function generateHolidayOptions(year?: number): HolidayOption[] {
  const targetYear = year || new Date().getFullYear()
  const lunarOptions = generateLunarHolidayOptions(targetYear)
  const solarOptions = generateSolarHolidayOptions(targetYear)
  const generalOptions = generateGeneralTopicOptions()

  return [...generalOptions, ...lunarOptions, ...solarOptions]
}

export function sortHolidaysByRelevance(
  options: HolidayOption[],
  now: Date = new Date(),
): HolidayOption[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const withDistance = options.map((opt) => {
    const optDate = new Date(opt.date.getFullYear(), opt.date.getMonth(), opt.date.getDate())
    let daysDiff = Math.floor((optDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff < 0) {
      daysDiff += 365
    }
    return { option: opt, distance: daysDiff }
  })

  return withDistance.sort((a, b) => a.distance - b.distance).map((item) => item.option)
}

export function filterHolidays(options: HolidayOption[], searchText: string): HolidayOption[] {
  if (!searchText.trim()) {
    return options
  }

  const lowerSearch = searchText.toLowerCase()

  return options.filter((opt) => {
    const labelMatch = opt.label.toLowerCase().includes(lowerSearch)
    const themeMatch = opt.theme?.toLowerCase().includes(lowerSearch)
    const holidayMatch = opt.holidayName.toLowerCase().includes(lowerSearch)
    return labelMatch || themeMatch || holidayMatch
  })
}
