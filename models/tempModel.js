/** @format */

const { default: mongoose } = require("mongoose");

const tempSchema = new mongoose.Schema({
  vrm: { type: String },
});
module.exports = tempSchema;
