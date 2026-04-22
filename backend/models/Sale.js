const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema({

name: { type: String, required: true },
emoji: { type: String, default: "📦" },

qty: { type: Number, required: true },

price: { type: Number, required: true },   // ✅ ADD THIS

type: { type: String, enum: ["unit", "bulk"], default: "unit" },

total: { type: Number, required: true },

stockUsed: { type: Number }

});

const saleSchema = new mongoose.Schema({

cashierId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

cashierName: { type: String, default: "Unknown" },

items: [saleItemSchema],

total: { type: Number, required: true },

paymentMethod: { type: String, default: "Cash" },

isRefund: { type: Boolean, default: false },

date: { type: Date, default: Date.now },

notes: { type: String, default: "" }

}, { timestamps: true });

module.exports = mongoose.model("Sale", saleSchema);