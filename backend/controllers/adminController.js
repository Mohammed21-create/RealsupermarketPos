const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");


// ======================
// ADMIN LOGIN
// ======================
exports.login = async (req, res) => {

try{

const { username, password } = req.body;

if(!username || !password){
return res.status(400).json({message:"Username and password required"});
}

const admin = await Admin.findOne({username});

if(!admin){
return res.status(401).json({message:"Invalid credentials"});
}

if(!admin.isActive){
return res.status(403).json({message:"Admin account disabled"});
}

const match = await bcrypt.compare(password, admin.password);

if(!match){
return res.status(401).json({message:"Invalid credentials"});
}

// update last login
admin.lastLogin = new Date();
await admin.save();

req.session.adminId = admin._id;

res.json({
message:"Login successful",
admin:{
id:admin._id,
username:admin.username
}
});

}catch(err){

res.status(500).json({error:err.message});

}

};



// ======================
// CURRENT ADMIN
// ======================
exports.me = async (req,res)=>{

try{

if(!req.session.adminId){
return res.status(401).json({message:"Not logged in"});
}

const admin = await Admin
.findById(req.session.adminId)
.select("-password");

res.json(admin);

}catch(err){

res.status(500).json({error:err.message});

}

};



// ======================
// CHANGE PASSWORD
// ======================
exports.changePassword = async (req,res)=>{

try{

if(!req.session.adminId){
return res.status(401).json({message:"Not authenticated"});
}

const {current,newPass} = req.body;

if(!current || !newPass){
return res.status(400).json({message:"All fields required"});
}

const admin = await Admin.findById(req.session.adminId);

if(!admin){
return res.status(404).json({message:"Admin not found"});
}

// check current password
const match = await bcrypt.compare(current, admin.password);

if(!match){
return res.status(400).json({message:"Current password incorrect"});
}

// hash new password
const hashedPassword = await bcrypt.hash(newPass,10);

admin.password = hashedPassword;

await admin.save();

res.json({message:"Password changed successfully"});

}catch(err){

res.status(500).json({error:err.message});

}

};



// ======================
// LOGOUT
// ======================
exports.logout = (req,res)=>{

req.session.destroy((err)=>{

if(err){
return res.status(500).json({message:"Logout failed"});
}

res.json({message:"Logged out successfully"});

});

};