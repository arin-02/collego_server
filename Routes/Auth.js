const express = require("express");
const router = express.Router();

const {
  registeringauth,
  verification,
  loginauth,
  logoutauth,
  addTaskauth,
  updateTaskAuth,
  removeTaskAuth,
  getMyProfile,
  updateProfileAuth,
  updatePasswordAuth,
  forgetPasswordAuth,
  resetPasswordAuth,
  test
} = require("../controller/Usercontroller");
const { isAuthenticated } = require("../middlewares/Middleware");

router.get("/",test);
router.post("/register", registeringauth);
router.post("/verify", isAuthenticated, verification);
router.post("/login", loginauth);
router.get("/logout", logoutauth);
router.post("/addtask", isAuthenticated ,addTaskauth);
router.get("/task/:taskId", isAuthenticated,updateTaskAuth);
router.delete("/task/:taskId", isAuthenticated,removeTaskAuth);
router.get("/me", isAuthenticated ,getMyProfile);
router.put("/updateprofile",isAuthenticated,updateProfileAuth);
router.put("/updatepassword",isAuthenticated,updatePasswordAuth);
router.post("/forgotpassword", forgetPasswordAuth);
router.put("/resetpassword", resetPasswordAuth);


module.exports = router;
