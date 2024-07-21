/** @format */

const { default: mongoose, Schema, model } = require("mongoose");

const assetSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  barcodeId: { type: String, unique: true, required: true },
  dateTakenOut: { type: Date, default: Date.now() },
  dateScannedIn: { type: Date, default: null },
  takenBy: { type: String, required: true },
});
module.exports = model("assets-out", assetSchema);
