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
import PlusCircle from "svg/plus-circle"
import { NotificationContext } from "../notification/Notification.context"
import { generateDirectoryURL, isWithinLast24Hours } from "utils"
import UpArrow from "svg/arrow-up"

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
  const { cardHeader, cardFooter, gamesCompleted } = useContext(CardContext)
  const [card, setCard] = useState(cardInformation)
  const [selected, setSelected] = useState<any>("")
  const { setModalVisibility } = useContext(ModalContext)
  const { state, usernameApi } = useContext(Store)
  const { notification } = useContext(NotificationContext)
  const { suggested } = state
  const { data, text, status } = card

  const handleSearch = (e) => {
    const dataCopy = suggested.data

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

  const CardHeader = () => (
    <div id="card-header-container">
      <h3 id="card-header">{cardHeader}</h3>

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
            defaultValue={selected}
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
      {cardFooter}: {gamesCompleted}
    </div>
  )

  const modalVisibility = () => {
    setModalVisibility()
    notification("Please try to recommend only retro or old school games.")
  }

  useEffect(() => {
    // Prevent card data from resetting after voting
    let results = suggested.data.filter((game: any) => {
      return game.status === selected
    })

    setCard((prev) => ({
      ...prev,
      data: selected === "" ? suggested.data : results,
    }))
    // eslint-disable-next-line
  }, [suggested])

  useEffect(() => {
    // Copies data into a different variable
    let dataCopy = suggested.data

    // Sorts data according to status selected
    let results = dataCopy.sort((a: any, b: any) => {
      if (a.status === status && b.status !== status) return -1
      if (a.status !== status && b.status === status) return 1
      return a.status.localeCompare(b.status)
    })

    setCard((prev) => ({ ...prev, data: results }))

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
        onClick={modalVisibility}
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
  const { state, api } = useContext(Store)
  const { notification } = useContext(NotificationContext)
  const { user } = state

  const setVote = async (name, voteCount, userVoted) => {
    const data = await axios.put("/suggested-game", {
      name,
      voteCount: voteCount ? voteCount : 0,
      username: user.username,
      isUserVoter: userVoted,
    })

    if (data.status === 200) {
      notification(
        userVoted ? "Vote removed successfully" : "Vote added successfully"
      )
    } else {
      notification(
        "Failed to update vote. Please try again later or contact admin."
      )
    }
    await api("/suggested-games-collection", "SUGGESTED")
  }

  const isUserVoter = (voters) =>
    voters ? voters.includes(user.username) : false

  return (
    <div className="card-list">
      {data && Array.isArray(data) ? (
        data?.map(
          ({
            name,
            image,
            username,
            status,
            posted_date,
            voteCount,
            voters,
          }) => (
            <div className="card-list-item" key={`${name}-id`}>
              {/* <!-- Column --> */}
              <div>
                <div
                  className={`${"card-list-image"} ${
                    isWithinLast24Hours(posted_date) && "new-post"
                  }`}
                  role="img"
                  aria-label={`${name + " Image Cover"}`}
                  style={{ backgroundImage: `url(${image})` }}
                ></div>
              </div>
              {/* <!-- Column --> */}
              <div className="card-information">
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
                  {/* Todo: Update to prevent users from voting if token expired and only allow one vote, user must also be signed in */}
                  {/* {status === "queue" && (
                    <div className="upvote-container">
                      <Button
                        className={`upvote ${isUserVoter(voters) && "active"}`}
                        variant="completeStatus"
                        onClick={() =>
                          setVote(name, voteCount, isUserVoter(voters))
                        }
                      >
                        <UpArrow color="white" size={18} />
                      </Button>
                      <Text className="upvote-text" inline>
                        {" "}
                        {voteCount ? "+" + voteCount : 0}
                      </Text>
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          )
        )
      ) : (
        <Text size="large">No Games Found</Text>
      )}
    </div>
  )
}
