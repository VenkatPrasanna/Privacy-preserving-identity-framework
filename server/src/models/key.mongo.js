const mongoose = require("mongoose");

const keysSchema = new mongoose.Schema({
  dataid: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Key", keysSchema);
