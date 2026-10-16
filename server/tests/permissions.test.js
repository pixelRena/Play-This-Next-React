// Run with `npm test` (node's built-in test runner, no extra dependencies).
// Covers who may add and delete games, and the data /auth hands the frontend.
const { test, describe, beforeEach, afterEach, mock } = require("node:test")
const assert = require("node:assert/strict")

process.env.TWITCH_CLIENT_ID = "test-client-id"
process.env.TWITCH_OWNER_ID = "1"

const axios = require("axios")
const twitch = require("../controllers/twitch")
const games = require("../controllers/games")

const OWNER = { user_id: "1", login: "owner", client_id: "test-client-id" }
const PLAYER = { user_id: "111", login: "player", client_id: "test-client-id" }

// Pretend to be Twitch: /oauth2/validate answers according to the bearer token
const mockTwitch = (tokens) =>
  mock.method(axios, "get", async (url, { headers }) => {
    const token = headers.Authorization.replace(/^(OAuth|Bearer) /, "")
    const identity = tokens[token]
    if (!identity) throw new Error("401 from twitch")
    if (url.includes("/oauth2/validate")) {
      return { data: { ...identity, expires_in: 1000 } }
    }
    if (url.includes("/helix/users")) {
      return { data: { data: [{ login: identity.login, id: identity.user_id }] } }
    }
    throw new Error(`unexpected url ${url}`)
  })

// Minimal Express response that resolves once the handler has replied
const makeRes = () => {
  let finish
  const done = new Promise((resolve) => (finish = resolve))
  const res = {
    statusCode: 200,
    body: undefined,
    done,
    status(code) {
      res.statusCode = code
      return res
    },
    send(body) {
      res.body = body
      finish()
      return res
    },
    json(body) {
      return res.send(body)
    },
  }
  return res
}

// A query over some matching docs; chained where() calls narrow it further
const query = (matches) => ({
  where: (field, op, value) =>
    query(matches.filter((d) => d.data()[field] === value)),
  get: async () => ({
    empty: matches.length === 0,
    size: matches.length,
    docs: matches,
  }),
})

// Stand-in for a Firestore collection holding the given documents
const makeCollection = (items) => {
  const deleted = []
  const saved = []
  const docs = items.map((item) => ({
    data: () => item,
    ref: { delete: async () => deleted.push(item.name) },
  }))
  const collection = {
    deleted,
    saved,
    where: (field, op, value) => query(docs.filter((d) => d.data()[field] === value)),
    doc: () => ({ set: (obj) => saved.push(obj) }),
    // Enough of Firestore's runTransaction for the add handler
    firestore: {
      runTransaction: async (fn) => {
        const staged = []
        await fn({
          get: (q) => q.get(),
          set: (ref, obj) => staged.push(() => ref.set(obj)),
        })
        staged.forEach((write) => write())
      },
    },
  }
  return collection
}

const runDelete = async ({ items, name, user, allowAdder = true }) => {
  const collection = makeCollection(items)
  const res = makeRes()
  const req = { query: { name }, twitchUser: user }
  await games.handleDeleteGame(req, res, collection, { allowAdder })
  return { res, collection }
}

afterEach(() => mock.restoreAll())

