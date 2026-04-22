require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/Admin");

mongoose.connect(process.env.MONGO_URI);

async function createAdmin() {
    const username = "admin";
    const password = "1234"; // choose your secure password

    const existing = await Admin.findOne({ username });
    if (!existing) {
        const hash = await bcrypt.hash(password, 10);
        await Admin.create({ username, password: hash });
        console.log("Admin created!");
    } else {
        console.log("Admin already exists.");
    }

    process.exit();
}

createAdmin();