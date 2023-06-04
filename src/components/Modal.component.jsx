import { useContext } from "react";
import { ModalContext } from "../context/modal.context";
import Button from "./Button.component";

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
                        <Button variant="modalInput" type="submit">Search</Button>
                    </form>
                    <Button variant="modalInput" id="filter-games-btn" type="button">Filter By Games Selected</Button>
                    <div class="modal-listed-games">
                        <div class="game-box">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <Button variant="modalToggle">Submit Game Suggestion</Button>
                    <Button variant="modalToggle" onClick={() => setOpen(false)}>Close</Button>
                </div>
            </div>
        </div> 
    );
}
 
export default Modal;