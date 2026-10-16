import { useContext } from "react"
import { Store } from "../context/Store.context.jsx"
import { MAX_QUEUED_PER_USER, LIMIT_OWNER } from "../config"

// How many of the logged-in user's games are queued and how many slots remain.
// The owner is exempt unless LIMIT_OWNER is set; `limited` is false when exempt.
const useQueueSlots = () => {
  const { state } = useContext(Store)
  const { userId, isOwner } = state.user
  const queuedCount = state.suggested.originalData.filter(
    (g) =>
      !!userId &&
      g.user_id === userId &&
      String(g.status).toLowerCase() === "queue"
  ).length
  const limited = !(isOwner && !LIMIT_OWNER)
  const slotsLeft = limited
    ? Math.max(MAX_QUEUED_PER_USER - queuedCount, 0)
    : Infinity

  return { queuedCount, slotsLeft, limited, max: MAX_QUEUED_PER_USER }
}

export default useQueueSlots
