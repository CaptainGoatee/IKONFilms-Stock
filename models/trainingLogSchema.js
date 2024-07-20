/** @format */

const { default: mongoose } = require("mongoose");
const newTrainingSchema = new mongoose.Schema({
  membersTrained: { type: String, require: true  },
  membersScores: { type: String, require: true  },
  trainingNotes: { type: String, require: true  },
  trainer: { type: String, require: true  },
  attendance: { type: String, require: true  },
  date: { type: String, require: true  },
});


const trainingModel = mongoose.model("traininglogs", newTrainingSchema)



module.exports = trainingModel; 