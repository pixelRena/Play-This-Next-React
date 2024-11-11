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
  const { games, username } = req.body
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
        username: username || "User not provided",
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

module.exports = {
  handleGames,
  handleBacklogGames,
  handleGameVote,
  handleAddGame,
}
