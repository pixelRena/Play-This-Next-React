import AddGameModal from "../modal/AddGameModal"
import HelpModal from "../modal/HelpModal"
import Notification from "../notification/Notification"
import { Store } from "../../context/Store.context"
import { useContext } from "react"

const AbsoluteThings = () => {
  const { state } = useContext(Store)
  const { isBacklog } = state
  return (
    <>
      <Notification />
      <HelpModal />
      <AddGameModal />
      <div className="block" />
      {/* Todo: Responsive scrolling text */}
      {isBacklog ? (
        <>
          <div className="scrolling-text-wrapper d-none d-sm-block">
            <div className="scrolling-text">
              BACKLOG BACKLOG BACKLOG BACKLOG BACKLOG BACKLOG BACKLOG
              BACKLOG&nbsp; BACKLOG BACKLOG BACKLOG BACKLOG BACKLOG BACKLOG
              BACKLOG BACKLOG
            </div>
          </div>
          <div className="scrolling-text-wrapper reverse d-none d-sm-block">
            <div className="scrolling-text">
              BACKLOG BACKLOG BACKLOG BACKLOG BACKLOG BACKLOG BACKLOG
              BACKLOG&nbsp; BACKLOG BACKLOG BACKLOG BACKLOG BACKLOG BACKLOG
              BACKLOG BACKLOG
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="scrolling-text-wrapper d-none d-sm-block">
            <div className="scrolling-text">
              SUGGESTED SUGGESTED SUGGESTED SUGGESTED SUGGESTED SUGGESTED
              SUGGESTED SUGGESTED&nbsp; SUGGESTED SUGGESTED SUGGESTED SUGGESTED
              SUGGESTED SUGGESTED SUGGESTED SUGGESTED
            </div>
          </div>
          <div className="scrolling-text-wrapper reverse d-none d-sm-block">
            <div className="scrolling-text">
              SUGGESTED SUGGESTED SUGGESTED SUGGESTED SUGGESTED SUGGESTED
              SUGGESTED SUGGESTED&nbsp; SUGGESTED SUGGESTED SUGGESTED SUGGESTED
              SUGGESTED SUGGESTED SUGGESTED SUGGESTED
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default AbsoluteThings
