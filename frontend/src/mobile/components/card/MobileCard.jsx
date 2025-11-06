import Badge from "../../../components/badge/Badge.jsx"
import { useContext, useEffect, useRef, useState } from "react"
import { Store } from "../../../context/Store.context.jsx"
import axios from "axios"
import {
  backlogBadgeClass,
  backlogBadgeText,
  generateDirectoryURL,
  isWithinLast24Hours,
  scrollToTop,
  cardSwitchText,
} from "../../../utils.jsx"
import Loader from "../../../components/loader/Loader.jsx"
import "../../../styles/Card.scss"
import DropdownMenu from "../dropdown-menu/DropdownMenu.jsx"

const MobileCard = () => {
  const { usernameApi, state, dispatch } = useContext(Store)
  const { isBacklog } = state
  const games = isBacklog ? state.backlog.data : state.suggested.data
  const [searchText, setSearchText] = useState("")
  const [scrollPosition, setSrollPosition] = useState(0)
  const [showButton, setShowButton] = useState(false)
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

  useEffect(() => {
    ref.current.addEventListener("scroll", handleVisibleButton)
  })

  return (
    <div
      className="modal mobile-card fade modal-md"
      id="mobileGamesModal"
      tabIndex="-1"
    >
      <div className="modal-dialog modal-fullscreen">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-uppercase">Suggested Games</h5>
            <button
              type="button"
              className="btn ms-auto fs-5"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              X
            </button>
          </div>
          <div
            className="modal-body text-uppercase h-50 overflow-y-auto"
            ref={ref}
          >
            {showButton && (
              <button
                className="btn btn-dark rounded-0 btn-md position-fixed top-90 start-85"
                title="Scroll to top"
                onClick={() => scrollToTop(ref)}
              >
                <i className="bi bi-arrow-up" />
              </button>
            )}
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
            <div className="d-flex flex-column gap-2 my-3">
              <button
                type="button"
                className="btn btn-sm btn-dark"
                onClick={() =>
                  dispatch({
                    type: "isBacklog",
                    payload: !isBacklog,
                  })
                }
              >
                View {cardSwitchText(isBacklog)}
              </button>

              {!isBacklog && <DropdownMenu />}

              {state.suggested.isFiltered && (
                <button
                  type="button"
                  className="btn btn-sm btn-dark"
                  onClick={() =>
                    dispatch({
                      type: "RESET_SUGGESTED",
                      payload: state.suggested.originalData,
                    })
                  }
                >
                  Reset Filter
                </button>
              )}
            </div>

            {state.suggested.loading && <Loader />}
            {games.length === 0 && !state.suggested.loading ? (
              <div>No games to display. Try a different filter.</div>
            ) : (
              games.map(
                ({ name, image, status, username, played, created_at }) => (
                  <div className="d-flex flex-row mt-4 gap-4" key={name}>
                    <div className="card-game-cover">
                      <div
                        role="img"
                        aria-label={`${name + " Image Cover"}`}
                        style={{
                          backgroundImage: `url(${image})`,
                          backgroundSize: "cover",
                          width: "120px",
                          height: "150px",
                        }}
                      ></div>
                    </div>

                    <div className="w-50">
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
                      <div className="d-flex flex-column gap-2 mt-2">
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
                                className="text-decoration-none text-truncate d-block"
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
    </div>
  )
}

export default MobileCard
