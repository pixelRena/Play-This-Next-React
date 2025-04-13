import HelpModal from "../modal/HelpModal"

const AbsoluteThings = () => {
  return (
    <>
      <div className="block" />
      {/* Todo: Responsive scrolling text */}
      <div className="scrolling-text-wrapper d-none d-sm-block">
        <div className="scrolling-text">
          BACKLOG BACKLOG BACKLOG BACKLOG BACKLOG BACKLOG BACKLOG BACKLOG
        </div>
      </div>
      <div className="scrolling-text-wrapper reverse d-none d-sm-block">
        <div className="scrolling-text">
          BACKLOG BACKLOG BACKLOG BACKLOG BACKLOG BACKLOG BACKLOG BACKLOG
        </div>
      </div>
    </>
  )
}

export default AbsoluteThings
