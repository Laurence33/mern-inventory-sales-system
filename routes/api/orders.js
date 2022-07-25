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
 * @access Private - User/Admin
 * @response JSON, order object
 */
router.post("/", authorize, (req, res) => {
  const order = req.body;
  // Check if there is at least one product in the order
  if (order.products.length < 1)
    return res
      .status(400)
      .json({ message: "There should be at least one product in an order." });

  var newOrder;
  // If order is posted by a User
  if (req.user) {
    if (!order.products || !order.total_cost)
      return res.status(400).json({ message: "Incomplete Details" });

    newOrder = new Order({
      user_id: req.user.id,
      customer_name: req.user.name,
      products: order.products,
      total_cost: order.total_cost,
    });
  }
  // If order is posted by admin
  if (req.admin) {
    if (!order.customer_name || !order.products || !order.total_cost)
      return res.status(400).json({ message: "Incomplete Details" });
    var status;
    if (order.status) {
      status = order.status;
    } else {
      status = "ACCEPTED";
    }
    newOrder = new Order({
      customer_name: order.customer_name,
      products: order.products,
      total_cost: order.total_cost,
      status: status,
    });
  }

  newOrder.save().then((order) => {
    if (!order)
      return res
        .status(500)
        .json({ message: "Something went wrong please try again." });

    return res.status(201).json(order);
  });
});

/**
 * @route POST api/orders/order/order_status
 * @desc Edit Status of an order
 * @access Private - Admin
 * @response JSON, updated order object
 */
router.post("/order/order_status", authorizeAdmin, (req, res) => {
  const order_id = req.body._id;
  const order_status = req.body.status;

  console.log("Updating order:", order_id, "\nStatus:", order_status);

  if (order_status == "COMPLETED") {
    // Order is marked as complete
    Order.findByIdAndUpdate(
      order_id,
      { status: order_status, date_completed: Date.now() },
      { new: true },
      (error, order, result) => {
        if (!order) return res.status(400).json({ message: "Order not found" });

        // Order is updated

        // order is marked as completed, iterate through products and update individual number of stocks
        const products = order.products;
        console.log("Marked as COMPLETED", order);
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
              console.log(
                "Updating Product with ID:",
                d.id,
                ", New Stock:",
                d.stock
              );
            }
          );
        });
        return res.status(200).json(order);
      }
    );
    // Updating status only
  } else {
    Order.findByIdAndUpdate(
      order_id,
      { status: order_status },
      { new: true },
      (error, order, result) => {
        if (!order) return res.status(400).json({ message: "Order not found" });
        // Order is updated
        return res.status(200).json(order);
      }
    );
  }
});

/**
 * @route GET api/orders/:UserId
 * @desc Get orders of a user
 * @access Private - User/Admin
 * @response Orders Object
 */
router.get("/:UserId", authorize, (req, res) => {
  const userId = req.params.UserId;
  if (req.user) {
    // If request is from a User, make sure they are requesting their own orders
    if (req.user.id != userId)
      return res.status(401).json({
        message: "You are not authorized to get the document requested.",
      });
  }
  // User is requesting his own orders
  // or Admin sent the request
  Order.find({ user_id: userId })
    .then((orders) => {
      return res.status(200).json(orders);
    })
    .catch((err) => {
      return res
        .status(500)
        .json({ message: "An error occurred, please try again." });
    });
});

module.exports = router;
