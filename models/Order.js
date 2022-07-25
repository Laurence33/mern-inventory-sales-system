const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Order Schema
const OrderSchema = new Schema({
  user_id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "user",
  },
  customer_name: {
    type: String,
    required: true,
  },
  date_ordered: {
    type: Date,
    default: Date.now,
  },
  date_completed: {
    type: Date,
  },
  products: [
    {
      product_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "product",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      cost: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  total_cost: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "POSTED",
  },
});

module.exports = Order = mongoose.model("order", OrderSchema);
