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
    where: (field, op, value) => ({
      get: async () => {
        const matches = docs.filter((d) => d.data()[field] === value)
        return { empty: matches.length === 0, docs: matches }
      },
    }),
    doc: () => ({ set: (obj) => saved.push(obj) }),
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
})
