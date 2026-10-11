import { useEffect, useRef, useState } from "react"

export const PAGE_SIZE = 10
// Short pause before each page so the spinner is seen and scrolling feels paced
export const LOAD_DELAY_MS = 400

// Renders only the first `pageSize` items and adds another page each time the
// sentinel element (put it after the list, with a spinner in it) scrolls into
// view inside `scrollRef`. `items` must keep the same identity between renders
// unless its contents change, because a new array starts the list over from
// page one.
const useLazyList = (items, scrollRef, pageSize = PAGE_SIZE) => {
  const [count, setCount] = useState(pageSize)
  const sentinelRef = useRef(null)

  useEffect(() => {
    setCount(pageSize)
  }, [items, pageSize])

  const hasMore = count < items.length

  useEffect(() => {
    const sentinel = sentinelRef.current
    // No IntersectionObserver (old browsers, tests): fall back to everything
    if (!hasMore || !sentinel) return
    if (typeof IntersectionObserver === "undefined") {
      setCount(items.length)
      return
    }

    let timer = null
    // Re-created after every page so a sentinel that is still on screen
    // (tall container, short rows) keeps loading until it is pushed out
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !timer) {
          timer = setTimeout(
            () => setCount((c) => c + pageSize),
            LOAD_DELAY_MS
          )
        }
      },
      { root: scrollRef.current, rootMargin: "300px" }
    )
    observer.observe(sentinel)
    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [count, hasMore, items, pageSize, scrollRef])

  return { visibleItems: items.slice(0, count), sentinelRef, hasMore }
}

export default useLazyList
