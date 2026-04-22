const router = require("express").Router();

const sales = require("../controllers/salesController");

// CREATE SALE
router.post("/", sales.createSale);

// GET ALL SALES
router.get("/", sales.getAllSales);

// GET TODAY SALES
router.get("/today", sales.getTodaySales);
router.get("/analytics/monthly-sales",sales.getMonthlySales);
router.post("/sync", sales.syncSales);


module.exports = router;