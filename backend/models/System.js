const mongoose = require("mongoose");

const systemSchema = new mongoose.Schema({

shopName:{
type:String,
default:"SmartPOS Shop"
},

shopAddress:{
type:String,
default:""
},

phone:{
type:String,
default:""
},

currency:{
type:String,
default:"GHS"
},

lastBackup:{
type:Date,
default:null
},

autoBackup:{
type:Boolean,
default:false
},

createdAt:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("System", systemSchema);