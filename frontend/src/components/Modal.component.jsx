import { useContext, useState } from "react";
import { ModalContext } from "../context/modal.context";
import Button from "./Button.component";
import '../styles/Modal.scss';
import axios from 'axios';

const Modal = () => {
    const {open, setOpen} = useContext(ModalContext);
    const [text, setText] = useState('');
    const [games, setGames] = useState([]);
    const [results, setResults] = useState([]);

    const onSearchHandler = async (event) => {
        event.preventDefault();

        let { data } = await axios.get(`//localhost:3000/search-games?term=${text}`)
        setResults(data)
    }

    const addGameHandler = (name,image) => {
        setGames([
            ...games, 
            {
                "name": name, 
                "image": image
            }
        ]);
    }

    const removeGameHandler = (name, image) => {
        setGames(games.filter(game => game.name !== name && game.image !== image));
    }
    const gameAdded = (name) => { return games.some(game => game.name === name) }

    const onSubmitHandler = async () => {
        try {
            if (localStorage.getItem("username-serenuy-games-ttv")) {
                let username = localStorage.getItem("username-serenuy-games-ttv")
                await axios.post("//localhost:3000/add-suggested-game", { games, username });
            } else {
                let username = prompt("Enter your twitch username:")
                localStorage.setItem("username-serenuy-games-ttv", username)
                await axios.post("//localhost:3000/add-suggested-game", { games, username });
            }
                
            alert("success")               
            setText('');               
            setGames([]);
            setResults();
            setOpen(false);
                
        } catch (error) { alert("Unable to add game to list. Try again later.") }
    }

    return ( 
        open && 
        <div id="modal-container">
            <div className="submit-modal">
                <h2 className="modal-header">Suggest a game</h2>
                <div className="modal-body">
                    <form 
                        className="search-wrapper" 
                        onSubmit={(event) => onSearchHandler(event)}
                    >
                        <input 
                            className="search-field" 
                            type="text" 
                            placeholder="Search a game..."
                            value={text}
                            onChange={(event) => setText(event.target.value)}
                        />
                        <Button 
                            variant="modalInput" 
                            type="submit"
                        >
                        Search
                        </Button>
                    </form>
                    <Button 
                        className={results === games && "selected"}
                        variant="modalInput"
                        id="filter-games-btn"
                        type="button"
                        onClick={() => setResults(results === games ? []: games ) }
                    >
                    Filter By Games Selected
                    </Button>
                    <div className="modal-listed-games">
                        <div id="modal-results">
                        {results?.map(({name,image}, i) => (
                            <div className="modal-results-item" key={`${name}-game-results-${i}`}>
                                {/* <!-- Column --> */}
                                <div className="modal-results-image">
                                    <img 
                                        src={image}
                                        alt={`${name}-game-cover`} 
                                        height="100%" 
                                        width="100%"
                                    />
                                </div>
                                {/* <!-- Column --> */}
                                <div>
                                    <div className="modal-results-title">
                                        {name}
                                    </div>
                                    <Button 
                                        hidden={gameAdded(name)}
                                        variant="modalAdd"
                                        onClick={() => addGameHandler(name,image)}
                                    >
                                    Add
                                    </Button>
                                    <Button 
                                        className="selected"
                                        hidden={!gameAdded(name)}
                                        variant="modalAdd"
                                        onClick={() => removeGameHandler(name,image)}
                                    >
                                    Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <Button 
                        variant="modalToggle" 
                        disabled={!games.length} 
                        onClick={() => onSubmitHandler()}
                    >
                    Submit Game Suggestion
                    </Button>
                    <Button 
                    variant="modalToggle" 
                    onClick={() => setOpen(false)}
                    >
                    Close
                    </Button>
                </div>
            </div>
        </div> 
    );
}
 
export default Modal;