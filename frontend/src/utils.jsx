const generateDirectoryURL = (name) =>
  `https://twitch.tv/directory/category/${name
    .replace(/[.:()]/g, "")
    .replaceAll(/\s/g, "-")
    .toLowerCase()}`

const isWithinLast24Hours = (timestamp) => {
  if (!timestamp || !timestamp._seconds) return false

  const date = new Date(timestamp._seconds * 1000) // Convert seconds to milliseconds
  const now = new Date()
  const diffInHours = Math.abs(now - date) / 36e5 // Convert milliseconds to hours

  return diffInHours < 24
}

const backlogBadgeClass = (played) =>
  played ? "game-completed" : "game-declined"

const backlogBadgeText = (played) => (played ? "Completed" : "Not Started")

const cardSwitchText = (isBacklog) =>
  isBacklog ? "Suggested Games" : "Backlog Games"

const scrollToTop = (ref) => {
  ref.current.scrollTo({ top: 0, behavior: "smooth" })
}

export {
  generateDirectoryURL,
  isWithinLast24Hours,
  backlogBadgeClass,
  backlogBadgeText,
  cardSwitchText,
  scrollToTop,
}
