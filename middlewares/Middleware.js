const jwt = require("jsonwebtoken");
const usermongoose = require("../models/Userschema");

const isAuthenticated = async (req, res, next) => {
  try {
    console.log("inside isAuthenticated");
    const { token } = req.cookies;
    console.log(token);
    if (!token) {
      console.log("login first inside isAuthenticated");
      return res
        .status(401)
        .json({ success: false, message: "Please login first" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded", decoded);
    req.user = await usermongoose.findById(decoded._id);
    console.log("end isauthenticated and req.user", req.user);
    next();
  } catch (err) {
    res.status(501).json({ success: false, message: err.message });
  }
};
module.exports = { isAuthenticated };
