/** @format */

const { default: mongoose } = require("mongoose");
const newTicketSchema = new mongoose.Schema({
  memberAssisted: { type: String, require: true  },
  ticketLink: { type: String, require: true  },
  ticketReason: { type: String, require: true  },
  agent: { type: String, require: true  },
  date: { type: String, require: true  },
  interactionID: { type: String, require: true  },
  ticketLogID: { type: String, require: true  },
});


const ticketModel = mongoose.model("ticketlogs", newTicketSchema)


module.exports = ticketModel;
