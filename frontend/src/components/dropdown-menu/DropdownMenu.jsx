import { useContext } from "react"
import { Store } from "../../context/Store.context"

const DropdownMenu = ({ type }) => {
  const { state, dispatch } = useContext(Store)

  const handleMenuClick = (status) => {
    if (type === "Filter") {
      dispatch({
        type: "FILTER_SUGGESTED",
        payload: {
          originalData: state.suggested.data,
          status: status.toLowerCase(),
        },
      })
    } else if (type === "Sort") {
      dispatch({ type: "SORT_SUGGESTED", payload: status.toLowerCase() })
    }
  }

  // const handleReset = () => {
  //   dispatch({ type: "RESET_SUGGESTED", payload: originalData })
  // }
  return (
    <div className="dropdown-menu-container btn btn-group dropend">
      <button
        type="button"
        className="btn bg-transparent dropdown-toggle"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {type} by
      </button>
      <ul className="dropdown-menu ms-3 py-0">
        <li className="dropdown-item" onClick={() => handleMenuClick("Next")}>
          {">"} Currently Playing
        </li>
        <li className="dropdown-item" onClick={() => handleMenuClick("Queue")}>
          {">"} Queue
        </li>
        <li
          className="dropdown-item"
          onClick={() => handleMenuClick("Completed")}
        >
          {">"} Completed
        </li>
        <li
          className="dropdown-item"
          onClick={() => handleMenuClick("Declined")}
        >
          {">"} Declined
        </li>
      </ul>
    </div>
  )
}

export default DropdownMenu
