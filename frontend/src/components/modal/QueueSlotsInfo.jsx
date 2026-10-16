import { useRef, useState } from "react"
import { createPortal } from "react-dom"

const TIP_WIDTH = 240
const EDGE_GAP = 8

// Info icon that explains queue slots; opens on hover, focus or tap. The tip is
// rendered on <body> with fixed positioning so it floats above the modal
// instead of being clipped by, or growing, the scrolling modal body.
const QueueSlotsInfo = ({ max }) => {
  const [pos, setPos] = useState(null)
  const buttonRef = useRef(null)

  const open = () => {
    const rect = buttonRef.current.getBoundingClientRect()
    const left = Math.min(
      Math.max(rect.left, EDGE_GAP),
      window.innerWidth - TIP_WIDTH - EDGE_GAP
    )
    setPos({ top: rect.bottom + 6, left })
  }
  const close = () => setPos(null)

  return (
    <span onMouseEnter={open} onMouseLeave={close}>
      <button
        ref={buttonRef}
        type="button"
        className="queue-info-btn btn p-0 border-0 bi-info-circle-fill"
        aria-label="What are queue slots?"
        aria-describedby="queue-info-tip"
        aria-expanded={!!pos}
        onClick={() => (pos ? close() : open())}
        onFocus={open}
        onBlur={close}
        onKeyDown={(e) => e.key === "Escape" && close()}
      />
      {createPortal(
        <span
          id="queue-info-tip"
          role="tooltip"
          className="queue-info-tip"
          hidden={!pos}
          style={pos ?? undefined}
        >
          You can have up to {max} games waiting in the queue at once. A slot
          frees up when one of your games is played, declined or removed.
        </span>,
        document.body
      )}
    </span>
  )
}

export default QueueSlotsInfo
