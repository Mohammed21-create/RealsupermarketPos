const express = require("express");
const router = express.Router();
const SystemStats = require("../models/systemStats");

// GET TOTAL STOCK COST
router.get("/stock-cost", async (req, res) => {

try{

let stats = await SystemStats.findOne();

if(!stats){
stats = await SystemStats.create({ totalStockCost: 0 });
}

res.json({ totalStockCost: stats.totalStockCost });

}catch(err){

res.status(500).json({error:err.message});

}

});



module.exports = router;