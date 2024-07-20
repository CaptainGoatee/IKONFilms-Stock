/** @format */

const mongoose = require("mongoose");
function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: false,
    default: "not-set" + makeid(14),
  },
  discordId: {
    type: String,
    required: true,
    unique: false,
    default: "not-set",
  },
  displayName: { type: String, required: true },
  hashed_password: {
    type: String,
    required: true,
    select: false,
    default: "not-set" + makeid(14),
  },
  email: {
    type: String,
    required: true,
    unique: true,
    default: "not-set" + makeid(14),
  },
  phoneNumber: { type: String, required: false, unique: false, default: ""},
  badge: { type: String, required: false, unique: false },
  payroll: {
    type: String,
    required: true,
    unique: true,
    default: "not-set" + makeid(14),
  },
  salt: { type: Buffer, require: true },
  access: { type: String, default: null },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
