const router = require("express").Router();
const Cashier = require("../models/Cashier");
const bcryptjs = require("bcryptjs");


// =====================
// GET CASHIERS
// =====================
router.get("/", async(req,res)=>{

const cashiers = await Cashier.find();

res.json(cashiers);

});


// =====================
// ADD CASHIER
// =====================
router.post("/", async(req,res)=>{

try{

const {username,password} = req.body;

const hashed = await bcrypt.hash(password,10);

const cashier = new Cashier({
username,
password:hashed
});

await cashier.save();

res.json(cashier);

}catch(err){

res.status(400).json({message:err.message});

}

});


// =====================
// UPDATE CASHIER
// =====================
router.put("/:id", async(req,res)=>{

try{

const {username,password} = req.body;

let updateData = {username};

if(password && password.trim() !== ""){

updateData.password = await bcrypt.hash(password,10);

}

const updated = await Cashier.findByIdAndUpdate(
req.params.id,
updateData,
{new:true}
);

res.json(updated);

}catch(err){

res.status(400).json({message:err.message});

}

});


// =====================
// DELETE CASHIER
// =====================
router.delete("/:id", async(req,res)=>{

await Cashier.findByIdAndDelete(req.params.id);

res.json({message:"Cashier deleted"});

});

module.exports = router;