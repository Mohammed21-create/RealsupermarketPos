const router=require("express").Router()
const analytics=require("../controllers/analyticsController")

router.get("/daily-total",analytics.dailyTotal)
router.get("/monthly-revenue", analytics.getMonthlyRevenue);

module.exports=router