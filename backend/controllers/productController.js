const Product = require("../models/Product");
const SystemStats = require("../models/systemStats");

// =====================
// GET ALL PRODUCTS
// =====================
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to load products", error: err.message });
  }
};

// =====================
// ADD PRODUCT
// =====================
exports.addProduct = async (req, res) => {
  try {
    const data = req.body;

    // ✅ VALIDATION
    if (!data.name || !data.unitPrice || !data.unitCost) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const productData = {
      name: data.name,
      emoji: data.emoji || "📦",
      barcode: data.barcode || "POS-" + Date.now(),
      unitPrice: Number(data.unitPrice),
      bulkPrice: Number(data.bulkPrice) || 0,
      unitsPerBulk: Number(data.unitsPerBulk) || 1,
      unitCost: Number(data.unitCost),
      bulkCost: Number(data.bulkCost) || Number(data.unitCost) * (Number(data.unitsPerBulk) || 1),
      stock: Number(data.stock) || 0,
      category: data.category || "General",
      description: data.description || "",
      initialStock: Number(data.stock),
      lowStockThreshold: Number(data.lowStockThreshold) || 100,
    };

    const product = new Product(productData);
    await product.save();

   // ===================================
    // ✅ UPDATE TOTAL INVESTMENT (FIXED VALUE)
    // ======================================
    const investment = productData.unitCost * productData.stock;

    let stats = await SystemStats.findOne();

    if (!stats) {
      stats = new SystemStats();
    }

    stats.totalInvestment += investment;

    await stats.save();

    res.status(201).json(product);

  } catch (err) {
    res.status(400).json({
      message: "Failed to add product",
      error: err.message
    });
  }
};


// =====================
// UPDATE PRODUCT
// =====================
exports.updateProduct = async (req, res) => {
  try {

    const existing = await Product.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    const data = req.body;

    const newStock = Number(data.stock) || 0;
    const newCost = Number(data.unitCost) || 0;

    const oldStock = Number(existing.stock) || 0;
    const oldCost = Number(existing.unitCost) || 0;

    // =============================
    // CALCULATE STOCK COST CHANGE
    // =============================
    const oldValue = oldStock * oldCost;
    const newValue = newStock * newCost;
    const difference = newValue - oldValue;

    // =============================
    // UPDATE PRODUCT
    // =============================
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...data,
        unitCost: newCost,
        stock: newStock
      },
      { new: true }
    );

    // =============================
    // GET SYSTEM STATS
    // =============================
    let stats = await SystemStats.findOne();
    if (!stats) {
      stats = new SystemStats({
        totalStockCost: 0,
        totalInvestment: 0
      });
    }

    // =============================
    // UPDATE STOCK VALUE (CAN CHANGE BOTH WAYS)
    // =============================
    stats.totalStockCost += difference;

    // =============================
    // UPDATE INVESTMENT (ONLY WHEN STOCK INCREASES)
    // =============================
    if (newStock > oldStock) {

      const addedStock = newStock - oldStock;
      const addedInvestment = addedStock * newCost;

      stats.totalInvestment += addedInvestment;
    }

    await stats.save();

    res.json(updated);

  } catch (err) {
    res.status(400).json({
      message: "Failed to update product",
      error: err.message
    });
  }
};
// =====================
// DELETE PRODUCT
// =====================
exports.deleteProduct = async (req, res) => {
  try {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ SUBTRACT FROM SYSTEM COST
    const value = product.stock * product.unitCost;

    let stats = await SystemStats.findOne();
    if (!stats) stats = new SystemStats({ totalStockCost: 0 });

    stats.totalStockCost -= value;
    await stats.save();

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted successfully" });

  } catch (err) {
    res.status(400).json({ message: "Failed to delete product", error: err.message });
  }
};

// =====================
// GET PRODUCT BY BARCODE
// =====================
exports.getProductByBarcode = async (req, res) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (err) {
    res.status(500).json({ message: "Failed to get product", error: err.message });
  }
};

// =====================
// GET TOTAL INVESTMENT
// =====================
exports.getTotalInvestment = async (req, res) => {
  try {
    const products = await Product.find();

    let total = 0;

    products.forEach(p => {
      const cost = Number(p.unitCost) || 0;
      const initial = Number(p.initialStock || p.stock) || 0;

      total += cost * initial;
    });

    res.json({ totalInvestment: total });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};