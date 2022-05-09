const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const userSchema = new mongoose.Schema(
  {
    name:{ type: String, required: true,},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    twoFA: {type: Boolean, default: false},
    emailToken: {type: String},
    isEmailConfirmed: {type: Boolean, default: false}
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  // either we are creating a user or we are updating a user
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hashSync(this.password, 8);
  return next();
});

userSchema.methods.checkPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.generateJWTToken = function(){
  const payload = {
    name: this.name,
    email: this.email,
    isEmailConfirmed: this.isEmailConfirmed,
    twoFA: this.twoFA,
    id: this._id
  }
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: "1d"});
}

module.exports = mongoose.model("user", userSchema);