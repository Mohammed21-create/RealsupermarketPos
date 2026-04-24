require("dotenv").config();

const express = require("express");
const http = require("http"); // ✅ REQUIRED
const { Server } = require("socket.io"); // ✅ REQUIRED

const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const path = require("path");

// =====================
// INIT APP
// =====================
const app = express();

// =====================
// CREATE HTTP SERVER
// =====================
const server = http.createServer(app);

// =====================
// SOCKET.IO SETUP
// =====================
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true
  }
});

// make io available in controllers
app.set("io", io);

// =====================
// MIDDLEWARE
// =====================
app.use(cors({
  origin: true, // ❌ you had "true" (string) — fixed
  credentials: true
}));

app.use(express.json());

app.use(session({
  name: "smartpos.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // ⚠️ set true only on HTTPS (Render)
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// =====================
// STATIC FILES
// =====================
app.use(express.static(path.join(__dirname, "../Admin/chasheir")));

// =====================
// ROUTES
// =====================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/sales", require("./routes/salesRoutes"));
app.use("/api/refunds", require("./routes/refundRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/system", require("./routes/systemRoutes"));
app.use("/api/cashiers", require("./routes/cashierRoutes"));

// =====================
// DEFAULT ROUTE
// =====================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Admin/chasheir/cashier-login.html"));
});

// =====================
// FALLBACK (IMPORTANT)
// =====================
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../Admin/chasheir/cashier-login.html"));
});

// =====================
// ERROR HANDLER
// =====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

// =====================
// DATABASE
// =====================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Error:", err));

// =====================
// START SERVER
// =====================
server.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});