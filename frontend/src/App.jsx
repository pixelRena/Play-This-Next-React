import DesktopCard from "./components/card/DesktopCard"
import AbsoluteThings from "./components/particles/AbsoluteThings"
import HelpModal from "./components/modal/HelpModal"
import { useState } from "react"

const App = () => {
  const [showHelpModal, setShowHelpModal] = useState(false)

  return (
    <main>
      <AbsoluteThings />
      {showHelpModal && <HelpModal setShowHelpModal={setShowHelpModal} />}
      <div className="menu-title d-flex justify-content-center align-items-center user-select-none">
        MENU
      </div>
      <div className="d-flex flex-row justify-content-between">
        <div className="menu-buttons d-flex flex-column gap-4 pt-5 ms-xl-5 ms-4 col-xl-3">
          <button type="button" className="btn" disabled>
            Add a game
          </button>
          <div className="btn btn-group dropend">
            <button
              type="button"
              className="btn bg-transparent dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Sort by
            </button>
            <ul className="dropdown-menu ms-3 py-0">
              <li className="dropdown-item">> Currently Playing</li>
              <li className="dropdown-item">> Queue</li>
              <li className="dropdown-item">> Completed</li>
              <li className="dropdown-item">> Declined</li>
            </ul>
          </div>
          <div className="btn btn-group dropend">
            <button
              type="button"
              className="btn bg-transparent dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Filter by
            </button>
            <ul className="dropdown-menu ms-3 py-0">
              <li className="dropdown-item">> Currently Playing</li>
              <li className="dropdown-item">> Queue</li>
              <li className="dropdown-item">> Completed</li>
              <li className="dropdown-item">> Declined</li>
            </ul>
          </div>
          <button
            type="button"
            className="btn"
            onClick={() => setShowHelpModal(!showHelpModal)}
          >
            Help?
          </button>

          <button type="button" className="btn card-flipper">
            View Suggested Games
          </button>
        </div>
        <div>
          <DesktopCard />
          <button className="btn btn-twitch-login text-uppercase mt-4 mx-5 p-0  ">
            Login with twitch
          </button>
        </div>
      </div>
    </main>
  )
}

export default App
