/** @format */

const { default: mongoose, Schema, model } = require("mongoose");

const configSchema = new Schema({
  guildId: { type: String, default: "643065937116921876" },
  guildName: { type: String, default: "not-set" },
  notifyChannel: { type: String, default: "not-set" },
  welcomeChannel: { type: String, default: `not-set` },
  logChannel: { type: String, default: "not-set" },
  invite_link: { type: String, default: "not-set" },
  levelUpChannel: { type: String, default: "not-set" },
  gifRole: { type: String, default: "not-set" },
  ticketCategoryId: { type: String, default: "not-set" },
  });

module.exports = model("configs", configSchema);
