const express = require("express")
const axios = require("axios")
const firebase = require("firebase-admin")
const path = require("path")
const cors = require("cors")
const dotenv = require("dotenv")
dotenv.config()

// var serviceAccount = require("./serenuy.json");
firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: JSON.parse(process.env.FIREBASE_PRIVATE_KEY),
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    token_uri: "https://oauth2.googleapis.com/token",
  }),
})

const db = firebase.firestore()
// Firebase collections:
const steamDB = db.collection("steam")
const docs = db.collection("suggested")

const app = express()

app.use(cors())
app.use(express.json())

// Gets results from search input of adding a game
app.get("/search-games", async (req, res) => {
  const { name, token } = req.query

  try {
    const { data } = await axios.get(
      `https://api.twitch.tv/helix/search/categories?query=${name}`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${token}`,
        },
      }
    )
    let dataReceived = data["data"]
    let dataArr = []
    dataReceived.map(({ name, box_art_url }) =>
      dataArr.push({
        name: name,
        image: box_art_url.replace("52x72", "150x200"),
      })
    )
    res.send(dataArr)
  } catch (e) {
    // Todo: Account for if token needs to be re-validated
    res.send(e)
  }
})

// Fetches steam games
app.get("/steam-games", async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" +
        process.env.STEAM_WEB_API_KEY +
        "&steamid=" +
        process.env.STEAM_ID +
        "&include_appinfo=true&format=json"
    )
    res.send(data.response)
  } catch (error) {
    console.log(error)
    res.send(error)
  }
})

// Fetches steam games stored in firebase DB
app.get("/steam-games-collection", async (req, res) => {
  let gamesInDB = []

  await steamDB.get().then((snapshot) => {
    snapshot.forEach((snap) => gamesInDB.push(snap.data()))
  })

  res.send(gamesInDB)
})

// Updates steam games in firebase DB
app.post("/seed-steam-games", async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" +
        process.env.STEAM_WEB_API_KEY +
        "&steamid=" +
        process.env.STEAM_ID +
        "&include_appinfo=true&format=json"
    )

    data["response"]["games"].map(({ appid, img_icon_url, name }) => {
      steamDB.doc(String(appid)).set({
        appid,
        name,
        image:
          "http://media.steampowered.com/steamcommunity/public/images/apps/" +
          appid +
          "/" +
          img_icon_url +
          ".jpg",
      })
    })

    res.status(500)
  } catch (e) {
    res.status(404).send("error")
  }
})

// Gets the suggested games from firebase DB
app.get("/suggested-games-collection", async (req, res) => {
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

  res.send(gamesInDB)
})

// Adds new suggested game to firebase DB
app.post("/add-suggested-game", async (req, res) => {
  const { games, username } = req.body
  let suggestedCollection = db.collection("suggested")
  let gamesAdded = []

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
    let nameQuery = await suggestedCollection.where("name", "==", name).get()

    // If game doesn't exist in collection, add the game
    if (nameQuery.empty) {
      gamesAdded.push(name)
      suggestedCollection.doc(String(name)).set({
        username: username || "User not provided",
        name,
        image,
        status: "queue",
      })
    }
  })

  Promise.all(promises).then(() => {
    // If game(s) are already on the list
    if (!gamesAdded.length) {
      res.status(406).json({
        message:
          "Game(s) selected are already on the list. Please remove them and search for different games.",
      })
    } else {
      res.send(gamesAdded)
    }
  })
})

app.post("/update-username", async (req, res) => {
  const { newUsername, oldUsername } = req.body

  const querySnapshot = await docs.where("username", "==", oldUsername).get()

  if (!oldUsername || querySnapshot.empty)
    return res.status(404).send("No username found")

  const updatePromises = querySnapshot.docs.map(async (snapshot) => {
    const docRef = snapshot.ref

    await docRef.update({
      username: newUsername,
      image: snapshot.get("image"),
      name: snapshot.get("name"),
      status: snapshot.get("status"),
    })
  })

  await Promise.all(updatePromises)

  res.status(200)
})

app.get("/callback-oauth", async (req, res) => {
  const { access_token } = req.query

  try {
    const userResponse = await axios.get("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Client-ID": process.env.TWITCH_CLIENT_ID,
      },
    })

    const validateToken = await axios.get(
      "https://id.twitch.tv/oauth2/validate",
      {
        headers: {
          Authorization: `OAuth ${access_token}`,
        },
      }
    )

    res.status(200).json({
      twitchUsername: userResponse.data.data[0].login,
      expires_in: validateToken["data"]["expires_in"],
    })
  } catch (error) {
    res.status(404).send("Unable to fetch twitch username. Try again later.")
  }
})

app.use(express.static(path.join(__dirname, "../frontend/build")))

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"))
)

app.listen(process.env.PORT || 3000, () => {
  console.log("listening on port.." + process.env.PORT)
})
