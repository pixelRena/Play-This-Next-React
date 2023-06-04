import Button from "./Button.component";
import Loader from "./Loader.component";
import '../styles/Card.scss';
import '../styles/Status.scss';
import { LoaderContext } from "../context/loader.context";
import { useContext } from "react";

const Card = () => (
    <div id="card">
        <CardHeader/>
        <CardBody/>
        <CardFooter/>
    </div>
)

export default Card;

const CardHeader = () => (
    <>
        <div id="card-header-container">
            <h3 id="card-header">Suggested Games:</h3>
            <div id="status-container">
                <label htmlFor="status">Sort by:</label>
                <select name="status" id="status-selection">
                    <option value="next">Playing Next</option>
                    <option value="queue">In Queue</option>
                    <option value="completed">Completed</option>
                    <option value="declined">Declined</option>
                </select>
            </div>
        </div>
        <CardInputGroup/>
    </>
)

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

const CardList = () => <div className="card-list"></div>

const CardFooter = () => <div id="card-footer">Games Completed: 3</div>

const CardInputGroup = () => (
    <>
        <Button variant="add">+</Button>
        <input type="text" id="card-search-input" placeholder="Search games.."/>
    </>
)