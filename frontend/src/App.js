import Notification from "./components/Notification.component";
import Modal from "./components/Modal.component";
import Button from "./components/Button.component";
import Overlay from "./components/Overlay.component";
import AvatarContainer from "./components/AvatarContainer.component";
import Card from "./components/Card.component";
import { CardContext } from "./context/card.context";
import { useContext } from "react";

// ? Font sizes to go from px to rem?

//  ! Fix username not sending correctly
// ! Fix images for owned games

const App = () => {
  const {
    isCardFlipped, 
    setIsCardFlipped,
    buttonTitle,
  } = useContext(CardContext);

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
