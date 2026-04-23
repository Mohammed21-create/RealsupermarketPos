const Admin = require("../models/Admin");
const Cashier = require("../models/Cashier");
const bcryptjs = require("bcryptjs");

// ==========================
// LOGIN (ADMIN + CASHIER)
// ==========================
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. CHECK ADMIN FIRST
    let user = await Admin.findOne({ username });

    if (user) {
      const match = await bcryptjs.compare(password, user.password);

      if (!match) {
        return res.status(401).json({ message: "Invalid login" });
      }

      req.session.user = {
        id: user._id,
        username: user.username,
        role: "admin"
      };

      return res.json(req.session.user);
    }

    // 2. CHECK CASHIER
    user = await Cashier.findOne({ username });

    if (user) {
      const match = await bcryptjs.compare(password, user.password);

      if (!match) {
        return res.status(401).json({ message: "Invalid login" });
      }

      req.session.user = {
        id: user._id,
        username: user.username,
        role: "cashier"
      };

      return res.json(req.session.user);
    }

    // 3. NO USER FOUND
    return res.status(401).json({ message: "User not found" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// GET CURRENT USER
// ==========================
exports.me = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  res.json(req.session.user);
};

// ==========================
// LOGOUT
// ==========================
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
};