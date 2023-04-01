const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const { createServer } = require("http");
const { Server } = require("socket.io");
const server = createServer(app);
// const io = new Server(server);
const session = require("express-session");
const MongoStore = require("connect-mongo");

const CONFIG = require("./config/config");

// Connecting to MongoDB
const { connetToMongoDB } = require("./db");
connetToMongoDB();

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Creating the session store
const sessionStore = new MongoStore({
  mongoUrl: CONFIG.DATABASE_URL,
  collectionName: "sessions",
});

// Creating the session middleware
const sessionMiddleWare = session({
  secret: CONFIG.SECRET_KEY,
  resave: true,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
  },
});

app.use(sessionMiddleWare);

app.use(express.static("public"));


// Creating a request object so we can have access to "req"
const io = new Server(server, {
  allowRequest: (req, callback) => {
    // with HTTP long-polling, we have access to the HTTP response here, but this is not
    // the case with WebSocket, so we provide a dummy response object
    const fakeRes = {
      getHeader() {
        return [];
      },
      setHeader(key, values) {
        req.cookieHolder = values[0];
      },
      writeHead() {},
    };
    sessionMiddleWare(req, fakeRes, () => {
      if (req.session) {
        // trigger the setHeader() above
        fakeRes.writeHead();
        // manually save the session (normally triggered by res.end())
        req.session.save();
      }
      callback(null, true);
    });
  },
});

io.engine.on("initial_headers", (headers, req) => {
  if (req.cookieHolder) {
    headers["set-cookie"] = req.cookieHolder;
    delete req.cookieHolder;
  }
});

// Requiring the menu options
const menuOptions = require('./models/menuModel');

const pattern = /^1[1-9]$/;
io.on("connection", (socket) => {
  console.log("a user connected");
  const req = socket.request;
  // console.log(req);
  socket.join(req.session.id);
  console.log(req.session.id);

  socket.on("chat message", (userMessage) => {
    console.log("message: " + userMessage);
    req.session.reload((err) => {
      let botResponse;
      // if (err) {
      //   // session has expired
      //   return socket.disconnect();
      // }
      let orderHistory = req.session.orderHistory;
      let menuChoice = req.session.menuChoice;
      if (userMessage === "1") {
        botResponse = `Please select an option from the menu:\n `;
        menuOptions.forEach((option) => {
          botResponse += `Select ${option.command}: ${option.name} - N${option.price}, \n`;
        });
      } else if (pattern.test(userMessage)) {
        // userMessage = selectedOption
        const selectedOption = menuOptions.find(
          (option) => option.command === userMessage
        );
        if (selectedOption) {
          req.session.menuChoice = selectedOption;
          req.session.save(() => {
            menuChoice;
          });
          botResponse = `You selected ${selectedOption.name} for N${selectedOption.price}. Please type 99 to checkout your order.`;
        } else {
          botResponse =
            "Your option is not available, press 1 to place your order";
        }
      } else if (userMessage === "97") {
        if (menuChoice) {
          botResponse = `Here is your current order: Name: ${menuChoice.name}  Price: N${menuChoice.price}`;
        }
      } else if (userMessage === "98") {
        // req.session.orderHistory = [];
        if (orderHistory) {
          botResponse = `Here is your order history:\n `;
          orderHistory.forEach((option) => {
            botResponse += `${option.name} - N${option.price} \n`;
          });
        }
      } else if (userMessage === "99") {
        if (menuChoice) {
          orderHistory.push(menuChoice);
          req.session.save(() => {
            orderHistory;
          });
          botResponse = "Your food is on its way! Thank you for your patronage.";
        }
      } else if (userMessage === "0") {
        if (menuChoice) {
          cancelledOrder = orderHistory.pop()
          req.session.save(() => {
            orderHistory;
          });
          botResponse = `Your order to buy ${cancelledOrder.name} has been cancelled`;
        }
      } else {
        botResponse = "I did not understand your message. Please try again.";
      }
      io.emit("chat message", botResponse);
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(CONFIG.PORT || 8000, () => {
  console.log("listening on *:8000");
});

module.exports = app;
