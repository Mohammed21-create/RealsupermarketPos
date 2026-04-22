const mongoose = require("mongoose")

const cashierSchema = new mongoose.Schema({

username:{
type:String,
required:true,
unique:true,
trim:true
},

password:{
type:String,
required:true
},

role:{
type:String,
default:"cashier"
},

isActive:{
type:Boolean,
default:true
},

lastLogin:{
type:Date
}

},{
timestamps:true
})

module.exports = mongoose.model("Cashier",cashierSchema)