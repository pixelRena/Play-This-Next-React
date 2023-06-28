import Button from "./Button.component";
import Loader from "./Loader.component";
import '../styles/Card.scss';
import '../styles/Status.scss';
import { ModalContext } from "../context/modal.context";
import { CardContext } from "../context/card.context";
import { useContext, useEffect, useState } from "react";
import { Store } from "../context/store.context";

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
    const {isCardFlipped} = useContext(CardContext);
	const { state } = useContext(Store);
	const { suggested, steam } = state;
    const [data, setData] = useState(suggested.data);

    useEffect(() => {
        // ! Only working on second render
        setData(data === suggested.data ? steam.data : suggested.data);
    },[])

    return (
        <div id="card-body">
            {/* <!-- Loop card items --> */}
            {suggested.loading ? 
                <Loader/> 
            : 
                <CardList data={data}/>
            }
        </div>
    )
}

const CardList = ({data}) => {
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
                                        <a href={`https://www.twitch.tv/${username}`} target="_blank" rel="noreferrer">{username}</a>
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