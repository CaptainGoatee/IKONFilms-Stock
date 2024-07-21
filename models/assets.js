/** @format */

const { default: mongoose, Schema, model } = require("mongoose");

const assetSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  barcodeId: { type: String, required: true },
  location: { type: String, default: "Kit Room" },
  section: { type: String, default: "Kit Room" },
  image: { type: String, required: false },
  status: { type: String, default: "Available" },
  dateCreated: { type: Date, default: Date.now() },
  lastUsed: { type: Date },
  dateUpdated: { type: Date, default: Date.now() },
  createdBy: { type: String, required: true },
});
module.exports = model("assets", assetSchema);
