const Sale = require("../models/Sale")

exports.dailyTotal = async(req,res)=>{

const start = new Date()

start.setHours(0,0,0,0)

const sales = await Sale.find({
createdAt:{$gte:start},
isRefund:false
})

let total=0

sales.forEach(s=>total+=s.total)

res.json({total})

}

// ===============================
// MONTHLY REVENUE
// ===============================
exports.getMonthlyRevenue = async (req, res) => {

try {

const start = new Date();

start.setDate(1);   // first day of month
start.setHours(0,0,0,0);

const sales = await Sale.find({
createdAt: { $gte: start }
});

let total = 0;

sales.forEach(s => total += Number(s.total) || 0);

res.json({ total });

} catch (err) {

res.status(500).json({ error: err.message });

}

};