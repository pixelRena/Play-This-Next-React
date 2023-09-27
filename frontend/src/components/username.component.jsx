import { Store } from "../context/store.context";
import { NotificationContext } from "../context/notification.context";
import { useContext } from "react";
import Text from "./Text.component";
import axios from "axios";
import Pencil from "./icons/Pencil";

const Username = () => {
  const { state, dispatch } = useContext(Store);
  const { notification } = useContext(NotificationContext);
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
            notification("Username updated!");
          });
      } else {
        throw new Error();
      }
    } catch (e) {
      notification(
        "Username was not updated because the request was cancelled or failed."
      );
    }
  };

  const style = {
    display: "flex",
    gap: 10,
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
      <Pencil
        fill="#fff"
        stroke="#fff"
        width="17px"
        height="auto"
        onClick={handleUpdate}
      />
    </div>
  );
};

export default Username;
