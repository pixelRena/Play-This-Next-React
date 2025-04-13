import DesktopCard from "./components/card/DesktopCard"
import AbsoluteThings from "./components/particles/AbsoluteThings"

const App = () => {
  return (
    <main>
      <AbsoluteThings />
      <div className="menu-title d-flex justify-content-center align-items-center user-select-none">
        MENU
      </div>
      <div className="d-flex flex-row justify-content-between">
        <div className="menu-buttons d-flex flex-column gap-4 pt-5 ms-xl-5 ms-4 col-xl-3">
          <button type="button" className="btn" disabled>
            Add a game
          </button>
          <button type="button" className="btn">
            Sort by
          </button>
          <button type="button" className="btn">
            Filter by
          </button>
          <button type="button" className="btn">
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
