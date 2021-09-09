const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create schema
const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  capital: {
    type: Number,
    required: true,
  },
  profit: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  date_added: {
    type: Date,
    default: Date.now,
  },
  date_updated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Product = mongoose.model("product", ProductSchema);
