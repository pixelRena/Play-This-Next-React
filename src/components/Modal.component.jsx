import { useContext } from "react";
import { ModalContext } from "../context/modal.context";

const Modal = () => {
    const {open, setOpen} = useContext(ModalContext);

    return ( 
        open && 
        <div id="modal-container">
            <div class="submit-modal">
                <h2 class="modal-header">Suggest a game</h2>
                <div class="modal-body">
                    <form class="search-wrapper" onsubmit="onModalSubmitHandler(event)">
                        <input class="search-field" type="text" placeholder="Search a game..."/>
                        <button class="search-btn" type="submit">Search</button>
                    </form>
                    <button id="filter-games-btn" type="button">Filter By Games Selected</button>
                    <div class="modal-listed-games">
                        <div class="game-box">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="submit-game-button" onClick={() => setOpen(!open)}>Submit Game Suggestion</button>
                    <button id="close-modal-button">Close</button>
                </div>
            </div>
        </div> 
    );
}
 
export default Modal;