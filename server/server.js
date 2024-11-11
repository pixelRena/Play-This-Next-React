const express = require("express")
const firebase = require("firebase-admin")
const cors = require("cors")
const dotenv = require("dotenv")
const games = require("./controllers/games")
const twitch = require("./controllers/twitch")
dotenv.config()

// var serviceAccount = require("./serenuy.json");
firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: JSON.parse(process.env.FIREBASE_PRIVATE_KEY),
    // privateKey: process.env.FIREBASE_PRIVATE_KEY,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    token_uri: "https://oauth2.googleapis.com/token",
  }),
})

const db = firebase.firestore()
// Firebase collections:
const docs = db.collection("suggested")
const backlogDB = db.collection("backlog")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/games/backlog", (req, res) => {
  games.handleBacklogGames(req, res, backlogDB)
})

// Gets results from search input of adding a game
app.get("/games/search", async (req, res) => {
  twitch.handleSearch(req, res)
})

// Gets the suggested games from firebase DB
app.get("/games", (req, res) => {
  games.handleGames(req, res, docs)
})

// Adds new suggested game(s) to firebase DB
app.post("/game/add", (req, res) => {
  games.handleAddGame(req, res, docs, backlogDB)
})

// Update the vote count of a suggested game in firebase DB
// Todo: replace with id usage
// app.put("/game/vote", (req, res) => {
//   games.handleGameVote(req, res, db)
// })

// Updates username in DB
// app.post("/update-username", async (req, res) => {
//   const { newUsername, oldUsername } = req.body

//   const querySnapshot = await docs.where("username", "==", oldUsername).get()

//   if (!oldUsername || querySnapshot.empty)
//     return res.status(404).send("No username found")

//   const updatePromises = querySnapshot.docs.map(async (snapshot) => {
//     const docRef = snapshot.ref

//     await docRef.update({
//       username: newUsername,
//       image: snapshot.get("image"),
//       name: snapshot.get("name"),
//       status: snapshot.get("status"),
//     })
//   })

//   await Promise.all(updatePromises)

//   res.status(200)
// })

app.get("/auth", (req, res) => {
  twitch.handleAuth(req, res)
})

app.get("/", (req, res) => {
  res.send("HOSTING")
})

app.listen(process.env.PORT || 3001, () => {
  console.log("listening on port.. 3001")
})
