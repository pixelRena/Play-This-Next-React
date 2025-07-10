import "./Modal.scss"

const HelpModal = () => {
  return (
    <div
      className="modal fade pixel-font"
      id="helpModal"
      tabIndex="-1"
      aria-labelledby="exampleModalLabel"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border border-black">
          <div className="modal-header border-black">
            <h5 className="modal-title text-uppercase">How it works</h5>
            <button
              type="button"
              className="btn ms-auto fs-5"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              X
            </button>
          </div>
          <div className="modal-body text-uppercase">
            <ul>
              <li>
                TO ADD GAMES TO THE SUGGESTED LIST, YOU WILL NEED TO SIGN INTO
                TWITCH. ONCE LOGGED IN, THE “ADD A GAME” BUTTON WILL BE ENABLED.
              </li>
              <li>
                GAMES CANNOT BE ADDED TO THE BACKLOG, BUT CAN BE VIEWED TO SEE
                WHAT THE STREAMER HAS IN PLAN.
              </li>
              <li>
                IF YOU ADDED A GAME, AND ITS SITTING IN QUEUE (NOT DECLINED),
                YOU CAN REMOVE THE GAME BY CLICKING THE TRASH ICON.
              </li>
              <li>
                IF YOU COME ACROSS SOMETHING NOT WORKING, PLEASE LET THE OWNER
                PIXELRENA KNOW BY ADDING A GITHUB ISSUE OR SENDING A MESSAGE.
              </li>
            </ul>
          </div>
          <div className="modal-footer border-black">
            <button type="button" className="btn fs-5" data-bs-dismiss="modal">
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpModal
