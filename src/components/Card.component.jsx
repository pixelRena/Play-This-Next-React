import Button from "./Button.component";
import Loader from "./Loader.component";
import '../styles/Card.scss';
import '../styles/Status.scss';
import { LoaderContext } from "../context/loader.context";
import { ModalContext } from "../context/modal.context";
import { CardContext } from "../context/card.context";
import { useContext, useState } from "react";

const data = null;

const Card = () => (
    <div id="card">
        <CardHeader/>
        <CardBody/>
        <CardFooter/>
    </div>
)

export default Card;

const CardHeader = () => {
    const {cardHeader, isCardFlipped} = useContext(CardContext);
    const [statusSelection, setStatusSelection] = useState("next"); 

    return (
        <>
            <div id="card-header-container">
                <h3 id="card-header">{cardHeader}</h3>
                {
                isCardFlipped ?
                   null 
                :
                    <div id="status-container">
                        <label htmlFor="status">Sort by:</label>
                        <select name="status" id="status-selection" onChange={(event) => setStatusSelection(event.target.value)}>
                            <option value="next">Playing Next</option>
                            <option value="queue">In Queue</option>
                            <option value="completed">Completed</option>
                            <option value="declined">Declined</option>
                        </select>
                    </div>
                }
            </div>
            <CardInputGroup/>
        </>
    )
}

const CardBody = () => {
    const {isLoading} = useContext(LoaderContext);

    return (
        <div id="card-body">
            {/* <!-- Loop card items --> */}
            {isLoading ? 
                <Loader/> 
            : 
                <CardList/>
            }
        </div>
    )
}

const CardList = () => {
    const {isCardFlipped} = useContext(CardContext);

    return (
        <div className="card-list">
            { data?.map(({name, image, username, status}) =>
                    <div className="card-list-item" key={`${name}-id`}>
                        {/* <!-- Column --> */}
                        <div 
                            className="card-list-image"
                            style={{backgroundImage: `url(${image})`}}>     
                        </div>
                        {/* <!-- Column --> */}
                        <div>
                            <div className="card-list-item-title">{name}</div>
                            {
                            isCardFlipped ?
                                null 
                            :
                                <div className="card-list-extra-information">
                                    Posted by: 
                                    <strong>
                                        <a href={`https://www.twitch.tv/${username}`} target="_blank" rel="noreferrer">${username}</a>
                                    </strong> <br/>
                                    <strong className={`game-status-${status}`}>
                                    {status}
                                    </strong>
                                </div>
                            }
                        </div>
                    </div>
                
                )
            }        
        </div>
    )
}

const CardFooter = () => { 
    const {
        cardFooter, 
        isCardFlipped, 
        ownedGames, 
        gamesCompleted
    } = useContext(CardContext);

    return <div id="card-footer">{cardFooter} {isCardFlipped ? ownedGames : gamesCompleted}</div>
}

const CardInputGroup = () => {
    const {setOpen} = useContext(ModalContext);

    return ( 
            <>
                <Button variant="add" onClick={() => setOpen(true)}>+</Button>
                <input type="text" id="card-search-input" placeholder="Search games.."/>
            </>
        )
}