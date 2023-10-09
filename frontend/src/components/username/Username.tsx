import { Store } from "context/Store.context";
import { useContext } from "react";
import { useSetUsername } from "./Username.utils";
import Text from "components/text/Text";
import Pencil from "components/icons/Pencil";

const Username = () => {
  const { state } = useContext(Store);
  const setUsername = useSetUsername();

  const style: React.CSSProperties = {
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
          {state.username || "Not Provided"}
        </Text>
      </Text>
      <Pencil
        fill="#fff"
        stroke="#fff"
        width="17px"
        height="auto"
        onClick={setUsername}
      />
    </div>
  );
};

export default Username;
