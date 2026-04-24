const Sale = require("../models/Sale");
const Product = require("../models/Product");

// =====================================
// CREATE SALE
// =====================================
exports.createSale = async (req, res) => {
  try {

    console.log("📥 Incoming Sale:", req.body);

    const saleData = req.body;
    const items = saleData.items || [];

    // =============================
    // VALIDATION
    // =============================
    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "No items in cart"
      });
    }

    // ensure cashier name
    saleData.cashierName = saleData.cashierName || "Unknown";

    // =============================
    // UPDATE PRODUCT STOCK FIRST
    // =============================
    for (const item of items) {

      if (!item.productId) {
        return res.status(400).json({
          message: "Missing productId in cart item"
        });
      }

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(400).json({
          message: "Product not found",
          error: item.productId
        });
      }

      const qty = Number(item.qty) || 0;

      if (qty <= 0) {
        return res.status(400).json({
          message: "Invalid quantity",
          error: item
        });
      }

      // reduce stock
      product.stock -= qty;

      if (product.stock < 0) {
        product.stock = 0;
      }

      await product.save();
    }

    // =============================
    // SAVE SALE AFTER STOCK SUCCESS
    // =============================
    const sale = new Sale(saleData);
    await sale.save();

    console.log("✅ Sale saved:", sale._id);

    // =============================
    // REAL-TIME UPDATE (SOCKET)
    // =============================
    const io = req.app.get("io");
    if (io) {
      io.emit("new-sale", sale);
    }

    // =============================
    // RESPONSE
    // =============================
    res.status(201).json({
      message: "Sale successful",
      sale
    });

  } catch (err) {

    console.error("❌ SALE ERROR:", err);

    res.status(500).json({
      message: "Sale failed",
      error: err.message
    });

  }
};

// =====================================
// GET ALL SALES
// =====================================
exports.getAllSales = async (req, res) => {
  try {

    const sales = await Sale.find().sort({ createdAt: -1 });

    res.json(sales);

  } catch (err) {

    res.status(500).json({
      message: "Failed to fetch sales",
      error: err.message
    });

  }
};

// =====================================
// GET TODAY SALES
// =====================================
exports.getTodaySales = async (req, res) => {
  try {

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      createdAt: {
        $gte: start,
        $lte: end
      }
    });

    res.json(sales);

  } catch (err) {

    res.status(500).json({
      message: "Failed to fetch today sales",
      error: err.message
    });

  }
};

// =====================================
// MONTHLY SALES ANALYTICS
// =====================================
exports.getMonthlySales = async (req, res) => {
  try {

    const sales = await Sale.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: "$total" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const labels = [];
    const values = [];

    sales.forEach(s => {
      labels.push(months[s._id - 1]);
      values.push(s.totalSales);
    });

    res.json({
      months: labels,
      sales: values
    });

  } catch (err) {

    res.status(500).json({
      message: "Failed to fetch monthly analytics",
      error: err.message
    });

  }
};

// =====================================
// SYNC SALES (OFFLINE SUPPORT)
// =====================================
exports.syncSales = async (req, res) => {
  try {

    const { sales } = req.body;

    if (!sales || sales.length === 0) {
      return res.status(400).json({
        message: "No sales to sync"
      });
    }

    for (let sale of sales) {

      const exists = await Sale.findOne({ id: sale.id });

      if (exists) continue;

      await Sale.create(sale);
    }

    res.json({
      message: "Sync successful"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Sync failed",
      error: err.message
    });

  }
};