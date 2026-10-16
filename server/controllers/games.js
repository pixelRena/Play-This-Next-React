const handleGames = async (req, res, docs) => {
  // Todo: Change this to only one const that orders by next then displays the rest
  const nextStatusQuery = docs.where("status", "==", "next")
  const otherStatusQuery = docs.where("status", "!=", "next")
  let gamesInDB = []

  await nextStatusQuery.get().then((snapshot) => {
    snapshot.forEach((snap) => gamesInDB.push(snap.data()))
  })

  await otherStatusQuery.get().then((snapshot) => {
    snapshot.forEach((snap) => gamesInDB.push(snap.data()))
  })

  return res.send(gamesInDB)
}

const handleBacklogGames = async (req, res, backlogDB) => {
  let gamesInDB = []

  await backlogDB.get().then((snapshot) => {
    snapshot.forEach((snap) => gamesInDB.push(snap.data()))
  })
  res.send(gamesInDB)
}

// Todo: verify functionality after enabling voting
const handleGameVote = async (req, res, db) => {
  let { name, voteCount, username, isUserVoter } = req.body
  const gameDocument = db.collection("suggested").doc(name)
  const gameData = await gameDocument.get()
  let updatedVoters

  if (gameData.data().voters) {
    updatedVoters = isUserVoter
      ? gameData.data().voters.filter((v) => v !== username)
      : [...gameData.data().voters, username]
  } else {
    updatedVoters = [username]
  }

  try {
    await gameDocument.update({
      voteCount: isUserVoter ? voteCount - 1 : voteCount + 1,
      voters: updatedVoters,
    })
    res.status(200).send("Vote updated successfully")
  } catch (e) {
    res.status(500).send(e)
  }
}

// Most games one user can have waiting in the queue at once. Slots free up when
// a game is played, declined or removed. The owner is exempt.
const MAX_QUEUED_PER_USER = Number(process.env.MAX_QUEUED_PER_USER) || 3

class AddGameError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// Set LIMIT_OWNER=true to apply the queue limit to the owner too (for testing)
const OWNER_EXEMPT = process.env.LIMIT_OWNER !== "true"

const removeSlashes = (name) => name.replace(/\//g, "")

const handleAddGame = async (req, res, docs, backlogDB) => {
  // Identity comes from the verified token, not the request body
  const { id: userId, login: username } = req.twitchUser
  const isOwner = req.twitchUser.isOwner && OWNER_EXEMPT

  try {
    if (!Array.isArray(req.body?.games) || req.body.games.length === 0) {
      throw new AddGameError(400, "Select at least one game to add.")
    }

    // Clean names and drop repeats within the same request
    const unique = new Map()
    for (const game of req.body.games) {
      if (typeof game?.name !== "string") {
        throw new AddGameError(400, "Each game needs a name.")
      }
      const name = removeSlashes(game.name).trim()
      if (name) unique.set(name, { name, image: game.image })
    }
    const newGames = [...unique.values()]
    if (newGames.length === 0) {
      throw new AddGameError(400, "Each game needs a name.")
    }
    if (!isOwner && newGames.length > MAX_QUEUED_PER_USER) {
      throw new AddGameError(
        403,
        `You can only add up to ${MAX_QUEUED_PER_USER} games at a time.`
      )
    }

    // Count, duplicate checks and writes share one transaction so two
    // simultaneous requests can't both slip past the limit or a duplicate
    await docs.firestore.runTransaction(async (tx) => {
      // Firestore requires every read to happen before the first write
      const queued = isOwner
        ? null
        : await tx.get(
            docs.where("user_id", "==", userId).where("status", "==", "queue")
          )
      const checks = await Promise.all(
        newGames.map(async ({ name }) => {
          const [suggested, backlog] = await Promise.all([
            tx.get(docs.where("name", "==", name)),
            tx.get(backlogDB.where("name", "==", name)),
          ])
          return { name, exists: !suggested.empty || !backlog.empty }
        })
      )

      const duplicates = checks.filter((c) => c.exists).map((c) => c.name)
      if (duplicates.length) {
        throw new AddGameError(
          406,
          `"${duplicates.join(
            ", "
          )}" is already on the suggested or backlog list. Please remove them and search for different games.`
        )
      }

      if (queued) {
        const slotsLeft = MAX_QUEUED_PER_USER - queued.size
        if (newGames.length > slotsLeft) {
          throw new AddGameError(
            403,
            slotsLeft <= 0
              ? `You already have ${queued.size} of ${MAX_QUEUED_PER_USER} games in the queue. Wait for one to be played or remove one to add another.`
              : `You only have ${slotsLeft} of ${MAX_QUEUED_PER_USER} queue slots left, but selected ${newGames.length}.`
          )
        }
      }

      newGames.forEach(({ name, image }) => {
        tx.set(docs.doc(name), {
          username,
          user_id: userId,
          name,
          image,
          status: "queue",
          created_at: new Date(),
        })
      })
    })

    res.send(newGames.map((g) => g.name))
  } catch (e) {
    if (e instanceof AddGameError) {
      return res.status(e.status).json({ message: e.message })
    }
    console.error(e)
    res.status(500).json({ message: "Unable to add games. Please try again." })
  }
}

// Deletes by game name (guarded by twitch.requireUser). The owner can delete
// anything. With allowAdder, the user who added a game can delete it while it
// is still queued. Games without a user_id are owner-only.
const handleDeleteGame = async (req, res, collection, { allowAdder } = {}) => {
  const { name } = req.query
  const { id: userId, isOwner } = req.twitchUser
  if (!name) return res.status(400).send("Game name is required")

  try {
    const snapshot = await collection.where("name", "==", name).get()
    if (snapshot.empty) return res.status(404).send("Game not found")

    const isAllowed = (snap) => {
      if (isOwner) return true
      const { user_id, status } = snap.data()
      return (
        !!allowAdder &&
        !!user_id &&
        user_id === userId &&
        String(status).toLowerCase() === "queue"
      )
    }
    if (!snapshot.docs.every(isAllowed)) {
      return res.status(403).send("Not allowed to delete this game")
    }

    await Promise.all(snapshot.docs.map((snap) => snap.ref.delete()))
    res.status(200).send(`Deleted "${name}"`)
  } catch (e) {
    res.status(500).send("Unable to delete game")
  }
}

module.exports = {
  handleDeleteGame,
  handleGames,
  handleBacklogGames,
  handleGameVote,
  handleAddGame,
  MAX_QUEUED_PER_USER,
}
