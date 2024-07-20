/** @format */

const mongoose = require("mongoose");

const techSchema = new mongoose.Schema({
  id: { type: String, default: "null" },
  code: { type: String, required: true, unique: true },
  name: { type: String, default: "null" },
  type: { type: String, default: "null" },
  children: { type: String, default: "null" },
});

const techModel = mongoose.model("technicians", techSchema);

module.exports = techModel;
