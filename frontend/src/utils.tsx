export const generateDirectoryURL = (name) =>
  `https://twitch.tv/directory/category/${name
    .replace(/[.:()]/g, "")
    .replaceAll(/\s/g, "-")
    .toLowerCase()}`

export const isWithinLast24Hours = (date) => {
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  return date >= twentyFourHoursAgo && date <= now
}
