const express = require("express");

// Import authorization middleware for admin
const { authorizeAdmin } = require("../../middleware/auth");

// Import Product model
const Product = require("../../models/Product");

// Initialize the Express Router
const router = express.Router();

/**
 * @route GET /api/products
 * @desc Get list of products
 * @access Public
 * @response JSON, list of products
 */
router.get("/", (req, res) => {
  Product.find({}, (err, products) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Something went wrong, please try again." });

    return res.status(200).json(products);
  });
});

/**
 * @route POST /api/products/product
 * @desc Add a new product
 * @access Private
 * @response JSON, Product object with id
 */
router.post("/product", authorizeAdmin, (req, res) => {
  // Get the product from request
  const newProduct = new Product(req.body);

  // Try to save product
  newProduct.save().then((product) => {
    if (!product)
      return res.status(500).json({
        message:
          "Something went wrong while saving the product, please try again.",
      });

    //Product is saved
    return res.status(201).json(product);
  });
});

/**
 * @route PUT /api/products/product
 * @desc Modifies an existing product
 * @access Private
 * @response JSON, Product object with id
 */
router.put("/product", authorizeAdmin, (req, res) => {
  // Get the product from request
  const { _id, name, description, capital, profit, stock, discount } = req.body;

  // Find the product by id and update it
  Product.findByIdAndUpdate(
    { _id },
    {
      name: name,
      description: description,
      capital: capital,
      profit: profit,
      stock: stock,
      discount: discount,
      date_updated: Date.now(),
    },
    { new: true },
    (err, product) => {
      // Error occurred, might be on the server
      if (err)
        return res
          .status(500)
          .json({ message: "Something went wrong please try again." });
      // If no product match the id
      if (!product)
        return res.status(400).json({ message: "Product not found." });

      // Product is found and modified
      return res.status(200).json(product);
    }
  );
});

/**
 * @route DELETE /api/products/product
 * @desc Delete an existing product
 * @access Private
 * @response No Content 204
 */
router.delete("/product", authorizeAdmin, (req, res) => {
  // Get the product from request
  const { _id } = req.body;

  // Find the product by id and delete it
  Product.findByIdAndDelete({ _id }).then((product) => {
    // The product is not found
    if (!product)
      return res.status(400).json({ message: "Product not found." });

    // Product is found and deleted
    return res.sendStatus(204);
  });
});

// export the Router to access on server.js
module.exports = router;
