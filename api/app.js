require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const playerRoute = require("./routes/playerRoute");
const scoresRoute = require("./routes/scoresRoute");
const dayWeekRoute = require("./routes/dayWeekRoute")


const app = express();

mongoose.connect("mongodb://localhost/leaderboard", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cors());

app.use(scoresRoute);
app.use(playerRoute);
app.use(dayWeekRoute)



app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}`);
});

module.exports = app;
