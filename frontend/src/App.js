import Notification from "./components/Notification.component";
import Modal from "./components/Modal.component";
import Button from "./components/Button.component";
import Overlay from "./components/Overlay.component";
import AvatarContainer from "./components/AvatarContainer.component";
import Card from "./components/Card.component";
import ParticlesContainer from "./components/ParticlesContainer.component";
import { CardContext } from "./context/card.context";
import { useContext } from "react";
import { ModalContext } from "./context/modal.context";

// ? Font sizes to go from px to rem?

const App = () => {
  const {
    isCardFlipped, 
    setIsCardFlipped,
    buttonTitle,
  } = useContext(CardContext);
  const {setOpen} = useContext(ModalContext)

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
          <Button variant="light" onClick={() => setOpen(true)}>Submit Game Suggestion</Button>
            <Card/>
        </section>

        <section>
            <Modal/>
        </section>
      </main>
      <ParticlesContainer/>
    </>
  );
}

export default App;
