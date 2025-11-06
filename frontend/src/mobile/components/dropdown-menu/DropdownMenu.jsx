import { useContext } from "react"
import { Store } from "../../../context/Store.context.jsx"

const DropdownMenu = () => {
  const { state, dispatch } = useContext(Store)

  const handleMenuClick = (status) => {
    dispatch({
      type: "FILTER_SUGGESTED",
      payload: {
        originalData: state.suggested.data,
        status: status.toLowerCase(),
      },
    })
  }

  return (
    <div className="btn-group">
      <button
        type="button"
        className="btn btn-dark btn-sm dropdown-toggle"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        Filter By
      </button>
      <ul className="dropdown-menu dropdown-menu-mobile w-100">
        <li onClick={() => handleMenuClick("Next")}>
          <a className="dropdown-item" href="#">
            Currently Playing
          </a>
        </li>
        <li onClick={() => handleMenuClick("Queue")}>
          <a className="dropdown-item" href="#">
            Queue
          </a>
        </li>
        <li onClick={() => handleMenuClick("Completed")}>
          <a className="dropdown-item" href="#">
            Completed
          </a>
        </li>
        <li onClick={() => handleMenuClick("Declined")}>
          <a className="dropdown-item" href="#">
            Declined
          </a>
        </li>
      </ul>
    </div>
  )
}

export default DropdownMenu
