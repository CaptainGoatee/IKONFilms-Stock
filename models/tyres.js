/** @format */

const mongoose = require("mongoose");

const tyreSchema = new mongoose.Schema({
  partNumber: { type: String, require: true },
  description: { type: String, require: true },
  quantity: { type: Number, require: true, default: 0 },
  stCode: { type: String, require: true },
});

module.exports = mongoose.model("tyreStock", tyreSchema);
