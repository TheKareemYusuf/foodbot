const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const { createServer } = require("http");
const { Server } = require("socket.io");
const server = createServer(app);
const io = new Server(server);

const CONFIG = require("./config/config");

const { connetToMongoDB } = require("./db");
connetToMongoDB();

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("public"));

menuOptions = [
  { id: 1, command: "11", name: "Rice, beans and dodo", price: 2000 },
  { id: 2, command: "12", name: "Bread, beans and dodo", price: 2000 },
  { id: 3, command: "13", name: "Amala, ewedu and goat meat", price: 3000 },
];

const pattern = /^1[1-9]$/;
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("chat message", (userMessage) => {
    console.log("message: " + userMessage);
    let botResponse;
    if (userMessage === "1") {
      botResponse = `Please select an option from the menu:\n `;
      menuOptions.forEach((option) => {
        botResponse += `Select ${option.command}: ${option.name} - ${option.price} Naira \n`;
      });
    } else if (pattern.test(userMessage)){
      // userMessage = selectedOption
      const selectedOption = menuOptions.find(option => option.command === userMessage);
      if (selectedOption) {
        botResponse = `You selected ${selectedOption.name} for ${selectedOption.price} Naira. Please type 99 to checkout your order.`;
      } else {
        botResponse = 'Your option is not available, press 1 to place your order'
      }
      } else if (userMessage === "97") {
      botResponse = "Here is your current order";
    } else if (userMessage === "98") {
      botResponse = "Here is your order history";
    } else if (userMessage === "99") {
      botResponse = "Thank you for shopping with us!";
    } else if (userMessage === "0") {
      botResponse = "Your order has been cancelled";
    } else {
      botResponse = "I did not understand your message. Please try again.";
    }

    io.emit("chat message", botResponse);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(CONFIG.PORT || 8000, () => {
  console.log("listening on *:8000");
});

module.exports = app;
