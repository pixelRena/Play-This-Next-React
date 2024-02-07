const querystring = require("querystring")
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

app.use(
  cors({
    origin: "http://localhost:3001",
  })
)
app.use(express.json())

// var TwitchApi = require("twitch-api")
// var twitch = new TwitchApi({
//   clientId: process.env.TWITCH_CLIENT_ID,
//   clientSecret: process.env.TWITCH_SECRET_ID,
//   redirectUri: "http://localhost:3001",
//   scopes: "user_read",
// })

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

// Gets results from search input of adding a game
app.get("/search-games", async (req, res) => {
  const { term } = req.query
  try {
    const { data } = await axios.get(
      `https://api.rawg.io/api/games?search=${term}&key=${process.env.RAWG_API_KEY}`,
      { headers: { "Accept-Encoding": "gzip,deflate,compress" } }
    )
    let dataReceived = data.results
    let dataArr = []
    dataReceived.map(({ name, released, background_image }) =>
      dataArr.push({
        name: name,
        released: released,
        image: background_image,
      })
    )
    res.send(dataArr)
  } catch (error) {
    res.send(error)
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
    return res.status(200).send("No username found")

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

// Twitch authentication
app.get("/oauth", (req, res) => {
  const scope = "user_read" // Specify the required scope
  console.log("redirecting")
  res.redirect(
    `https://id.twitch.tv/oauth2/authorize?client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URL}&response_type=code&scope=${scope}`
  )
})

// Redirection from Twitch authentication
app.get("/callback", async (req, res) => {
  const { code } = req.query

  const tokenResponse = await axios.post(
    "https://id.twitch.tv/oauth2/token",
    querystring.stringify({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_SECRET_ID,
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.REDIRECT_URL,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  )

  const accessToken = tokenResponse.data.access_token

  // Use the access token to make requests to the Twitch API
  const userResponse = await axios.get("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-ID": process.env.TWITCH_CLIENT_ID,
    },
  })

  const twitchUsername = userResponse.data.data[0].login

  res.status(200).send(twitchUsername)
})

app.use(express.static(path.join(__dirname, "../frontend/build")))

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"))
)

app.listen(process.env.PORT || 3000, () => {
  console.log("listening on port.." + process.env.PORT)
})
