import ModalStyles from "./Modal.scss"

const HelpModal = () => {
  return (
    <>
      <div className="modal-backdrop opacity-25" />
      <div class="modal help-modal d-block pixel-font">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border border-black">
            <div class="modal-header border-black">
              <h5 class="modal-title text-uppercase">How it works</h5>
              <button type="button" className="btn ms-auto fs-5">
                X
              </button>
            </div>
            <div class="modal-body text-uppercase">
              <ul>
                <li>
                  TO ADD GAMES TO THE SUGGESTED LIST, YOU WILL NEED TO SIGN INTO
                  TWITCH. oNCE LOGGED IN, THE “ADD A GAME” BUTTON WILL BE
                  ENABLED.
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
            <div class="modal-footer border-black">
              <button type="button" class="btn fs-5">
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default HelpModal
