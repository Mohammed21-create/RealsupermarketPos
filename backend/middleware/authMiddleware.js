function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (req.session.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
}

function requireCashier(req, res, next) {
  if (req.session.user?.role !== "cashier") {
    return res.status(403).json({ message: "Cashier only" });
  }
  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireCashier
};