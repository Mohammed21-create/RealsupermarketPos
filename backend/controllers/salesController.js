const Sale = require("../models/Sale");
const Product = require("../models/Product");



// =====================================
// CREATE SALE
// =====================================
exports.createSale = async (req, res) => {

try{

const saleData = req.body;
const items = saleData.items || [];



// ensure cashier name is saved
saleData.cashierName = saleData.cashierName || "Unknown";

// create sale
const sale = new Sale(saleData);
await sale.save();


// =====================================
// UPDATE PRODUCT STOCK
// =====================================
for(const item of items){

const product = await Product.findOne({
name: item.name
});

if(product){

product.stock -= Number(item.qty) || 0;

if(product.stock < 0){
product.stock = 0;
}

await product.save();

}

}
const io = req.app.get("io");
io.emit("new-sale", sale);

res.json(sale);

}catch(err){

res.status(500).json({ error: err.message });

}

};



// =====================================
// GET ALL SALES
// =====================================
exports.getAllSales = async (req, res) => {

try{

const sales = await Sale.find()
.sort({ createdAt: -1 });

res.json(sales);

}catch(err){

res.status(500).json({ error: err.message });

}

};



// =====================================
// GET TODAY SALES
// =====================================
exports.getTodaySales = async (req, res) => {

try{

const start = new Date();
start.setHours(0,0,0,0);

const end = new Date();
end.setHours(23,59,59,999);

const sales = await Sale.find({
createdAt:{
$gte: start,
$lte: end
}
});

res.json(sales);

}catch(err){

res.status(500).json({ error: err.message });

}

};



// =====================================
// MONTHLY SALES ANALYTICS
// =====================================
exports.getMonthlySales = async (req,res)=>{

try{

const sales = await Sale.aggregate([

{
$group:{
_id:{ $month:"$createdAt" },
totalSales:{ $sum:"$total" }
}
},

{
$sort:{ _id:1 }
}

]);

const months = [
"Jan","Feb","Mar","Apr","May","Jun",
"Jul","Aug","Sep","Oct","Nov","Dec"
];

const labels = [];
const values = [];

sales.forEach(s=>{

labels.push(months[s._id - 1]);
values.push(s.totalSales);

});

res.json({
months: labels,
sales: values
});

}catch(err){

res.status(500).json({error:err.message});

}

};

exports.syncSales = async (req, res) => {

  try {

    const { sales } = req.body;

    if (!sales || sales.length === 0) {
      return res.status(400).json({ message: "No sales to sync" });
    }

    for (let sale of sales) {

      // prevent duplicate sync
      const exists = await Sale.findOne({ id: sale.id });

      if (exists) continue;

      await Sale.create(sale);

    }

    res.json({ message: "Sync successful" });

  } catch (err) {

    console.log(err);

    res.status(500).json({ message: "Sync failed" });

  }

};

