const DropdownMenu = (type) => {
  return (
    <div className="btn btn-group dropend">
      <button
        type="button"
        className="btn bg-transparent dropdown-toggle"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {type} by
      </button>
      <ul className="dropdown-menu ms-3 py-0">
        <li className="dropdown-item">{">"} Currently Playing</li>
        <li className="dropdown-item">{">"} Queue</li>
        <li className="dropdown-item">{">"} Completed</li>
        <li className="dropdown-item">{">"} Declined</li>
      </ul>
    </div>
  )
}

export default DropdownMenu
