import DesktopCard from "./components/card/DesktopCard"
import AbsoluteItems from "./components/particles/AbsoluteItems"
import DropdownMenu from "./components/dropdown-menu/DropdownMenu"
import { useContext } from "react"
import { Store } from "./context/Store.context.jsx"
import { cardSwitchText } from "./utils.jsx"

const App = () => {
  const { state, authorize, dispatch } = useContext(Store)
  const { isBacklog } = state

  const cardSwitchDispatch = () => {
    dispatch({ type: "isBacklog", payload: !isBacklog })
    dispatch({ type: "RESET_SUGGESTED", payload: state.suggested.originalData })
    dispatch({ type: "RESET_BACKLOG", payload: state.backlog.originalData })
  }

  return (
    <main>
      <AbsoluteItems />
      <div className="menu-title d-flex justify-content-center align-items-center user-select-none">
        MENU
      </div>
      <div className="d-md-flex flex-row justify-content-between">
        <div className="menu-buttons d-flex flex-column gap-4 pt-5 ms-xl-5 ms-4 col-xl-3">
          <button
            type="button"
            className="btn"
            data-bs-toggle="modal"
            data-bs-target="#addGameModal"
            disabled={!state.user}
          >
            Add a game
          </button>

          {!isBacklog && (
            <>
              <DropdownMenu type="Sort" />
              <DropdownMenu type="Filter" />
            </>
          )}

          <button
            type="button"
            className="btn"
            data-bs-toggle="modal"
            data-bs-target="#helpModal"
          >
            Help?
          </button>

          <button
            type="button"
            className="btn card-flipper"
            onClick={() => cardSwitchDispatch()}
          >
            View {cardSwitchText(isBacklog)}
          </button>
        </div>
        <div>
          <DesktopCard />
          <button
            className="btn btn-twitch-login text-uppercase mt-4 mx-md-5 p-0 ms-3"
            onClick={authorize}
            // Todo: Disable button if user is already logged in
            disabled={state.user.username}
          >
            {state.user.username
              ? `Logged in: ${state.user.username}`
              : "Login with twitch "}
          </button>
        </div>
      </div>
    </main>
  )
}

export default App
