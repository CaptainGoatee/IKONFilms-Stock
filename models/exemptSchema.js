/** @format */

const { default: mongoose } = require("mongoose");

const exemptSchema = new mongoose.Schema({
  userID: { type: String, require: true, unique: true },
  username: { type: String, require: true },
  reason: { type: String, require: true },
});


const exemptModel = mongoose.model("exemptList", exemptSchema);

module.exports = exemptModel;
