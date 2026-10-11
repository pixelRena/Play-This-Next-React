import "../../styles/Card.scss"
// import Results from "../../mock.json"
import Badge from "../badge/Badge"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { Store } from "../../context/Store.context.jsx"
import axios from "axios"
import {
  backlogBadgeClass,
  backlogBadgeText,
  canDeleteGame,
  generateDirectoryURL,
  isWithinLast24Hours,
  scrollToTop,
} from "../../utils.jsx"
import Loader from "../loader/Loader.jsx"
import LoadMoreSpinner from "../loader/LoadMoreSpinner.jsx"
import { API_URL } from "../../config"
import useScrollTopButton from "../../hooks/useScrollTopButton"
import useLazyList from "../../hooks/useLazyList"

const isPlayingStatus = (status) => status === "next" || status === "current"

const DesktopCard = () => {
  const { usernameApi, deleteGame, state, dispatch } = useContext(Store)
  const { isBacklog } = state
  const games = isBacklog ? state.backlog.data : state.suggested.data
  const [searchText, setSearchText] = useState("")
  const [showSortedGames, setShowSortedGames] = useState(false)
  const ref = useRef(null)
  const showButton = useScrollTopButton(ref, [games, isBacklog])
  // Stable identity, so the lazy list only starts over when the games change
  const orderedGames = useMemo(
    () =>
      showSortedGames
        ? games
        : [...games].sort((a, b) =>
            isPlayingStatus(a.status)
              ? -1
              : isPlayingStatus(b.status)
              ? 1
              : 0
          ),
    [games, showSortedGames]
  )
  const { visibleItems, sentinelRef, hasMore } = useLazyList(orderedGames, ref)

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
          `${API_URL}/auth?access_token=${access_token}`
        )
        usernameApi(
          data.twitchUsername,
          access_token,
          data.expires_in,
          data.isOwner,
          data.userId
        )
        // Drop the token from the address bar (and leave /callback/ when
        // running locally) so a reload uses the saved login
        window.history.replaceState(
          null,
          "",
          `${process.env.PUBLIC_URL}/${window.location.search}`
        )
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
            visibleItems.map(
              ({
                name,
                image,
                status,
                username,
                user_id,
                played,
                created_at,
              }) => (
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
                    <div className="d-flex flex-row gap-2 mt-2 w-90">
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
                          <a
                            className="card-badge-twitch-username text-truncate w-auto text-decoration-none"
                            href={`https://twitch.tv/${username}`}
                            title={`Check out ${username} on twitch`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            @{username}
                          </a>
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
                    {canDeleteGame(
                      state.user,
                      { user_id, status },
                      isBacklog
                    ) && (
                      <button
                        type="button"
                        className="card-badge-game-declined mt-2"
                        title={`Remove ${name}`}
                        aria-label={`Remove ${name}`}
                        onClick={() => deleteGame(name, isBacklog)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )
            )
          )}
          {hasMore && <LoadMoreSpinner sentinelRef={sentinelRef} />}
        </div>
      </div>
      {/* Sticks to the bottom of the card's scroll area, so it can't leave the card */}
      {showButton && (
        <div className="scroll-top-anchor">
          <button
            className="btn btn-dark rounded-0 btn-sm"
            title="Scroll to top"
            onClick={() => scrollToTop(ref)}
          >
            <i className="bi bi-arrow-up fs-5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default DesktopCard
