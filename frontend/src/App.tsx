import Notification from "components/notification/Notification";
import Modal from "./components/modal/Modal";
import Button from "./components/button/Button";
import Backdrop from "./components/backdrop/Backdrop";
import AvatarContainer from "./components/avatar/AvatarContainer";
import Card from "./components/card/Card";
import ParticlesContainer from "./components/particles/ParticlesContainer";
import Username from "./components/username/Username";
import { ModalContext } from "./components/modal/Modal.context";
import { CardContext } from "./components/card/Card.context";
import { useContext } from "react";

const App = () => {
  const { setCardInformation, buttonTitle, isCardFlipped } =
    useContext(CardContext);
  const { setModalVisibility } = useContext(ModalContext);

  return (
    <>
      <Notification />
      <Username />
      <main>
        <section>
          <Backdrop />
        </section>

        <section>
          <AvatarContainer />
          <Button onClick={() => setCardInformation(!isCardFlipped)}>
            {buttonTitle}
          </Button>
          <Button variant="light" onClick={setModalVisibility}>
            Submit Game Suggestion
          </Button>
          <Card />
        </section>

        <section>
          <Modal />
        </section>
      </main>
      <ParticlesContainer />
    </>
  );
};

export default App;
