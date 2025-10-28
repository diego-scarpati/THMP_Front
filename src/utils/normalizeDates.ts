export const normalizeDates = (date: string): string => {
  const [month, day, year] = date.split("/")
  return day + "/" + month + "/" + year
}