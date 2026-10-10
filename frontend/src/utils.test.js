import { canDeleteGame } from "./utils"

const me = { token: "tok", isOwner: false, userId: "111" }
const myQueued = { user_id: "111", status: "queue" }

describe("canDeleteGame", () => {
  test("a logged in user can remove their own queued game", () => {
    expect(canDeleteGame(me, myQueued, false)).toBe(true)
  })

  test("status check ignores case", () => {
    expect(canDeleteGame(me, { ...myQueued, status: "Queue" }, false)).toBe(true)
  })

  test.each(["current", "next", "completed", "declined"])(
    "cannot remove their own game once it is %s",
    (status) => {
      expect(canDeleteGame(me, { ...myQueued, status }, false)).toBe(false)
    }
  )

  test("cannot remove someone else's game", () => {
    expect(canDeleteGame(me, { ...myQueued, user_id: "222" }, false)).toBe(false)
  })

  test("cannot remove a game with no user_id", () => {
    expect(canDeleteGame(me, { status: "queue" }, false)).toBe(false)
  })

  test("cannot remove from the backlog", () => {
    expect(canDeleteGame(me, myQueued, true)).toBe(false)
  })

  test("logged out users never see it", () => {
    expect(canDeleteGame({ ...me, token: null }, myQueued, false)).toBe(false)
  })

  test("a user whose userId is missing never sees it", () => {
    expect(canDeleteGame({ ...me, userId: null }, myQueued, false)).toBe(false)
    expect(canDeleteGame({ ...me, userId: undefined }, myQueued, false)).toBe(false)
  })

  test("a numeric userId does not match the string user_id", () => {
    // Twitch ids are strings everywhere; this documents that a type mix-up
    // silently hides the button
    expect(canDeleteGame({ ...me, userId: 111 }, myQueued, false)).toBe(false)
  })

  test("the owner can remove anything, including backlog and non-queued", () => {
    const owner = { token: "tok", isOwner: true, userId: "1" }
    expect(canDeleteGame(owner, { user_id: "222", status: "current" }, false)).toBe(true)
    expect(canDeleteGame(owner, { status: "queue" }, true)).toBe(true)
  })
})
