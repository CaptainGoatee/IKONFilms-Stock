const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  discordId: String,
  username: String,
  discriminator: String,
  avatar: String,
  isStaff: {type: Boolean, default: false},
  superAdmin: {type: Boolean, default: false},
});

module.exports = mongoose.model('user', UserSchema);
