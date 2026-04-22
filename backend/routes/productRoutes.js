const express = require("express");

const router = express.Router();

const productController = require("../controllers/productController");


// GET ALL PRODUCTS
router.get("/",productController.getProducts);


// ADD PRODUCT
router.post("/",productController.addProduct);



// UPDATE PRODUCT
router.put("/:id",productController.updateProduct);



// DELETE PRODUCT
router.delete("/:id",productController.deleteProduct);


// GET PRODUCT BY BARCODE
router.get("/barcode/:barcode",productController.getProductByBarcode);
router.get("/total-investment", productController.getTotalInvestment);


module.exports = router;