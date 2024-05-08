import { ModalContext } from "../../components/modal/Modal.context"
import { CardContext } from "./Card.context"
import { useContext, useEffect, useState } from "react"
import { Store } from "../../context/Store.context"
import Text from "../text/Text"
import Button from "../../components/button/Button"
import Loader from "../../components/loader/Loader"
import "./Card.scss"
import "../../styles/Status.scss"
import axios from "axios"
import Link from "svg/link"
import Refresh from "svg/refresh"
import PlusCircle from "svg/plus-circle"
import { NotificationContext } from "../notification/Notification.context"
import { generateDirectoryURL } from "utils"

const cardInformation: {
  data: string[]
  text: string
  status: "next" | "completed" | "declined" | "queue" | null
} = {
  data: [],
  text: "",
  status: null,
}

const Card = (props) => {
  const { cardHeader, cardFooter, ownedGames, gamesCompleted, isCardFlipped } =
    useContext(CardContext)
  const [card, setCard] = useState(cardInformation)
  const [selected, setSelected] = useState<any>("")
  const { setModalVisibility } = useContext(ModalContext)
  const { state, usernameApi, dispatch, setPostRequest } = useContext(Store)
  const { notification } = useContext(NotificationContext)
  const { setCardInformation } = useContext(CardContext)
  const { suggested, steam } = state
  const { data, text, status } = card

  const handleSearch = (e) => {
    const dataCopy = isCardFlipped ? steam.data : suggested.data

    setCard((prev) => ({ ...prev, text: e.target.value }))

    if (e.target.value === "" || e.target.value.length === 0) {
      setCard((prev) => ({
        ...prev,
        data: dataCopy.filter((data) =>
          selected ? data["status"] === selected : data
        ),
      }))
    } else {
      let results
      if (selected) {
        results = dataCopy.filter((game: any) => {
          return (
            game.name.toLowerCase().includes(text.toLowerCase()) &&
            game.status === selected
          )
        })
        setCard((prev) => ({ ...prev, status: selected }))
      } else {
        results = dataCopy.filter((game: any) => {
          return game.name.toLowerCase().includes(text.toLowerCase())
        })
      }
      setCard((prev) => ({ ...prev, data: results }))
    }
  }

  const handleStatus = (e) => {
    let results = suggested.data.filter((game: any) => {
      return game.status === e.target.value
    })

    if (selected === e.target.value || !e.target.value) {
      // Reset selected filter
      setSelected("")
      setCard((prev) => ({ ...prev, data: suggested.data }))
      return
    } else {
      setSelected(e.target.value)
    }
    setCard((prev) => ({ ...prev, data: results }))
  }

  const RefreshSteamGames = async () => {
    dispatch({
      type: "FETCH_REQUEST_FOR_STEAM",
    })
    try {
      const { data } = await axios.post("/seed-steam-games")
      dispatch({
        type: "FETCH_SUCCESS_FOR_STEAM",
        payload: data,
      })
      notification("Owned games successfully updated!")
      // Todo: Temp fix card resetting to suggested games as data
      setCardInformation(false)
      setPostRequest(true)
    } catch (error) {
      dispatch({
        type: "FETCH_FAIL_FOR_STEAM",
        payload: error,
      })
      notification("Unable to update owned games. Please try again later.")
      setPostRequest(false)
    }
  }

  const CardHeader = () => (
    <div id="card-header-container">
      <h3 id="card-header">{cardHeader}</h3>

      {isCardFlipped ? (
        <div id="refresh-button">
          <Refresh title="Refresh owned games" onClick={RefreshSteamGames} />
        </div>
      ) : (
        <div id="status-container">
          <div className="desktop">
            <label htmlFor="status">Sort by:</label>
            <Button
              className={selected === "next" && "selected"}
              variant="nextStatus"
              value="next"
              onClick={handleStatus}
            >
              Next
            </Button>
            <Button
              className={selected === "declined" && "selected"}
              variant="declinedStatus"
              value="declined"
              onClick={handleStatus}
            >
              Declined
            </Button>
            <Button
              className={selected === "queue" && "selected"}
              variant="queueStatus"
              value="queue"
              onClick={handleStatus}
            >
              Queue
            </Button>
            <Button
              className={selected === "completed" && "selected"}
              variant="completeStatus"
              value="completed"
              onClick={handleStatus}
            >
              Completed
            </Button>
          </div>
          <div className="mobile">
            <label htmlFor="status">Sort by:</label>
            <select
              name="status"
              id="status-selection"
              defaultValue=""
              onChange={handleStatus}
            >
              <option value="next">Next</option>
              <option value="">Show All</option>
              <option value="queue">Queue</option>
              <option value="completed">Completed</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )

  const CardBody = () => (
    <div id="card-body">
      {/* <!-- Loop card items --> */}
      {suggested.loading ? <Loader /> : <CardList data={data} />}
    </div>
  )

  const CardFooter = () => (
    <div id="card-footer">
      {cardFooter}: {isCardFlipped ? ownedGames : gamesCompleted}
    </div>
  )

  useEffect(() => {
    // Sorts data when user types text to match suggested data
    setCard((prev) => ({ ...prev, data: suggested.data }))
  }, [suggested])

  useEffect(() => {
    if (data === suggested.data || isCardFlipped) {
      setCard((prev) => ({ ...prev, data: steam.data }))
    } else if (data === steam.data || !isCardFlipped) {
      setCard((prev) => ({ ...prev, data: suggested.data }))
    }
    // Empties textfield if card is flipped to different section
    setCard((prev) => ({ ...prev, text: "" }))
    setSelected("")

    // eslint-disable-next-line
  }, [isCardFlipped])

  useEffect(() => {
    // Copies data into a different variable
    let dataCopy = isCardFlipped ? steam.data : suggested.data

    // Sorts data according to status selected
    if (dataCopy === suggested.data) {
      let results = dataCopy.sort((a: any, b: any) => {
        if (a.status === status && b.status !== status) return -1
        if (a.status !== status && b.status === status) return 1
        return a.status.localeCompare(b.status)
      })

      setCard((prev) => ({ ...prev, data: results }))
      return
    }
    setCard((prev) => ({ ...prev, data: dataCopy }))
    // eslint-disable-next-line
  }, [status])

  useEffect(() => {
    const params = new URLSearchParams(document.location.hash)
    const access_token = params?.get("#access_token")

    const collectUsername = async () => {
      try {
        const { data } = await axios.get(
          `/callback-oauth?access_token=${access_token}`
        )
        usernameApi(data.twitchUsername, access_token, data.expires_in)
        setModalVisibility()
      } catch (error) {
        console.error(error)
      }
    }

    if (access_token) collectUsername()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div id="card">
      <CardHeader />
      <label htmlFor="card-search-input" hidden>
        Search For Games
      </label>
      <input
        value={text}
        type="text"
        id="card-search-input"
        placeholder="Search games.."
        onChange={handleSearch}
      />
      <Button
        variant="add"
        title="Start searching for games to add!"
        data-tooltip-id="helper-tooltip"
        onClick={setModalVisibility}
        style={{ padding: "5px" }}
      >
        <PlusCircle
          style={{
            display: "block",
            margin: "0 auto",
          }}
        />
      </Button>
      <Button
        className="backlog-button"
        variant="add"
        title="Check for games that are already considered!"
        onClick={props.openBacklog}
        style={{ width: "fit-content", padding: "10px" }}
      >
        <Text size="small" color="#0C0C0C">
          BACKLOG
        </Text>
      </Button>
      <CardBody />
      <CardFooter />
    </div>
  )
}

export default Card

const CardList = ({ data }) => {
  const { isCardFlipped } = useContext(CardContext)

  return (
    <div className="card-list">
      {/* Todo: Temp fix for data turning into string */}
      {data && Array.isArray(data) ? (
        data?.map(({ name, image, username, status }) => (
          <div className="card-list-item" key={`${name}-id`}>
            {/* <!-- Column --> */}
            <div>
              <div
                className={`${
                  isCardFlipped ? "card-list-image-steam" : "card-list-image"
                }`}
                role="img"
                aria-label={`${
                  isCardFlipped ? name + " Steam Icon" : name + " Image Cover"
                }`}
                style={{ backgroundImage: `url(${image})` }}
              ></div>
            </div>
            {/* <!-- Column --> */}
            <div className="card-information">
              {isCardFlipped ? (
                <div className="card-list-item-title">{name}</div>
              ) : (
                <div style={{ display: "flex", gap: "5px" }}>
                  <a
                    href={generateDirectoryURL(name)}
                    target="_blank"
                    rel="noreferrer"
                    className="card-list-item-title link"
                    title={name}
                  >
                    {name}
                  </a>
                  <span>
                    <Link />
                  </span>
                </div>
              )}
              {isCardFlipped ? null : (
                <div className="card-list-extra-information">
                  <div>
                    Posted by:&nbsp;
                    <strong>
                      <a
                        className="username-link"
                        href={`https://www.twitch.tv/${username}`}
                        target="_blank"
                        rel="noreferrer"
                        title={`Checkout ${username} on Twitch!`}
                        aria-label={`Game ${name} posted by ${username}. Status is in ${status}. Click to visit ${username} on twitch!`}
                      >
                        {username}
                      </a>
                    </strong>
                  </div>
                  <div className={`game-status-${status}`}>{status}</div>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <Text size="large">No Games Found</Text>
      )}
    </div>
  )
}
