const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
    name: String,
    username: {
        type: String,
        unique: true,
        required: true,
    },
    score: {
        type: Number,
    },
    rank: Number,
    dailyDiff: Number,
    country: String,
});

module.exports = mongoose.model("Player", PlayerSchema);
