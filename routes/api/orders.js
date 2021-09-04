const express = require("express");

// Import Authentication middleware
const { authorize, authorizeAdmin } = require("../../middleware/auth");

// Initialize the express Router
const router = express.Router();

// Import the Order Schema
const Order = require("../../models/Order");

// Import the Product Schema for updating stocks on completion of Orders
const Product = require("../../models/Product");

/**
 * @route GET api/orders
 * @desc Get list of orders
 * @access Private
 * @response JSON, order object
 */
router.get("/", authorizeAdmin, (req, res) => {
  Order.find({}, (err, orders) => {
    if (orders) return res.status(200).json(orders);
  });
});

/**
 * @route POST api/orders/order
 * @desc Post a new order
 * @access Private
 * @response JSON, order object
 */
router.post("/order", authorize, (req, res) => {
  const order = req.body;

  const newOrder = new Order({
    id: order.id,
    user: order.user,
    products: order.products,
    total_cost: order.total_cost,
  });

  newOrder.save().then((order) => {
    if (!order)
      return res
        .status(500)
        .json({ message: "Something went wrong please try again." });

    return res.status(201).json(order);
  });
});

/**
 * @route POST api/orders/order_status
 * @desc Edit Status of an order
 * @access Private - Admin
 * @response JSON, updated order object
 */
router.post("/order/order_status", authorizeAdmin, (req, res) => {
  const order_id = req.body._id;
  const order_status = req.body.status;

  console.log("Updating order:", order_id);

  Order.findByIdAndUpdate(
    order_id,
    { status: order_status },
    { new: true },
    (error, order, result) => {
      if (!order) return res.status(400).json({ message: "Order not found" });

      // Order is updated

      // If order is marked as completed, iterate through products and update individual number of stocks
      if (order.status == "COMPLETED") {
        const products = order.products;
        console.log("Marked as COMPLETED");
        products.map((product) => {
          const count = Number(product.quantity);
          Product.findByIdAndUpdate(
            product.product_id,
            {
              $inc: { stock: -count },
            },
            { new: true },
            (err, d, r) => {
              if (err) console.log(err);
            }
          );
          console.log("Updating Product with ID:", product.id);
        });
      }
      return res.status(200).json(order);
    }
  );
});

module.exports = router;
