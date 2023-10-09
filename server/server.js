const express = require("express");
const axios = require("axios");
const firebase = require("firebase-admin");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// var serviceAccount = require("./firebaseKey.json");
firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: JSON.parse(process.env.FIREBASE_PRIVATE_KEY),
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    token_uri: "https://oauth2.googleapis.com/token",
  }),
});

const db = firebase.firestore();
// Firebase collections:
const steamDB = db.collection("steam");
const docs = db.collection("suggested");

const app = express();

app.use(cors());
app.use(express.json());

// Fetches steam games
app.get("/steam-games", async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" +
        process.env.STEAM_WEB_API_KEY +
        "&steamid=" +
        process.env.STEAM_ID +
        "&include_appinfo=true&format=json"
    );
    res.send(data.response);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// Fetches steam games stored in firebase DB
app.get("/steam-games-collection", async (req, res) => {
  let gamesInDB = [];

  await steamDB.get().then((snapshot) => {
    snapshot.forEach((snap) => gamesInDB.push(snap.data()));
  });

  res.send(gamesInDB);
});

// Updates steam games in firebase DB
app.post("/seed-steam-games", async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=" +
        process.env.STEAM_WEB_API_KEY +
        "&steamid=" +
        process.env.STEAM_ID +
        "&include_appinfo=true&format=json"
    );

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
      });
    });

    res.status(500);
  } catch (e) {
    res.status(404).send("error");
  }
});

// Gets results from search input of adding a game
app.get("/search-games", async (req, res) => {
  const { term } = req.query;
  try {
    const { data } = await axios.get(
      `https://api.rawg.io/api/games?search=${term}&key=${process.env.RAWG_API_KEY}`,
      { headers: { "Accept-Encoding": "gzip,deflate,compress" } }
    );
    let dataReceived = data.results;
    let dataArr = [];
    dataReceived.map(({ name, released, background_image }) =>
      dataArr.push({
        name: name,
        released: released,
        image: background_image,
      })
    );
    res.send(dataArr);
  } catch (error) {
    res.send(error);
  }
});

// Gets the suggested games from firebase DB
app.get("/suggested-games-collection", async (req, res) => {
  const nextStatusQuery = docs.where("status", "==", "next").orderBy("next");
  const otherStatusQuery = docs.where("status", "!=", "next");
  let gamesInDB = [];

  await nextStatusQuery.get().then((snapshot) => {
    snapshot.forEach((snap) => gamesInDB.push(snap.data()));
  });

  await otherStatusQuery.get().then((snapshot) => {
    snapshot.forEach((snap) => gamesInDB.push(snap.data()));
  });

  res.send(gamesInDB);
});

// Adds new suggested game to firebase DB
app.post("/add-suggested-game", async (req, res) => {
  const { games, username } = req.body;
  let suggestedCollection = db.collection("suggested");
  let gamesAdded = [];

  const promises = games.map(async ({ name, image }) => {
    // Check for duplications
    let nameQuery = await suggestedCollection.where("name", "==", name).get();

    // If game doesn't exist in collection, add the game
    if (nameQuery.empty) {
      gamesAdded.push(name);
      suggestedCollection.doc(name).set({
        username: username || "User not provided",
        name,
        image,
        status: "queue",
      });
    }
  });

  Promise.all(promises).then(() => {
    // If game(s) are already on the list
    if (!gamesAdded.length) {
      res.status(406).json({
        message:
          "Game(s) selected are already on the list. Please remove them and search for different games.",
      });
    } else {
      res.send(gamesAdded);
    }
  });
});

app.post("/update-username", async (req, res) => {
  const { newUsername, oldUsername } = req.body;

  const querySnapshot = await docs.where("username", "==", oldUsername).get();

  if (!oldUsername || querySnapshot.empty)
    return res.status(200).send("No username found");

  const updatePromises = querySnapshot.docs.map(async (snapshot) => {
    const docRef = snapshot.ref;

    await docRef.update({
      username: newUsername,
      image: snapshot.get("image"),
      name: snapshot.get("name"),
      status: snapshot.get("status"),
    });
  });

  await Promise.all(updatePromises);

  res.status(200);
});

app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"))
);

app.listen(process.env.PORT || 3000, () => {
  console.log("listening on port.." + process.env.PORT);
});
