import './styles/App.scss';
import './styles/Loader.scss';
import Notification from "./components/Notification.component";
import Modal from "./components/Modal.component";
import Button from "./components/Button.component";
import Overlay from "./components/Overlay.component";
import AvatarContainer from "./components/AvatarContainer.component";
import Card from "./components/Card.component";
import { CardContext } from "./context/card.context";
import { useEffect, useContext } from "react";
import { Store } from "./context/store.context";
import axios from "axios";

// TODO: Create Select, Input, Form Component
// ! Why not put all the contexts together?
// ? Put all css files inside of index instead of app.js?
// ? Font sizes to go from px to rem?

// TODO Make it so that firebase is not always called, only called once upon render
// TODO create call for rawg api in in the modal
// ! Fix loader not showing in card component
// ! Fix images for owned games

const App = () => {
	const { dispatch } = useContext(Store);
  const {
    isCardFlipped, 
    setIsCardFlipped, 
    setCardHeader, 
    setCardFooter, 
    buttonTitle, 
    setButtonTitle
  } = useContext(CardContext);

  useEffect(() => {
    const fetchSuggestedGames = async () => {
      dispatch({type: `FETCH_REQUEST_FOR_SUGGESTED`});
      try {
        let { data } = await axios.get("/suggested-games-collection");
        dispatch({
          type: `FETCH_SUCCESS_FOR_SUGGESTED`,
          payload: data
        })
      } catch(e) {
          dispatch({
              type: `FETCH_FAIL_FOR_SUGGESTED`, 
              payload: e.message
          })
      }     
    }

    const fetchSteamGames = async () => {
      dispatch({type: `FETCH_REQUEST_FOR_STEAM`});
      try {
        let { data } = await axios.get("/steam-games-collection");
        dispatch({
          type: `FETCH_SUCCESS_FOR_STEAM`,
          payload: data
        })
      } catch(e) {
          dispatch({
              type: `FETCH_FAIL_FOR_STEAM`, 
              payload: e.message
          })
      }     
    }

    fetchSuggestedGames();
    fetchSteamGames();
    console.log("running")
  },[])

  useEffect(() => {
    setCardHeader(isCardFlipped ? "Owned Games:" : "Suggested Games:");
    setCardFooter(isCardFlipped ? "Games Owned (Steam):" : "Games Completed:");
    setButtonTitle(isCardFlipped ?  "View Suggested Games" : "View Owned Games" );
    // eslint-disable-next-line
  },[isCardFlipped]);

  return (
    <>
      <Notification/>      
      <main>
        <section>
          <Overlay/>
        </section>

        <section>
            <AvatarContainer/>
            <Button onClick={() => setIsCardFlipped(!isCardFlipped)}>
              {buttonTitle}
            </Button>
            <Button variant="light">Submit Game Suggestion</Button>
            <Card/>
        </section>

        <section>
            <Modal/>
        </section>
      </main>
    </>
  );
}

export default App;
