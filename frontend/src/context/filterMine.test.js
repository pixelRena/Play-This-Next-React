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
