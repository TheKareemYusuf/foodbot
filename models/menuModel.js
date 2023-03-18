const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  command: {
    type: String,
    required: true,
    unique: true,
  },
  menuName: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const Menu = mongoose.model("Menu", menuSchema);

module.exports = Menu;
