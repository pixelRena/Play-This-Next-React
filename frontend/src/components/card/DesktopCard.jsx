import "../../styles/Card.scss"
// import Results from "../../mock.json"
import Badge from "../badge/Badge"
import { useContext, useEffect, useState } from "react"
import { Store } from "../../context/Store.context.jsx"
import axios from "axios"
import {
  backlogBadgeClass,
  backlogBadgeText,
  generateDirectoryURL,
  isWithinLast24Hours,
} from "../../utils.jsx"
import Loader from "../loader/Loader.jsx"

const DesktopCard = () => {
  const { usernameApi, state, dispatch } = useContext(Store)
  const { isBacklog } = state
  const games = isBacklog ? state.backlog.data : state.suggested.data
  const [searchText, setSearchText] = useState("")

  const searchTextHandler = (e) => {
    if (!isBacklog) {
      if (e.target.value === "") {
        dispatch({
          type: "RESET_SUGGESTED",
          payload: state.suggested.originalData,
        })
        setSearchText("")
      } else {
        setSearchText(e.target.value)
        dispatch({
          type: "FILTER_SUGGESTED_TEXT",
          payload: e.target.value,
        })
      }
      return
    }

    if (e.target.value === "") {
      dispatch({
        type: "RESET_BACKLOG",
        payload: state.backlog.originalData,
      })
      setSearchText("")
    } else {
      setSearchText(e.target.value)
      dispatch({
        type: "FILTER_BACKLOG_TEXT",
        payload: e.target.value,
      })
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(document.location.hash)
    const access_token = params?.get("#access_token")

    const collectUsername = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3001/auth?access_token=${access_token}`
        )
        usernameApi(data.twitchUsername, access_token, data.expires_in)
      } catch (error) {
        console.error(error)
      }
    }

    if (access_token) collectUsername()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setSearchText("")
  }, [isBacklog])

  return (
    <div className="desktop-card card rounded-0 d-none d-md-block text-uppercase">
      <div className="card-body p-4">
        <div className="d-flex flex-column gap-4">
          <div className="input-group mb-3 border-bottom">
            <span className="input-group-text bi-search border-0 bg-transparent fs-5 " />
            <input
              value={searchText}
              onChange={(e) => searchTextHandler(e)}
              type="search"
              className="form-control border-0 bg-transparent text-uppercase fs-6 rounded-0"
              placeholder="Search games..."
            />
          </div>
          {state.suggested.loading && <Loader />}
          {games.length === 0 && !state.suggested.loading ? (
            <div>No games to display. Try a different filter.</div>
          ) : (
            games.map(
              ({ name, image, status, username, played, created_at }) => (
                <div className="d-flex flex-row gap-4" key={name}>
                  <div className="card-game-cover">
                    <div
                      role="img"
                      aria-label={`${name + " Image Cover"}`}
                      style={{ backgroundImage: `url(${image})` }}
                    ></div>
                  </div>

                  <div>
                    <div className="card-game-title text-nowrap text-truncate">
                      <a
                        href={generateDirectoryURL(name)}
                        title={`Check out ${name} on twitch`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {name}
                      </a>
                    </div>
                    <div className="d-flex flex-row gap-2 mt-2">
                      {isBacklog ? (
                        <Badge
                          className={`card-badge-game-${backlogBadgeClass(
                            played
                          )}`}
                        >
                          {backlogBadgeText(played)}
                        </Badge>
                      ) : (
                        <>
                          <Badge className={`card-badge-game-${status}`}>
                            {status}
                          </Badge>
                          <Badge className="card-badge-twitch-username">
                            <a
                              className="text-decoration-none"
                              href={`https://twitch.tv/${username}`}
                              title={`Check out ${username} on twitch`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              @{username}
                            </a>
                          </Badge>
                          {isWithinLast24Hours(created_at) && (
                            <Badge
                              className="card-badge new"
                              title="This game has been added within the last 24 hours"
                            >
                              New!!
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default DesktopCard
