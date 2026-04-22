require("dotenv").config()

const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const Cashier = require("./models/Cashier")

mongoose.connect(process.env.MONGO_URI)

async function createCashiers(){

const cashiers = [
{ username:"cashier1", password:"1234" },
{ username:"cashier2", password:"1234" },
{ username:"cashier3", password:"1234" }
]

for(const c of cashiers){

const existing = await Cashier.findOne({username:c.username})

if(!existing){

const hash = await bcrypt.hash(c.password,10)

await Cashier.create({
username:c.username,
password:hash
})

console.log(c.username,"created")

}

}

console.log("All cashiers ready")

process.exit()

}

createCashiers()