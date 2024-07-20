/** @format */

const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  bookingId: { type: String, required: true },
  vrf: { type: String, required: true },
  vrm: { type: String, required: true },
  customerName: { type: String, required: true },
  customerType: { type: String },
  premium: { type: Boolean },
  source: { type: String },
  status: { type: String },
  slotTime: { type: String, required: true },
  jobTime: { type: String, required: true },
  jobType: { type: String, required: true },
  description: { type: String, required: true },
  loyaltyTier: { type: String },
  technician: { type: String, default: "Not Assigned" },
});

module.exports = jobSchema;
