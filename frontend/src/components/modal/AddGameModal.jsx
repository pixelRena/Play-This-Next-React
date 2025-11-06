// import Results from "../../mock.json"
import { useContext, useState } from "react"
import { Store } from "../../context/Store.context.jsx"
import axios from "axios"

const AddGameModal = () => {
  const { state, dispatch, authorize, forceFetchCall } = useContext(Store)
  const [searchText, setSearchText] = useState("")
  const [games, setGames] = useState([])
  const [selectedGames, setSelectedGames] = useState([])

  const onSearchHandler = async (e) => {
    e.preventDefault()

    try {
      // !bug: "+" in search text breaks the search endpoint
      if (searchText.trim().length > 0) {
        let { data } = await axios.get(
          `http://localhost:3001/games/search?name=${searchText}&token=${state.user.token}`
        )

        if (data.status === 401) {
          localStorage.removeItem("ttv-token")
          localStorage.removeItem("ttv-token-expires-in")
          localStorage.removeItem("ttv-username")
          dispatch({
            type: "user",
            payload: {
              username: null,
              token: null,
              expires_in: null,
            },
          })
          throw new Error(
            "You need to re-authenticate with twitch before you can search for games."
          )
        }

        setGames(data)

        return
      }
      throw new Error(
        "Please make sure the input field is not empty or try again later."
      )
    } catch (error) {
      console.error(error)
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post("http://localhost:3001/game/add", {
        games: selectedGames,
        username: state.user.username,
      })
      dispatch({
        type: "toastr",
        payload: {
          message:
            data.map((game) => `"${game}"`).join(", ") +
            "has been added to the suggested games list successfully!",
          type: "success",
          isVisible: true,
        },
      })
      dispatch({
        type: "isBacklog",
        payload: false,
      })
      setGames([])
      setSelectedGames([])
      setSearchText("")
      forceFetchCall()
    } catch (error) {
      dispatch({
        type: "toastr",
        payload: {
          message:
            error["response"]["data"]["message"] ||
            "There was an error adding your game(s). Please try again later.",
          type: "error",
          isVisible: true,
        },
      })
    }
  }

  const selectGameHandler = (game) => {
    if (selectedGames.find((g) => g.name === game.name)) {
      return setSelectedGames((prev) =>
        prev.filter((g) => g.name !== game.name)
      )
    }

    setSelectedGames((prev) => [...prev, game])
  }

  return (
    <div
      className="modal fade pixel-font modal-md"
      id="addGameModal"
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
        <div className="modal-content border border-dark">
          <div className="modal-header border-dark">
            <h5 className="modal-title text-uppercase">Add a game</h5>
            <button
              type="button"
              className="btn ms-auto fs-5"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              X
            </button>
          </div>
          <div className="modal-body text-uppercase h-50 overflow-y-auto">
            <form onSubmit={onSearchHandler}>
              <div className="input-group input-group-sm mb-3 border border-dark border-2 rounded-0">
                <span className="input-group-text bi-search border-0 bg-transparent fs-5" />
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  type="search"
                  className="form-control rounded-0 border-0 bg-transparent text-uppercase fs-6"
                  placeholder="Search..."
                />
              </div>
            </form>
            <button
              type="button"
              className="btn btn-sm text-uppercase p-0 mb-2 border-0"
              onClick={() => setGames(selectedGames)}
              disabled={selectedGames.length === 0}
            >
              My Games Selected ({selectedGames.length})
            </button>
            <div className="border-top pt-2">
              {games.length === 0 ? (
                <p>Start by searching for games</p>
              ) : (
                games.map(({ name, image }, i) => (
                  <div
                    className="d-flex flex-row gap-3 py-2"
                    key={`${name}-game-item-${i}`}
                  >
                    <input
                      className="form-check-input border border-2 border-dark rounded-0"
                      type="checkbox"
                      checked={!!selectedGames.find((g) => g.name === name)}
                      onChange={() => selectGameHandler({ name, image })}
                    />
                    <img
                      src={image}
                      alt={`Game thumbnail for ${name}`}
                      width="100px"
                    />
                    <h6 className="mb-0">{name}</h6>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="modal-footer border-dark">
            {!state.user.token ? (
              <button
                type="button"
                className="btn text-uppercase fs-6 w-100"
                onClick={onSubmitHandler}
              >
                Click here to login with twitch
              </button>
            ) : (
              <button
                type="button"
                className="btn text-uppercase fs-6 w-100"
                onClick={onSubmitHandler}
                disabled={selectedGames.length === 0}
              >
                Add selected games ({selectedGames.length})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddGameModal
