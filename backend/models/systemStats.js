const mongoose = require("mongoose");

const systemStatsSchema = new mongoose.Schema({
  totalInvestment: {
    type: Number,
    default: 0
  },
  totalStockCost: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("SystemStats", systemStatsSchema);