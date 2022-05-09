require("dotenv").config();
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const User = require("../model/usermodel");

const mailgun = require("mailgun-js");
const DOMAIN = "sandbox69b5dc5ffa3249c5ba1cd331c4c08032.mailgun.org";
const mg = mailgun({ apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN });



const register = async (req, res) => {
  try {
    // first check if the email provided is already given to another user
    const { email } = req.body;
    let user = await User.findOne({ email: req.body.email }).lean().exec();

    // if yes then throw an  error 400 Bad Request
    if (user)
      return res
        .status(400)
        .send({ message: "User with that email already exists" });

    // if not then we will create the user
    // we will hash the password for the user
    const uniqueId = uuidv4();
    const userPayload = {
      emailToken: uniqueId,
      ...req.body,
    };
    user = await User.create(userPayload);
    const data = {
      from: "nonreply@hello.com",
      to: "gd184643@gmail.com",
      subject: "Hello",
      html: `
  <h2>Please click on given link to activate your account</h2>
  <p>${process.env.CLINT_URL}/authenticate/activate/${userPayload.emailToken}<p>
  `,
    };
    const emailStatus = await mg.messages().send(data);
    return res
      .status(200)
      .json({
        message: "Your account has been created! Please verify your account",
        status: true,
      });

    // we will create the token for the user
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    // first we will find the user with the email
    let user = await User.findOne({ email: req.body.email });

    // if user is not found then throw an error 400 Bad Request
    if (!user)
      return res
        .status(400)
        .send({status: false, message: "User is not found" });

    // if user found then try to match the password provided with the password in db
    const match = user.checkPassword(req.body.password);

    // if not match then throw an error 400 Bad Request
    if (!match)
      return res
        .status(400)
        .send({
          status: false,
          message: "Either Email or Password is incorrect",
        });

    // stateful => session on the server => cookie on the browser
    // stateless => nothing stored on the server

    // if password also matches then create a token
    const token = user.generateJWTToken();

    // return the token and the user details
    return res.status(201).send({ status: true, token });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};
const home = async (req, res) => {
  console.log(req.user);
  return res.status(200).json({ user: req.user });
};

const activateAccount = async (req, res) => {
  const { token } = req.body;
  const user = await User.findOneAndUpdate(
    { emailToken: token },
    { isEmailConfirmed: true, emailToken: null },
    { new: true }
  );
  if (user) {
    const token = user.generateJWTToken();
    return res.status(200).json({ status: true, token });
  }
  return res.status(404).json({ status: true, message: "Token is expired!" });
};
module.exports = { register, login, home, activateAccount };
