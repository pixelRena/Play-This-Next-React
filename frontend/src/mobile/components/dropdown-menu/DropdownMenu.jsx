import { useContext } from "react"
import { Store } from "../../../context/Store.context.jsx"

const OPTIONS = [
  { key: "next", label: "Next" },
  { key: "queue", label: "Queue" },
  { key: "completed", label: "Completed" },
  { key: "declined", label: "Declined" },
]
const MINE = { key: "mine", label: "Games I Submitted" }

const DropdownMenu = () => {
  const { state, dispatch } = useContext(Store)
  const active = state.suggested.activeFilter
  const options = state.user.userId ? [MINE, ...OPTIONS] : OPTIONS
  const activeLabel = [MINE, ...OPTIONS].find((o) => o.key === active)?.label

  const handleMenuClick = (key) => {
    if (key === "mine") {
      dispatch({ type: "FILTER_SUGGESTED_MINE", payload: state.user.userId })
    } else {
      dispatch({
        type: "FILTER_SUGGESTED",
        payload: { originalData: state.suggested.data, status: key },
      })
    }
  }

  return (
    <div className="btn-group">
      <button
        type="button"
        className={`btn btn-sm dropdown-toggle ${
          activeLabel ? "btn-primary" : "btn-dark"
        }`}
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {activeLabel ? `Filter: ${activeLabel}` : "Filter By"}
      </button>
      <ul className="dropdown-menu dropdown-menu-mobile w-100">
        {options.map(({ key, label }) => (
          <li key={key} onClick={() => handleMenuClick(key)}>
            <a
              className={`dropdown-item${key === active ? " active" : ""}`}
              href="#"
              aria-current={key === active ? "true" : undefined}
            >
              {key === active ? "✓ " : ""}
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DropdownMenu
