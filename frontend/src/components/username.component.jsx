import { Store } from "../context/store.context";
import { useContext } from "react";
import Button from "./Button.component";
import Text from "./Text.component";
import axios from "axios";

const Username = () => {
  const { state, dispatch } = useContext(Store);
  const { username } = state;

  const handleUpdate = async () => {
    try {
      let newUsername = prompt("Enter your twitch username: ");
      if (newUsername) {
        await axios
          .post("/update-username", {
            oldUsername: username,
            newUsername,
          })
          .then(() => {
            localStorage.setItem("username-serenuy-games-ttv", newUsername);
            dispatch({
              type: "username",
              payload: newUsername,
            });
            alert("Username updated!");
          });
      } else {
        throw new Error();
      }
    } catch (e) {
      alert(
        "Username was not updated because the request was cancelled or failed."
      );
    }
  };

  const style = {
    position: "absolute",
    top: "15px",
    left: "15px",
    zIndex: "5",
  };

  return (
    <div className="username-container" style={style}>
      <Text size="small">
        Your Twitch Username:
        <Text color="lawngreen" bold={true} inline={true} size="small">
          {username || "Not Provided"}
        </Text>
      </Text>
      <Button variant="modalInput" onClick={handleUpdate}>
        Update Username
      </Button>
    </div>
  );
};

export default Username;