import Notification from "components/notification/Notification"
import Modal from "./components/modal/Modal"
import Button from "./components/button/Button"
import Backdrop from "./components/backdrop/Backdrop"
import AvatarContainer from "./components/avatar/AvatarContainer"
import Card from "./components/card/Card"
import ParticlesContainer from "./components/particles/ParticlesContainer"
import Username from "./components/username/Username"
import { ModalContext } from "./components/modal/Modal.context"
import { CardContext } from "./components/card/Card.context"
import { useContext, useState } from "react"
import BacklogModal from "./components/modal/Backlog-modal"

const App = () => {
  const { setCardInformation, buttonTitle, isCardFlipped } =
    useContext(CardContext)
  const { setModalVisibility } = useContext(ModalContext)
  const [backlogVisibility, setBacklogVisibility] = useState(false)

  return (
    <>
      <Notification />
      <Username />
      <main>
        <section>
          <Backdrop />
        </section>

        <section>
          <Tooltip />
          <AvatarContainer />
          <Button onClick={() => setCardInformation(!isCardFlipped)}>
            {buttonTitle}
          </Button>
          <Button variant="light" onClick={setModalVisibility}>
            Submit Game Suggestion
          </Button>
          <Card openBacklog={() => setBacklogVisibility(true)} />
        </section>

        <section>
          <Modal />
          <BacklogModal
            visible={backlogVisibility}
            open={() => setBacklogVisibility(true)}
            close={() => setBacklogVisibility(false)}
          />
        </section>
      </main>
      <ParticlesContainer />
    </>
  )
}

export default App
