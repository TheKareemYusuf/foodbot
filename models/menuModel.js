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
const menuOptions = [
  { id: 1, command: "11", name: "Rice, Beans and Dodo", price: 2000 },
  { id: 2, command: "12", name: "Bread, Beans and Dodo", price: 2000 },
  { id: 3, command: "13", name: "Amala, Ewedu with Goat Meat", price: 3000 },
  { id: 4, command: "14", name: "Semo and Egusi with Fish", price: 3000 },
];


module.exports = menuOptions