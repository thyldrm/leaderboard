const express = require("express");
const {endOfDayCalculateRanks,endOfWeekCalculateMoney} = require("../scheduleJobs");

const router = express.Router();

router.get("/resetDay",(req,res)=>{
    try{
        endOfDayCalculateRanks();
    }catch(err){
        console.log(err)
    }
    res.send({mes:"ok"})
})

router.get("/resetWeek",(req,res)=>{
    try{
        endOfWeekCalculateMoney();
    }catch(err){
        console.log(err)
    }
    res.send({mes:"ok"})
})

module.exports=router;