/** @format */

const { default: mongoose, Schema, model } = require("mongoose");

const assetLogsSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  type: { type: String },
  barcodeId: { type: String, required: true },
  action: { type: String, default: "Available" },
  reason: { type: String, required: true },
  timestamp: { type: Date, default: Date.now() },
  user: { type: String, required: true },
});
module.exports = model("assets-logs", assetLogsSchema);
