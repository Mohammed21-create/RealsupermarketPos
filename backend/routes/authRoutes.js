const router=require("express").Router()
const auth=require("../controllers/authController")

router.post("/login",auth.login)
router.get("/me",auth.me)
router.post("/logout",auth.logout)

module.exports=router