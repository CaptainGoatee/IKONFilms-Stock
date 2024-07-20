/** @format */

const { default: mongoose } = require("mongoose");


const addUserSchema = new mongoose.Schema({
  userID: { type: String, require: true, unique: true },
  userName: { type: String, require: true, unique: false },
  userLoa: { type: Boolean, default: false },
  userExempt: { type: Boolean, default: false },
  notOnTeam: { type: Boolean, default: false },
  userSuspended: { type: Boolean, default: false },
  joinDate: {type: Date, required: true, default: Date.now()},
  strikes: { type: Number, default: 0 },
  sentToRetrain: { type: Boolean, default: false },
  rank: { type: String, require: true, default: "Agent" },
});

//mongoose.model("", add)

const agentModel = mongoose.model("agents", addUserSchema);

module.exports = agentModel;