const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create schema
const StockSchema = new Schema({
  product_id: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "product",
  },
  product_name: {
    type: String,
    required: true,
  },
  new_stock: {
    type: Number,
    required: true,
  },
  total_stock: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Stock = mongoose.model("stock", StockSchema);
