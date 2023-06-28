const express = require('express');
const axios = require('axios');
const firebase = require("firebase-admin");
const path = require('path');
const cors = require("cors");
const dotenv = require('dotenv');
dotenv.config();

var serviceAccount = require("./firebaseKey.json");
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount
    )
});

const db = firebase.firestore();
// Firebase collections:
const steamDB = db.collection("steam");
const suggestedDB = db.collection("suggested").orderBy("next");
const docs = db.collection("suggested");

const app = express();
const buildPath = path.join(__dirname, 'build')

app.use(cors());
// app.use(express.static(buildPath))
app.use(express.json())

// Fetches steam games
app.get('/steam-games', async (req,res) => {
    try {
        const {data} = await axios.get("https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key="+process.env.STEAM_WEB_API_KEY+"&steamid="+process.env.STEAM_ID+"&include_appinfo=true&format=json");
        res.send(data.response);
    } catch(error) {
        console.log(error);
        res.send(error);
    }
});

// Fetches steam games stored in firebase DB
app.get('/steam-games-collection', async (req,res) => {   
    let gamesInDB = [];

    await steamDB.get()
    .then((snapshot) => {
        snapshot.forEach(snap => gamesInDB.push(snap.data()))
    });
    
    res.send(gamesInDB);
});

// Updates steam games in firebase DB
app.post('/seed-steam-games', async (req,res) => {
    const { gamesList } = req.body;
    let gamesInDB = [];

    gamesList.map(({appid, img_icon_url, name}) => {    
        steamDB.doc(String(appid)).set({
            appid,
            name,
            image: "http://media.steampowered.com/steamcommunity/public/images/apps/"+appid+"/"+img_icon_url+".jpg",
        });
    })
    
    await steamDB.get()
    .then((snapshot) => {
        snapshot.forEach(snap => gamesInDB.push(snap.data()))
    });

    res.send(gamesInDB);
});

// Gets results from search input of adding a game
app.get('/search-games', async (req,res) => {
    const { term } = req.query;
    try {
        const {data} = await axios.get(`https://api.rawg.io/api/games?search=${term}&key=${process.env.RAWG_API_KEY}`, { headers: { "Accept-Encoding": "gzip,deflate,compress" } })
        let dataReceived = data.results;
        let dataArr = [];
        dataReceived.map(({name, released, background_image}) => dataArr.push({
            "name": name, 
            "released": released,
            "image": background_image
        }));
        res.send(dataArr);
    } catch(error) { res.send(error) }
});

// Gets the suggested games from firebase DB
app.get('/suggested-games-collection', async(req,res) => {
    const nextStatusQuery = docs.where("status", "==", "next").orderBy("next");
    const otherStatusQuery = docs.where("status", "!=", "next");
    let gamesInDB = [];

    await nextStatusQuery.get()
    .then((snapshot) => {
        snapshot.forEach(snap => gamesInDB.push(snap.data()))
    });

    await otherStatusQuery.get()
    .then((snapshot) => {
        snapshot.forEach(snap => gamesInDB.push(snap.data()))
    });

    console.log(gamesInDB);
    
    res.send(gamesInDB);
});

// Adds new suggested game to firebase DB
app.post('/add-suggested-game', async (req,res) => {
    const { suggestedGames, username } = req.body;
    let updatedSuggestedGames = db.collection("suggested");
    let gamesInDB = [];

    suggestedGames.map(({name, image}) => {    
        updatedSuggestedGames.doc(name).set({
            username: username || "N/A",
            name,
            image,
            status: "queue",
        });
    });

    await updatedSuggestedGames.get()
    .then((snapshot) => {
        snapshot.forEach(snap => gamesInDB.push(snap.data()))
    });

    res.send(gamesInDB);
});

app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get("*", (req,res) => 
	res.sendFile(path.join(__dirname, '../frontend/build/index.html'))
);

app.listen(process.env.PORT || 3000, () => { console.log("listening on port.."+process.env.PORT)});