describe("deleting games", () => {
  const items = [
    { name: "Mine", user_id: "111", status: "queue" },
    { name: "Mine Playing", user_id: "111", status: "current" },
    { name: "Theirs", user_id: "222", status: "queue" },
    { name: "Legacy", status: "queue" },
  ]
  const player = { id: "111", login: "player", isOwner: false }
  const owner = { id: "1", login: "owner", isOwner: true }

  test("a user can delete their own queued game", async () => {
    const { res, collection } = await runDelete({ items, name: "Mine", user: player })
    assert.equal(res.statusCode, 200)
    assert.deepEqual(collection.deleted, ["Mine"])
  })

  test("a user cannot delete their own game once it is no longer queued", async () => {
    const { res, collection } = await runDelete({ items, name: "Mine Playing", user: player })
    assert.equal(res.statusCode, 403)
    assert.deepEqual(collection.deleted, [])
  })

  test("a user cannot delete someone else's game", async () => {
    const { res, collection } = await runDelete({ items, name: "Theirs", user: player })
    assert.equal(res.statusCode, 403)
    assert.deepEqual(collection.deleted, [])
  })

  test("a game without a user_id is owner-only", async () => {
    const { res } = await runDelete({ items, name: "Legacy", user: player })
    assert.equal(res.statusCode, 403)
  })

  test("a user cannot delete from the backlog even if they added the game", async () => {
    const { res } = await runDelete({ items, name: "Mine", user: player, allowAdder: false })
    assert.equal(res.statusCode, 403)
  })

  test("the owner can delete anything, including non-queued and legacy games", async () => {
    for (const name of ["Mine Playing", "Theirs", "Legacy"]) {
      const { res, collection } = await runDelete({ items, name, user: owner })
      assert.equal(res.statusCode, 200, name)
      assert.deepEqual(collection.deleted, [name])
    }
  })

  test("missing name is a 400 and an unknown game is a 404", async () => {
    assert.equal((await runDelete({ items, name: "", user: owner })).res.statusCode, 400)
    assert.equal((await runDelete({ items, name: "Nope", user: owner })).res.statusCode, 404)
  })
})

describe("requireUser middleware", () => {
  const run = async (authorization) => {
    const req = { headers: authorization ? { authorization } : {} }
    const res = makeRes()
    let nextCalled = false
    await twitch.requireUser(req, res, () => (nextCalled = true))
    return { req, res, nextCalled }
  }

  test("rejects a request without a token", async () => {
    mockTwitch({})
    const { res, nextCalled } = await run()
    assert.equal(res.statusCode, 401)
    assert.equal(nextCalled, false)
  })

  test("rejects a token twitch does not recognise", async () => {
    mockTwitch({})
    const { res, nextCalled } = await run("Bearer nope")
    assert.equal(res.statusCode, 401)
    assert.equal(nextCalled, false)
  })

  test("rejects a token issued to a different twitch app", async () => {
    mockTwitch({ abc: { ...PLAYER, client_id: "someone-elses-app" } })
    const { res, nextCalled } = await run("Bearer abc")
    assert.equal(res.statusCode, 401)
    assert.equal(nextCalled, false)
  })

  test("identifies a normal user from the token, not the request", async () => {
    mockTwitch({ abc: PLAYER })
    const { req, nextCalled } = await run("Bearer abc")
    assert.equal(nextCalled, true)
    assert.deepEqual(req.twitchUser, { id: "111", login: "player", isOwner: false })
  })

  test("flags the owner by their twitch user id", async () => {
    mockTwitch({ abc: OWNER })
    const { req } = await run("Bearer abc")
    assert.equal(req.twitchUser.isOwner, true)
  })
})

describe("/auth response (what the frontend relies on to show buttons)", () => {
  const callAuth = async (token) => {
    const res = makeRes()
    await twitch.handleAuth({ query: { access_token: token } }, res)
    return res
  }

  test("returns username, userId and isOwner for a normal user", async () => {
    mockTwitch({ abc: PLAYER })
    const res = await callAuth("abc")
    assert.equal(res.statusCode, 200)
    assert.equal(res.body.twitchUsername, "player")
    assert.equal(res.body.userId, "111")
    assert.equal(res.body.isOwner, false)
  })

  test("userId is a string, matching the user_id stored on games", async () => {
    mockTwitch({ abc: PLAYER })
    assert.equal(typeof (await callAuth("abc")).body.userId, "string")
  })

  test("isOwner is true for the owner", async () => {
    mockTwitch({ abc: OWNER })
    assert.equal((await callAuth("abc")).body.isOwner, true)
  })
})

