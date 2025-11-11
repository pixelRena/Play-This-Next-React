import "../../styles/Card.scss"
// import Results from "../../mock.json"
import Badge from "../badge/Badge"
import { useContext, useEffect, useRef, useState } from "react"
import { Store } from "../../context/Store.context.jsx"
import axios from "axios"
import {
  backlogBadgeClass,
  backlogBadgeText,
  generateDirectoryURL,
  isWithinLast24Hours,
  scrollToTop,
} from "../../utils.jsx"
import Loader from "../loader/Loader.jsx"

const DesktopCard = () => {
  const { usernameApi, state, dispatch } = useContext(Store)
  const { isBacklog } = state
  const games = isBacklog ? state.backlog.data : state.suggested.data
  const [searchText, setSearchText] = useState("")
  const [scrollPosition, setSrollPosition] = useState(0)
  const [showButton, setShowButton] = useState(false)
  const [showSortedGames, setShowSortedGames] = useState(false)
  const ref = useRef(null)

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

  const handleVisibleButton = () => {
    const position = ref.current.scrollTop
    setSrollPosition(position)

    if (scrollPosition > 600) {
      return setShowButton(true)
    } else if (scrollPosition < 600) {
      return setShowButton(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(document.location.hash)
    const access_token = params?.get("#access_token")

    const collectUsername = async () => {
      try {
        const { data } = await axios.get(
          `https://play-this-next-react.vercel.app/auth?access_token=${access_token}`
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
    setShowSortedGames(false)
  }, [isBacklog])

  useEffect(() => {
    ref.current.addEventListener("scroll", handleVisibleButton)
  })

  useEffect(() => {
    const { isSorted } = state.suggested
    if (isSorted) {
      setShowSortedGames(true)
    } else {
      setShowSortedGames(false)
    }
  }, [state.suggested.isSorted])

  return (
    <div
      className="desktop-card card rounded-0 d-none d-md-block text-uppercase mt-lg-0 mt-5"
      ref={ref}
    >
      {showButton && (
        <button
          className="btn btn-dark rounded-0 btn-sm position-fixed top-80 start-88 z-3"
          title="Scroll to top"
          onClick={() => scrollToTop(ref)}
        >
          <i className="bi bi-arrow-up fs-5" />
        </button>
      )}
      <div className="card-body p-4">
        <div className="d-flex flex-column gap-4">
          <div className="input-group border-bottom">
            <span className="input-group-text bi-search border-0 bg-transparent fs-5 " />
            <input
              value={searchText}
              onChange={(e) => searchTextHandler(e)}
              type="search"
              className="form-control border-0 bg-transparent text-uppercase fs-6 rounded-0"
              placeholder="Search games..."
            />
          </div>
          {state.suggested.isFiltered && (
            <div>
              <button
                type="button"
                className="btn btn-sm btn-dark w-auto"
                onClick={() =>
                  dispatch({
                    type: "RESET_SUGGESTED",
                    payload: state.suggested.originalData,
                  })
                }
              >
                Reset Filter
              </button>
            </div>
          )}
          {state.suggested.loading && <Loader />}
          {games.length === 0 && !state.suggested.loading ? (
            <div>No games to display. Try a different filter.</div>
          ) : (
            (showSortedGames
              ? games
              : [...games].sort((a, b) =>
                  a.status === "current" ? -1 : b.status === "current" ? 1 : 0
                )
            ).map(({ name, image, status, username, played, created_at }) => (
              <div className="d-flex flex-row gap-4" key={name}>
                <div className="card-game-cover">
                  <div
                    role="img"
                    aria-label={`${name + " Image Cover"}`}
                    style={{ backgroundImage: `url(${image})` }}
                  ></div>
                </div>

                <div className="w-75">
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default DesktopCard
