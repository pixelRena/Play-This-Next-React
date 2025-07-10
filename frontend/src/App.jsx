import DesktopCard from "./components/card/DesktopCard"
import AbsoluteThings from "./components/particles/AbsoluteThings"
import HelpModal from "./components/modal/HelpModal"
import { useState } from "react"
import DropdownMenu from "./components/dropdown-menu/DropdownMenu"

const App = () => {
  return (
    <main>
      <AbsoluteThings />
      <HelpModal />
      <div className="menu-title d-flex justify-content-center align-items-center user-select-none">
        MENU
      </div>
      <div className="d-flex flex-row justify-content-between">
        <div className="menu-buttons d-flex flex-column gap-4 pt-5 ms-xl-5 ms-4 col-xl-3">
          <button type="button" className="btn">
            Add a game
          </button>

          <DropdownMenu type="Sort" />
          <DropdownMenu type="Filter" />
          <button
            type="button"
            className="btn"
            data-bs-toggle="modal"
            data-bs-target="#helpModal"
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
