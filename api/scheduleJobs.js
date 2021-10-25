require('dotenv').config()
const Redis = require("ioredis");
const nodecron = require("node-cron");
const mongoose = require("mongoose");
const redis = new Redis();
const Player = require("./model/Player");


mongoose.connect("mongodb://localhost/leaderboard", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const endOfDayCalculateRanks = () => {
    redis.keys("player:*").then(async (userKeys) => {
        for (const userKey of userKeys) {
            try {
                const user = await redis.hgetall(userKey);
                const { username } = user;
                let currentRank = await redis.zrevrank(process.env.KEY, username);
                currentRank = currentRank !== null ? currentRank + 1 : null;
                await redis.hmset(
                    userKey,
                    "username",
                    username,
                    "rank",
                    currentRank
                );
            } catch (err) {
                console.log(err);
            }
        }
    });
};

const endOfWeekCalculateMoney = () => {
    redis.keys("player:*").then(async (userKeys) => {
        let pool = 0;
        for (const userKey of userKeys) {
            try {
                const user = await redis.hgetall(userKey);
                const { username } = user;
                let score = await redis.zscore(process.env.KEY, username);
                score = parseInt(score);
                pool += score;
            } catch {}
        }
        const total = pool * 0.02;
        const first100 = await redis.zrevrange(process.env.KEY, 0, 9);
        for (let i = 0; i < first100.length; i++) {
            let prize = 0;
            if (i == 0) {
                prize = total * 0.2;
            } else if (i == 1) {
                prize = total * 0.15;
            } else if (i == 2) {
                prize = total * 0.1;
            } else {
                prize = (total * 0.55) / 3;
            }
            try {
                const winningPlayer = await Player.findOne({
                    username: first100[i],
                }).exec();
                winningPlayer.score += prize;
                await winningPlayer.save();
            } catch (err) {
                console.log(err);
            }
        }
        for (const userKey of userKeys) {
            try {
                const user = await redis.hgetall(userKey);
                const { username } = user;
                await redis.zrem(process.env.KEY, username);
                await redis.zadd(process.env.KEY, 0, username);
            } catch {}
        }
        endOfDayCalculateRanks();

    });
};

const dailyJob = nodecron.schedule("0 0 * * *", () => {
    console.log("daily", new Date());
    endOfDayCalculateRanks();
});


const weekJob = nodecron.schedule("0 0 * * 0", () => {
    console.log("weekly", new Date());
    endOfWeekCalculateMoney();
});

module.exports={endOfDayCalculateRanks,endOfWeekCalculateMoney}