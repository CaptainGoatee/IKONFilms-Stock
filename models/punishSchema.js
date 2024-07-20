/** @format */

const { default: mongoose } = require("mongoose");

const punishSchema = new mongoose.Schema({
  userID: { type: String, require: true },
  username: { type: String, require: true },
  description: { type: String, require: true },
  type: { type: String, require: true },
  offence: { type: String, require: true },
  days: { type: Number, require: true, default: 0},
  lsaAgent: { type: String, require: true },
  hcApproval: { type: Boolean, default: false },
  date: {type: Date, required: true, default: Date.now()},
  caseID: { type: String, require: true },
  messageID: { type: String, require: true, default: "message" },
  appr_customID: { type: String, require: true, default: "id" },
  deny_customID: { type: String, require: true, default: "id" }


});

const punishModel = mongoose.model("punishmentlogs", punishSchema);

module.exports = punishModel;

