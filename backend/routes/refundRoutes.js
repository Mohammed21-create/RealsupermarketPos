const router=require("express").Router()
const refund=require("../controllers/refundController")

router.post("/",refund.processRefund)

module.exports=router