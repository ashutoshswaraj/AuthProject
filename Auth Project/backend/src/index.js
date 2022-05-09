require("dotenv").config();

const express = require("express");
const app = express();
app.use(express.json())
const connect = require("./config/db");
connect();
const passport = require("passport");
app.use(passport.initialize());
require("./middleware/authenticate");

const { register, login,home,activateAccount } = require("./controller/authcontroller");




app.post("/register", register);
app.post("/login", login);
app.get("/home", passport.authenticate('jwt',{session: false}) ,home)
app.post("/emailactivate", activateAccount);

// console.log(process.env)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("SERVER IS CONNECTED TO " + PORT));

// module.exports = app;
