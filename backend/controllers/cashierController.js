const Cashier = require("../models/Cashier");
const bcrypt = require("bcryptjs");


// ======================
// GET ALL CASHIERS
// ======================
exports.getCashiers = async (req, res) => {

try{

const cashiers = await Cashier.find().select("-password");

res.json(cashiers);

}catch(err){

res.status(500).json({error:err.message});

}

};



// ======================
// ADD CASHIER
// ======================
exports.addCashier = async (req, res) => {

try{

const {username,password} = req.body;

if(!username || !password){
return res.status(400).json({message:"Username and password required"});
}

const exist = await Cashier.findOne({username});

if(exist){
return res.status(400).json({message:"Username already exists"});
}

const hashedPassword = await bcrypt.hash(password,10);

const cashier = new Cashier({
username,
password:hashedPassword
});

await cashier.save();

res.status(201).json({
message:"Cashier created successfully",
cashier
});

}catch(err){

res.status(500).json({error:err.message});

}

};



// ======================
// UPDATE CASHIER
// ======================
exports.updateCashier = async (req,res)=>{

try{

const {username,password,isActive} = req.body;

let updateData = {};

if(username) updateData.username = username;
if(typeof isActive === "boolean") updateData.isActive = isActive;

if(password){
updateData.password = await bcrypt.hash(password,10);
}

const cashier = await Cashier.findByIdAndUpdate(
req.params.id,
updateData,
{new:true}
).select("-password");

res.json(cashier);

}catch(err){

res.status(500).json({error:err.message});

}

};



// ======================
// DELETE CASHIER
// ======================
exports.deleteCashier = async (req,res)=>{

try{

await Cashier.findByIdAndDelete(req.params.id);

res.json({message:"Cashier deleted successfully"});

}catch(err){

res.status(500).json({error:err.message});

}

};



// ======================
// CASHIER LOGIN TRACK
// ======================
exports.updateLastLogin = async (cashierId)=>{

try{

await Cashier.findByIdAndUpdate(cashierId,{
lastLogin:new Date()
});

}catch(err){
console.log(err);
}

};