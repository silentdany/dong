const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['second', 1000],
  ['minute', 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['day', 24 * 60 * 60 * 1000],
]

const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function relativeTime(date: Date, now: Date = new Date()): string {
  const elapsed = date.getTime() - now.getTime()
  const abs = Math.abs(elapsed)

  let unit: Intl.RelativeTimeFormatUnit = 'day'
  let ms = UNITS[3][1]
  for (const [candidateUnit, candidateMs] of UNITS) {
    if (abs < candidateMs * 60 || candidateUnit === 'day') {
      unit = candidateUnit
      ms = candidateMs
      break
    }
  }

  return formatter.format(Math.round(elapsed / ms), unit)
}