describe("adding games", () => {
  test("stores the verified user_id and login, ignoring any username in the body", async () => {
    const suggested = makeCollection([])
    const backlog = makeCollection([])
    const res = makeRes()
    const req = {
      body: { games: [{ name: "Hades", image: "img" }], username: "someone-else" },
      twitchUser: { id: "111", login: "player", isOwner: false },
    }
    games.handleAddGame(req, res, suggested, backlog)
    await res.done

    assert.equal(suggested.saved.length, 1)
    assert.equal(suggested.saved[0].user_id, "111")
    assert.equal(suggested.saved[0].username, "player")
    assert.equal(suggested.saved[0].status, "queue")
  })

  const add = async ({ names, queued = 0, user, backlog = [] }) => {
    const suggested = makeCollection(
      Array.from({ length: queued }, (_, i) => ({
        name: `Queued ${i}`,
        user_id: "111",
        status: "queue",
      }))
    )
    const res = makeRes()
    const req = {
      body: { games: names.map((name) => ({ name, image: "img" })) },
      twitchUser: user || { id: "111", login: "player", isOwner: false },
    }
    games.handleAddGame(req, res, suggested, makeCollection(backlog))
    await res.done
    return { res, suggested }
  }

  test("allows adding up to the per-user queue limit", async () => {
    const { res, suggested } = await add({ names: ["A", "B"], queued: 1 })
    assert.equal(res.statusCode, 200)
    assert.equal(suggested.saved.length, 2)
  })

  test("rejects everything when it would go over the queue limit", async () => {
    const { res, suggested } = await add({ names: ["A", "B"], queued: 2 })
    assert.equal(res.statusCode, 403)
    assert.match(res.body.message, /1 of 3/)
    assert.equal(suggested.saved.length, 0)
  })

  test("says so when the queue is already full", async () => {
    const { res } = await add({ names: ["A"], queued: games.MAX_QUEUED_PER_USER })
    assert.equal(res.statusCode, 403)
    assert.match(res.body.message, /already have/)
  })

  test("only counts the user's queued games, not other statuses or users", async () => {
    const suggested = makeCollection([
      { name: "Done", user_id: "111", status: "completed" },
      { name: "Declined", user_id: "111", status: "declined" },
      { name: "Next", user_id: "111", status: "next" },
      { name: "Theirs 1", user_id: "222", status: "queue" },
      { name: "Theirs 2", user_id: "222", status: "queue" },
      { name: "Theirs 3", user_id: "222", status: "queue" },
    ])
    const res = makeRes()
    games.handleAddGame(
      { body: { games: [{ name: "A" }, { name: "B" }, { name: "C" }] }, twitchUser: { id: "111", login: "player", isOwner: false } },
      res,
      suggested,
      makeCollection([])
    )
    await res.done
    assert.equal(res.statusCode, 200)
  })

  test("the owner is not limited", async () => {
    const { res } = await add({
      names: ["A", "B", "C", "D", "E"],
      queued: 5,
      user: { id: "1", login: "owner", isOwner: true },
    })
    assert.equal(res.statusCode, 200)
  })

  test("repeats within one request are added once", async () => {
    const { res, suggested } = await add({ names: ["A", "A", " A "] })
    assert.equal(res.statusCode, 200)
    assert.equal(suggested.saved.length, 1)
  })

  test("rejects games already on the backlog and saves nothing", async () => {
    const { res, suggested } = await add({
      names: ["A", "B"],
      backlog: [{ name: "B" }],
    })
    assert.equal(res.statusCode, 406)
    assert.equal(suggested.saved.length, 0)
  })

  test("rejects an empty or malformed list", async () => {
    assert.equal((await add({ names: [] })).res.statusCode, 400)
    const res = makeRes()
    games.handleAddGame({ body: {}, twitchUser: { id: "1", login: "x" } }, res, makeCollection([]), makeCollection([]))
    await res.done
    assert.equal(res.statusCode, 400)
  })
})
