const mongoose = require("mongoose");

const refundItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  type: { type: String, enum: ["unit", "bulk"], default: "unit" },
  total: { type: Number, required: true },
  stockUsed: { type: Number } // Optional for bulk refunds
});

const refundSchema = new mongoose.Schema({
  cashierId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  cashierName: { type: String, default: "Unknown" }, // matches dashboard
  items: [refundItemSchema],
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  notes: { type: String, default: "" } // optional refund notes
}, { timestamps: true });

module.exports = mongoose.model("Refund", refundSchema);