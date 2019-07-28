var mongoose = require("mongoose");

var gearSchema = new mongoose.Schema({
  brand: String,
  img: String,
  gender: String,
  size: String,
  condition: String,
  author: {
    id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment"
    }
  ],
  likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
  shipVia: String,
  location: String
});

module.exports = mongoose.model("gear", gearSchema);
