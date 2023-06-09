import './styles/App.scss';
import './styles/Loader.scss';
import Notification from "./components/Notification.component";
import Modal from "./components/Modal.component";
import Button from "./components/Button.component";
import Overlay from "./components/Overlay.component";
import AvatarContainer from "./components/AvatarContainer.component";
import Card from "./components/Card.component";
import { useState } from "react";

// TODO: Create Select, Input, Form Component
// ! Why not put all the contexts together?
// ? Put all css files inside of index instead of app.js?
// ? Font sizes to go from px to rem?

const App = () => {
  const [toggleView, setToggleView] = useState(true);

  return (
    <>
      <Notification/>      
      <main>
        <section>
          <Overlay/>
        </section>

        <section>
            <AvatarContainer/>
            <Button onClick={() => setToggleView(!toggleView)}>{toggleView ? "View Owned Games" : "View Suggested Games"}</Button>
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
