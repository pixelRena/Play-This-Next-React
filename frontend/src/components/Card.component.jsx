import Button from "./Button.component";
import Loader from "./Loader.component";
import '../styles/Card.scss';
import '../styles/Status.scss';
import { ModalContext } from "../context/modal.context";
import { CardContext } from "../context/card.context";
import { useContext, useEffect, useState } from "react";
import { Store } from "../context/store.context";

const Card = () => {
    const {isCardFlipped} = useContext(CardContext);
	const { state } = useContext(Store);
    const { suggested, steam } = state;
    const [data, setData] = useState();
    const [text, setText] = useState('');
    const [status, setStatus] = useState('next'); 

    const handleSearch = (e) => {
        let dataCopy = isCardFlipped ? steam.data : suggested.data
        let text = e.target.value
        setText(text)
        
        if (text === '') {
            sortStatus(status)
        } else {
            let results = dataCopy.filter((game) => {
                return game.name.toLowerCase().includes(text.toLowerCase())
            })
            setData(results)
        }
    }

    const handleStatus = (e) => {
        let status = e.target.value
        setStatus(status)
        sortStatus(status)
    }

    const sortStatus = (status) => {
        let dataCopy = isCardFlipped ? steam.data : suggested.data
        if (dataCopy === suggested.data) {
            let results = dataCopy.sort((a, b) => {
                if (a.status === status && b.status !== status) return -1;
                if (a.status !== status && b.status === status) return 1;
                return a.status.localeCompare(b.status);
            }) 
            
            setData(results)
            return
        }
        setData(dataCopy)
    }

    // ! Temp workaround:
    useEffect(() => {
        setData(suggested.data)
    },[suggested])

    useEffect(() => {
        if (data === suggested.data || isCardFlipped) {
            setData(steam.data)
        } else if (data === steam.data || !isCardFlipped) {
            setData(suggested.data)
        }
        setText('')
        // eslint-disable-next-line
    }, [isCardFlipped])
    
    return (
        <div id="card">
            <CardHeader handleStatus={handleStatus} />
            <CardInputGroup handleSearch={handleSearch} text={text} />
            <CardBody data={data} />
            <CardFooter />
        </div>    
    )
}

export default Card;

const CardHeader = ({handleStatus}) => {
    const {cardHeader, isCardFlipped} = useContext(CardContext);

    return (
        <div id="card-header-container">
            <h3 id="card-header">{cardHeader}</h3>
            {
            isCardFlipped ?
                null 
            :
                <div id="status-container">
                    <label htmlFor="status">Sort by:</label>
                    <select name="status" id="status-selection" defaultValue="next" onChange={handleStatus}>
                        <option value="next">Playing Next</option>
                        <option value="queue">In Queue</option>
                        <option value="completed">Completed</option>
                        <option value="declined">Declined</option>
                    </select>
                </div>
            }
        </div>
    )
}

const CardBody = ({data}) => {
	const { state } = useContext(Store);
    const { suggested } = state;

    console.log(suggested)

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
    const { isCardFlipped } = useContext(CardContext);
    
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
                                    <div>
                                        Posted by:&nbsp;
                                        <strong>
                                            <a href={`https://www.twitch.tv/${username}`} target="_blank" rel="noreferrer">{username}</a>
                                        </strong>
                                    </div>
                                    <div>
                                        <strong className={`game-status-${status}`}>
                                        {status}
                                        </strong>
                                    </div>
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