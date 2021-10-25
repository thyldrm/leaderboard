require('dotenv').config()
const express = require("express");
const Redis = require("ioredis");
const redis = new Redis();
const Player = require("../model/Player");

const router = express.Router();


router.post("/players", async (req, res) => {
    const playerBody = req.body;
    try {
        await redis.zadd(process.env.KEY, 0, playerBody.username);
        const currentRank = await redis.zrevrank(process.env.KEY, playerBody.username);
        await redis.hmset(
            `player:${playerBody.username}`,
            "username",
            playerBody.username,
            "rank",
            currentRank + 1,
            "dailyDiff",
            0
        );
        playerBody.score = 0;
        const player = await Player.create(playerBody);
        res.send({ player });
    } catch (err) {
        res.send(err);
    }
});

router.get("/player/:username",async (req,res)=>{
        const {username}=req.params;
        const user = await Player.findOne({ username: username });
        res.send(user)
})

module.exports = router;
