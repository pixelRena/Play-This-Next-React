import { Store } from "context/Store.context"
import { useContext } from "react"
import Text from "components/text/Text"

const Username = () => {
  const { state } = useContext(Store)

  const style: React.CSSProperties = {
    display: "flex",
    gap: 10,
    position: "absolute",
    top: "15px",
    left: "15px",
    zIndex: "5",
  }

  return (
    <div className="username-container" style={style}>
      <Text size="small">
        Your Twitch Username: &nbsp;
        <Text color="lawngreen" bold={true} inline={true} size="small">
          {state["user"]["username"] || "Not Provided"}
        </Text>
      </Text>
    </div>
  )
}

export default Username
