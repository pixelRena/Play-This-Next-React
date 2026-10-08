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

const handleAddGame = async (req, res, docs, backlogDB) => {
  const { games } = req.body
  // Identity comes from the verified token, not the request body
  const { id: userId, login: username } = req.twitchUser
  const suggestedCollection = docs
  const backlogCollection = backlogDB
  const gamesAdded = []
  const duplicates = []
  const gamesAddedArray = []

  const removeSlashes = (inputString) => {
    if (inputString.includes("/")) {
      return inputString.replace(/\//g, "")
    } else {
      return inputString
    }
  }

  const promises = games.map(async ({ name, image }) => {
    // Todo: Modify to handle unknown errors
    name = removeSlashes(name)

    // Check for duplications
    const nameQuerySuggested = await suggestedCollection
      .where("name", "==", name)
      .get()
    const nameQueryBacklog = await backlogCollection
      .where("name", "==", name)
      .get()

    // If game doesn't exist in collection, add the game
    if (nameQuerySuggested.empty && nameQueryBacklog.empty) {
      gamesAdded.push(name)
      gamesAddedArray.push({
        username,
        user_id: userId,
        name,
        image,
        status: "queue",
        created_at: new Date(),
      })
    } else {
      duplicates.push(name)
    }
  })

  Promise.all(promises).then(() => {
    // If game(s) are already on the list
    if (!!duplicates.length) {
      res.status(406).json({
        message: `"${duplicates.join(
          ", "
        )}" is already on the suggested or backlog list. Please remove them and search for different games.`,
      })
    } else {
      gamesAddedArray.map((obj) => {
        suggestedCollection.doc(String(obj.name)).set(obj)
      })
      res.send(gamesAdded)
    }
  })
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
}
