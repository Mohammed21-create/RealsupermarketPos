const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  emoji: { type: String, default: "📦" },
  barcode: {
    type: String,
    required: true,
    unique: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  bulkPrice: {
    type: Number,
    default: 0,
  },
  unitsPerBulk: {
    type: Number,
    default: 1,
  },
  unitCost: {
    type: Number,
    required: true,
  },
  bulkCost: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    default: "General",
  },
  description: {
    type: String,
    default: "",
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
  },

  totalInvestment: {
    type: Number,
    default: 0
}
  
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);