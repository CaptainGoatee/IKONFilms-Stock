/** @format */

const { default: mongoose } = require("mongoose");
const errorSchema = new mongoose.Schema({
  discordID: { type: String, require: true },
  reason: { type: String, require: true },
  date: {
    type: Date,
    require: true,
    default: Date.now(),
  },
  URL: { type: String, require: true },
});

const errorModel = mongoose.model("WebErrorLogs", errorSchema);

module.exports = errorModel;
