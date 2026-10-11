import { useContext } from "react"
import { Store } from "../../context/Store.context"

const OPTIONS = [
  { key: "next", label: "Next" },
  { key: "queue", label: "Queue" },
  { key: "completed", label: "Completed" },
  { key: "declined", label: "Declined" },
]
const MINE = { key: "mine", label: "Games I Submitted" }

const DropdownMenu = ({ type }) => {
  const { state, dispatch } = useContext(Store)
  const isFilter = type === "Filter"
  const active = isFilter
    ? state.suggested.activeFilter
    : state.suggested.activeSort
  const options =
    isFilter && state.user.userId ? [MINE, ...OPTIONS] : OPTIONS
  const activeLabel = [MINE, ...OPTIONS].find((o) => o.key === active)?.label

  const handleMenuClick = (key) => {
    if (key === "mine") {
      dispatch({ type: "FILTER_SUGGESTED_MINE", payload: state.user.userId })
    } else if (isFilter) {
      dispatch({
        type: "FILTER_SUGGESTED",
        payload: { originalData: state.suggested.data, status: key },
      })
    } else {
      dispatch({ type: "SORT_SUGGESTED", payload: key, isSorted: true })
    }
  }

  return (
    <div
      className={`dropdown-menu-container btn btn-group dropend${
        activeLabel ? " has-selection" : ""
      }`}
    >
      <button
        type="button"
        className="btn bg-transparent dropdown-toggle"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {activeLabel ? `${type}: ${activeLabel}` : `${type} by`}
      </button>
      <ul className="dropdown-menu ms-3 py-0">
        {options.map(({ key, label }) => (
          <li
            key={key}
            className={`dropdown-item${key === active ? " active-option" : ""}`}
            aria-current={key === active ? "true" : undefined}
            onClick={() => handleMenuClick(key)}
          >
            {key === active ? "✓" : ">"} {label}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DropdownMenu
