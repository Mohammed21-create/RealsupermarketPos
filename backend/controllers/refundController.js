const Sale = require("../models/Sale");
const Product = require("../models/Product");

// =====================
// PROCESS REFUND
// =====================
exports.processRefund = async (req, res) => {
  try {
    const { items, total, cashierId } = req.body;

    let refundProfit = 0;
    let refundLoss = 0;

    for (const item of items) {
      const product = await Product.findOne({ name: item.name });
      if (!product) continue;

      const qty = Number(item.qty) || 0;
      const saleType = (item.type || "unit").toLowerCase();
      const unitCost = Number(product.unitCost || product.cost) || 0;
      const unitsPerBulk = Number(product.unitsPerBulk) || 1;

      let stockReturned = 0;
      let costTotal = 0;

      if (saleType === "bulk") {
        stockReturned = Number(item.stockUsed) || qty * unitsPerBulk;
        costTotal = unitCost * stockReturned;
      } else {
        stockReturned = qty;
        costTotal = unitCost * qty;
      }

      // Restore stock
      product.stock += stockReturned;
      await product.save();

      const refundTotal = Number(item.total) || 0;
      const profit = refundTotal - costTotal;

      if (profit >= 0) refundProfit += profit;
      else refundLoss += Math.abs(profit);
    }

    const refund = new Sale({
      cashierId,
      items,
      total,
      paymentMethod: "Refund",
      isRefund: true,
    });

    await refund.save();

    res.json({
      message: "Refund processed successfully",
      refundProfit,
      refundLoss,
      netRefundImpact: refundProfit - refundLoss,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Refund failed", error: err.message });
  }
};

// =====================
// GET REFUND HISTORY
// =====================
exports.getRefunds = async (req, res) => {
  try {
    const { startDate, endDate, cashierId } = req.query;
    let filter = { isRefund: true };

    if (startDate || endDate) filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
    if (cashierId) filter.cashierId = cashierId;

    const refunds = await Sale.find(filter).sort({ createdAt: -1 });
    res.json(refunds);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch refund history", error: err.message });
  }
};

// =====================
// GET DAILY REFUND TOTAL
// =====================
exports.getDailyRefundTotal = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const dailyRefunds = await Sale.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
      isRefund: true,
    });

    const total = dailyRefunds.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
    res.json({ total });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch daily refunds", error: err.message });
  }
};