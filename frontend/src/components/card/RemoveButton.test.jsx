// Renders the real cards with the real store, as different kinds of visitors,
// and checks which "Remove" buttons show up. Only the network is faked.
jest.mock("axios", () => ({ get: jest.fn(), post: jest.fn(), delete: jest.fn() }))

const GAMES = [
  { name: "My Queued Game", user_id: "111", status: "queue", username: "player" },
  { name: "My Current Game", user_id: "111", status: "next", username: "player" },
  { name: "Their Game", user_id: "222", status: "queue", username: "other" },
  { name: "Legacy Game", status: "queue", username: "old" },
]

const PLAYER_AUTH = {
  twitchUsername: "player",
  expires_in: 1000,
  isOwner: false,
  userId: "111",
}

const LOGGED_IN = {
  "ttv-username": "player",
  "ttv-token": "tok",
  "ttv-token-expires-in": "1000",
  "ttv-is-owner": "false",
  "ttv-user-id": "111",
}

const FRESH_LOGIN_HASH = "#access_token=abc123&scope=user_read&token_type=bearer"

const cleanups = []
afterEach(() => {
  while (cleanups.length) cleanups.pop()()
})

// The store reads localStorage when it is first imported, so every render
// starts from a fresh module registry with the storage already set up.
// (/pure: the default entry registers its own hooks, which can't happen
// once a test is running.)
const renderCard = async ({
  card = "desktop",
  storage = {},
  hash = "",
  auth = PLAYER_AUTH,
  authFails = false,
  authRejects = false,
} = {}) => {
  jest.resetModules()
  localStorage.clear()
  Object.entries(storage).forEach(([key, value]) =>
    localStorage.setItem(key, value)
  )
  window.location.hash = hash

  const axios = require("axios")
  axios.get.mockImplementation(async (url) => {
    if (url.includes("/auth")) {
      if (authFails) throw new Error("auth failed") // offline / server down
      if (authRejects) {
        // server answered: token expired or invalid
        throw Object.assign(new Error("rejected"), { response: { status: 404 } })
      }
      return { data: auth }
    }
    if (url.endsWith("/games/backlog")) return { data: [] }
    return { data: GAMES }
  })

  const { render, screen, cleanup, waitFor } = require("@testing-library/react/pure")
  const { StoreProvider } = require("../../context/Store.context.jsx")
  const Card =
    card === "desktop"
      ? require("./DesktopCard").default
      : require("../../mobile/components/card/MobileCard").default

  cleanups.push(cleanup)
  render(
    <StoreProvider>
      <Card />
    </StoreProvider>
  )
  // Wait for the games to load
  await screen.findByText("My Queued Game")
  return { screen, waitFor }
}

const removeLabels = (screen) =>
  screen
    .queryAllByRole("button", { name: /^remove /i })
    .map((button) => button.getAttribute("aria-label"))

describe.each(["desktop", "mobile"])("%s card remove buttons", (card) => {
  test("a logged out visitor sees no remove buttons", async () => {
    const { screen } = await renderCard({ card })
    expect(removeLabels(screen)).toEqual([])
  })

  test("a logged in player sees Remove only on their own queued game", async () => {
    const { screen } = await renderCard({ card, storage: LOGGED_IN })
    expect(removeLabels(screen)).toEqual(["Remove My Queued Game"])
  })

  test("a session saved before userId existed still gets the button", async () => {
    // Logged in while the server did not send userId: storage holds "undefined"
    const { screen, waitFor } = await renderCard({
      card,
      storage: { ...LOGGED_IN, "ttv-user-id": "undefined" },
    })
    await waitFor(() =>
      expect(removeLabels(screen)).toEqual(["Remove My Queued Game"])
    )
  })

  test("a session saved with no userId at all still gets the button", async () => {
    const withoutUserId = { ...LOGGED_IN }
    delete withoutUserId["ttv-user-id"]
    const { screen, waitFor } = await renderCard({
      card,
      storage: withoutUserId,
    })
    await waitFor(() =>
      expect(removeLabels(screen)).toEqual(["Remove My Queued Game"])
    )
  })

  test("a fresh login redirect (token in the URL) shows the button", async () => {
    const { screen, waitFor } = await renderCard({ card, hash: FRESH_LOGIN_HASH })
    await waitFor(() =>
      expect(removeLabels(screen)).toEqual(["Remove My Queued Game"])
    )
  })

  test("a fresh login saves the userId for the next visit", async () => {
    const { waitFor } = await renderCard({ card, hash: FRESH_LOGIN_HASH })
    await waitFor(() => expect(localStorage.getItem("ttv-user-id")).toBe("111"))
  })

  test("if the server does not send userId, the text 'undefined' is not stored", async () => {
    const authWithoutUserId = { ...PLAYER_AUTH }
    delete authWithoutUserId.userId
    const { waitFor } = await renderCard({
      card,
      hash: FRESH_LOGIN_HASH,
      auth: authWithoutUserId,
    })
    await waitFor(() => expect(localStorage.getItem("ttv-username")).toBe("player"))
    expect(localStorage.getItem("ttv-user-id")).not.toBe("undefined")
  })

  test("the stored userId keeps working if the auth refresh fails", async () => {
    const { screen } = await renderCard({
      card,
      storage: LOGGED_IN,
      authFails: true,
    })
    expect(removeLabels(screen)).toEqual(["Remove My Queued Game"])
  })

  test("an expired login (no saved userId) is logged out instead of silently stuck", async () => {
    // Logged in before userId existed, and the twitch token has since expired
    const withoutUserId = { ...LOGGED_IN }
    delete withoutUserId["ttv-user-id"]
    const { screen, waitFor } = await renderCard({
      card,
      storage: withoutUserId,
      authRejects: true,
    })
    await waitFor(() => expect(localStorage.getItem("ttv-token")).toBeNull())
    expect(localStorage.getItem("ttv-username")).toBeNull()
    expect(removeLabels(screen)).toEqual([])
  })

  test("a fresh login removes the token from the address bar", async () => {
    const { waitFor } = await renderCard({ card, hash: FRESH_LOGIN_HASH })
    await waitFor(() => expect(localStorage.getItem("ttv-user-id")).toBe("111"))
    await waitFor(() => expect(window.location.hash).toBe(""))
  })

  test("the owner sees Remove on every game", async () => {
    const { screen } = await renderCard({
      card,
      storage: { ...LOGGED_IN, "ttv-is-owner": "true", "ttv-user-id": "1" },
      auth: { ...PLAYER_AUTH, isOwner: true, userId: "1" },
    })
    expect(removeLabels(screen)).toHaveLength(GAMES.length)
  })
})
