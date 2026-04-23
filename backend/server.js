require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const session = require("express-session")
const path = require("path")

//

const app = express()

app.use(cors({
origin: "true",
credentials:true
}))
app.use(express.json())

app.use(session({
name: "smartpos.sid",
secret:process.env.SESSION_SECRET,
resave:false,
saveUninitialized:false,
cookie: {
    
    secure: true,
    sameSite: "none",
    
    maxAge: 1000 * 60 * 24
}

}))

// Serve cashier frontend
app.use(express.static(path.join(__dirname,"../Admin/chasheir")))

// Routes
app.use("/api/auth",require("./routes/authRoutes"))
app.use("/api/products",require("./routes/productRoutes"))
app.use("/api/sales",require("./routes/salesRoutes"))
app.use("/api/refunds",require("./routes/refundRoutes"))
app.use("/api/analytics",require("./routes/analyticsRoutes"))
app.use("/api/admin",require("./routes/adminRoutes"))
app.use("/api/system", require("./routes/systemRoutes"))
app.use("/api/cashiers", require("./routes/cashierRoutes"))
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Admin/chasheir/cashier-login.html"));
});

// ==============================
// ERROR HANDLER (VERY IMPORTANT)
// ==============================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log("MongoDB Error:",err))

app.listen(process.env.PORT,()=>{
console.log("Server running on port",process.env.PORT)
})

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../Admin/chasheir/cashier-login.html"));
});