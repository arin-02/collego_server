const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Userschema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "Password must be at least 8 characters long"],
    // select:false
  },
  avatar: {
    public_id: String,
    url: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tasks: [
    {
      title: String,
      description: String,
      completed: Boolean,
      createdAt: Date,
    },
  ],
  verified: {
    type: Boolean,
    default: false,
  },
  otp: Number,
  otp_expiry: Date,
  resetPasswordOtp:Number,
  resetPasswordOtpExpiry:Date,
});

Userschema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

Userschema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_COOKIE_EXPIRE*60*1000,
  });
};

Userschema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

Userschema.index({otp_expiry:1},{expireAfterSeconds:0});

const usermongoose = mongoose.model("otpcollection", Userschema);
module.exports = usermongoose;
