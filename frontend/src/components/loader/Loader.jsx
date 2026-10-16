import "./Loader.scss"
const Loader = () => (
  <div id="loader-container" role="status" aria-live="polite">
    <div id="loader" aria-hidden="true">
      <div></div>
      <div></div>
    </div>
    <span className="visually-hidden">Loading games...</span>
  </div>
)

export default Loader
