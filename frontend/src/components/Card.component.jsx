import Button from "./Button.component";
import Loader from "./Loader.component";
import '../styles/Card.scss';
import '../styles/Status.scss';
import { ModalContext } from "../context/modal.context";
import { CardContext } from "../context/card.context";
import { useContext, useEffect, useState } from "react";
import { Store } from "../context/store.context";

const Card = () => {
    const [data, setData] = useState();
    const [text, setText] = useState('');
    const {isCardFlipped} = useContext(CardContext);
	const { state } = useContext(Store);
    const { suggested, steam } = state;

    const handleSearch = (e) => {
        let dataCopy
        let text = e.target.value
        setText(text)

        const filteredData = data.filter(game => game.name.toLowerCase().includes(text.toLowerCase()))

        if (text === '') {
            // If the card is on suggested, it will set data to keep showing suggested
            if (!isCardFlipped) {
                dataCopy = suggested.data
                setData(dataCopy)
                return
            }
            dataCopy = steam.data
            setData(dataCopy)
            return
        }
        setData(filteredData)
    }

    // Temp workaround:
    useEffect(() => {
        setData(suggested.data)
    },[suggested])

    useEffect(() => {
        setData(data === suggested.data ? steam.data : suggested.data);
    }, [isCardFlipped])
    
    return (
        <div id="card">
            <CardHeader />
            <CardInputGroup handleSearch={handleSearch} text={text} />
            <CardBody data={data} />
            <CardFooter />
        </div>    
    )
}

export default Card;

const CardHeader = () => {
    const {cardHeader, isCardFlipped} = useContext(CardContext);
    const [statusSelection, setStatusSelection] = useState("next"); 


    return (
        <div id="card-header-container">
            <h3 id="card-header">{cardHeader}</h3>
            {/* {
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
            } */}
        </div>
    )
}

const CardBody = ({data}) => {
	const { state } = useContext(Store);
    const { suggested, steam } = state;

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
                            className={`${isCardFlipped ? 'card-list-image-steam' : 'card-list-image'}`}
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

const CardInputGroup = ({handleSearch, text}) => {
    const { setOpen } = useContext(ModalContext);

    return ( 
        <>
            <input value={text} type="text" id="card-search-input" placeholder="Search games.." onChange={handleSearch} />
            <Button variant="add" onClick={() => setOpen(true)}>+</Button>
        </>
    )
}