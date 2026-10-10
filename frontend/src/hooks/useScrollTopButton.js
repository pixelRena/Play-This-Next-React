import { useCallback, useEffect, useState } from "react"

const SHOW_AFTER_PX = 600

// Shows the scroll-to-top button based on where the element is scrolled right
// now. It re-checks whenever `deps` change (filter, search, list switch) since
// the content can shrink and move the scroll position without a scroll event.
// Inside a bootstrap modal the position is reset each time it opens or closes.
const useScrollTopButton = (ref, deps = []) => {
  const [showButton, setShowButton] = useState(false)

  const update = useCallback(() => {
    if (ref.current) setShowButton(ref.current.scrollTop > SHOW_AFTER_PX)
  }, [ref])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.addEventListener("scroll", update)

    const modal = el.closest(".modal")
    const reset = () => {
      el.scrollTop = 0
      setShowButton(false)
    }
    if (modal) {
      modal.addEventListener("show.bs.modal", reset)
      modal.addEventListener("hidden.bs.modal", reset)
    }

    return () => {
      el.removeEventListener("scroll", update)
      if (modal) {
        modal.removeEventListener("show.bs.modal", reset)
        modal.removeEventListener("hidden.bs.modal", reset)
      }
    }
  }, [ref, update])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(update, deps)

  return showButton
}

export default useScrollTopButton
