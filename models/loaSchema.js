/** @format */

const { default: mongoose } = require("mongoose");

const loaSchema = new mongoose.Schema({
  userID: { type: String, require: true, unique: true },
  username: { type: String, require: true },
  reason: { type: String, require: true },
  days: { type: String, require: true, default: "0" },
  endDate: {type: Date, required: true, default: Date.now()},

});

//mongoose.model("", add)

const loaModel = mongoose.model("loaList", loaSchema);

module.exports = loaModel;
