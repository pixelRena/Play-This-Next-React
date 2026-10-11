import { initialState, reducer } from "./Store.utils.jsx"

const games = [
  { name: "A", user_id: "111", status: "queue" },
  { name: "B", user_id: "222", status: "queue" },
  { name: "C", user_id: "111", status: "completed" },
  { name: "D", status: "queue" }, // old game that was never matched to a user
]
const withGames = {
  ...initialState,
  suggested: { ...initialState.suggested, originalData: games, data: games },
}

describe("FILTER_SUGGESTED_MINE", () => {
  it("keeps only the games added by that user id", () => {
    const next = reducer(withGames, {
      type: "FILTER_SUGGESTED_MINE",
      payload: "111",
    })
    expect(next.suggested.data.map((g) => g.name)).toEqual(["A", "C"])
    expect(next.suggested.isFiltered).toBe(true)
  })

  it("shows nothing when there is no user id", () => {
    for (const payload of [null, undefined, ""]) {
      const next = reducer(withGames, { type: "FILTER_SUGGESTED_MINE", payload })
      expect(next.suggested.data).toEqual([])
    }
  })
})

describe("which filter or sort is shown as selected", () => {
  const apply = (state, action) => reducer(state, action).suggested

  it("tracks the filter, and clears it on reset", () => {
    let s = apply(withGames, {
      type: "FILTER_SUGGESTED",
      payload: { status: "queue" },
    })
    expect(s.activeFilter).toBe("queue")
    s = apply({ ...withGames, suggested: s }, {
      type: "FILTER_SUGGESTED_MINE",
      payload: "111",
    })
    expect(s.activeFilter).toBe("mine")
    s = apply({ ...withGames, suggested: s }, {
      type: "RESET_SUGGESTED",
      payload: games,
    })
    expect(s.activeFilter).toBeNull()
  })

  it("a sort replaces the filter and the other way round", () => {
    let s = apply(withGames, { type: "SORT_SUGGESTED", payload: "queue" })
    expect([s.activeSort, s.activeFilter]).toEqual(["queue", null])
    s = apply({ ...withGames, suggested: s }, {
      type: "FILTER_SUGGESTED",
      payload: { status: "next" },
    })
    expect([s.activeSort, s.activeFilter]).toEqual([null, "next"])
  })
})
