// Sits after the last visible game; scrolling it into view loads the next page
const LoadMoreSpinner = ({ sentinelRef }) => (
  <div
    ref={sentinelRef}
    className="d-flex justify-content-center py-3"
    role="status"
  >
    <div className="spinner-border spinner-border-sm" aria-hidden="true" />
    <span className="visually-hidden">Loading more games...</span>
  </div>
)

export default LoadMoreSpinner
