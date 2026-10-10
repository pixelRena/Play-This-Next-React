jest.mock("axios", () => ({ get: jest.fn(), post: jest.fn(), delete: jest.fn() }))

const LOGGED_IN = {
  "ttv-username": "player",
  "ttv-token": "tok",
  "ttv-token-expires-in": "1000",
  "ttv-is-owner": "true",
  "ttv-user-id": "111",
}

test("logging out clears the saved login and the logged in state", async () => {
  jest.resetModules()
  localStorage.clear()
  Object.entries(LOGGED_IN).forEach(([key, value]) =>
    localStorage.setItem(key, value)
  )
  window.location.hash = ""

  const axios = require("axios")
  // The background refresh succeeds, so the session starts out valid
  axios.get.mockResolvedValue({
    data: { twitchUsername: "player", expires_in: 1000, isOwner: true, userId: "111" },
  })

  const { render, screen, fireEvent, waitFor, cleanup } = require("@testing-library/react/pure")
  const { useContext } = require("react")
  const { Store, StoreProvider } = require("./Store.context.jsx")

  const Probe = () => {
    const { state, logout } = useContext(Store)
    return (
      <>
        <div data-testid="who">{state.user.username || "nobody"}</div>
        <div data-testid="owner">{String(state.user.isOwner)}</div>
        <button onClick={logout}>Log out</button>
      </>
    )
  }

  render(
    <StoreProvider>
      <Probe />
    </StoreProvider>
  )
  expect(screen.getByTestId("who")).toHaveTextContent("player")

  fireEvent.click(screen.getByRole("button", { name: "Log out" }))

  await waitFor(() => expect(screen.getByTestId("who")).toHaveTextContent("nobody"))
  expect(screen.getByTestId("owner")).toHaveTextContent("false")
  for (const key of Object.keys(LOGGED_IN)) {
    expect(localStorage.getItem(key)).toBeNull()
  }
  cleanup()
})
