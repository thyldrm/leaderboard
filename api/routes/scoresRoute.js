require('dotenv').config()
const express = require("express");
const Redis = require("ioredis");
const redis = new Redis();
const Player = require("../model/Player");

const router = express.Router();


router.post("/scores", async (req, res) => {
    try{
        const { username, score } = req.body;
        const oldScore = await redis.zscore(process.env.KEY, username);
        if (oldScore) {
            const result = await redis.zincrby(process.env.KEY, score, username);
            res.send({ result });
        } else {
            const result = await redis.zadd(process.env.KEY, score, username);
            res.send({ result });
        }
    }catch(err){
        res.send(err)
    }
});

router.get("/scores", async (req, res) => {
    await calculateRanks();
    const players = await redis.zrevrange(process.env.KEY, 0, -1);
    const scores = [];

    for (const player of players) {
        try{
            let score = await redis.zscore(process.env.KEY, player);
            const rank = await redis.zrevrank(process.env.KEY, player);
            const playerRedis = await redis.hgetall("player:" + player);
            const user = await Player.findOne({ username: player });
            score = parseFloat(score).toFixed();
            scores.push({
                rank: rank + 1,
                player,
                score,
                username: user.username,
                country: user.country,
                dailyDiff: playerRedis.dailyDiff,
            });
        }catch(err){
            console.log(err)
        }
    }
    res.send(scores);
});

router.get("/scores/:usernameParam", async (req, res) => {
    const {usernameParam}=req.params;
    await calculateRanks();
    const players = await redis.zrevrange(process.env.KEY, 0, 99);
    const scores = [];

    for (const player of players) {
        try{
            let score = await redis.zscore(process.env.KEY, player);
            const rank = await redis.zrevrank(process.env.KEY, player);
            const playerRedis = await redis.hgetall("player:" + player);
            const user = await Player.findOne({ username: player });
            score = parseFloat(score).toFixed();
            scores.push({
                rank: rank + 1,
                player,
                score,
                username: user.username,
                country: user.country,
                dailyDiff: playerRedis.dailyDiff,
            });
        }catch(err){
            console.log(err)
        }
    }
    
    const paramRank = await redis.zrevrank(process.env.KEY,usernameParam)+1
    const scoresAll=[];
    if((paramRank)>100){
        let min,max;
        if(paramRank<104){
            min=paramRank-2-(104-paramRank);
            max=paramRank+1;
        }else{
            min=paramRank-4;
            max=paramRank+1;
        }
        const paramPlayers = await redis.zrevrange(process.env.KEY,min,max)
        for (const paramPlayer of paramPlayers) {
            try{
                let score = await redis.zscore(process.env.KEY, paramPlayer);
                const rank = await redis.zrevrank(process.env.KEY, paramPlayer);
                const playerRedis = await redis.hgetall("player:" + paramPlayer);
                const user = await Player.findOne({ username: paramPlayer });
                score = parseFloat(score).toFixed();
                scores.push({
                    rank: rank + 1,
                    paramPlayer,
                    score,
                    username: user.username,
                    country: user.country,
                    dailyDiff: playerRedis.dailyDiff,
                });
            }catch(err){
                console.log(err)
            }
        }
        
    }
    scoresAll.push(...scores)
    res.send(scoresAll);
});

const calculateRanks = async () => {
    return redis.keys("player:*").then(async (userKeys) => {
        for (const userKey of userKeys) {
            try {
                const user = await redis.hgetall(userKey);
                const { username, rank } = user;
                let currentRank = await redis.zrevrank(process.env.KEY, username);
                currentRank = currentRank !== null ? currentRank + 1 : null;
                let dailyDiff;
                if (rank) {
                    if (currentRank < rank) {
                        dailyDiff = rank - currentRank;
                    } else if (currentRank > rank) {
                        dailyDiff = rank - currentRank;
                    } else {
                        dailyDiff = 0;
                    }
                } else {
                    dailyDiff = 0;
                }
                await redis.hmset(
                    userKey,
                    "username",
                    username,
                    "rank",
                    rank,
                    "dailyDiff",
                    dailyDiff
                );
            } catch (err) {
                console.log(err);
            }
        }
    });
};

module.exports = router;
