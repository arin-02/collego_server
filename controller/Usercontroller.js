const usermongoose = require("../models/Userschema");
const SendMail = require("../utils/SendMail");
const SendToken = require("../utils/SendToken");
const cloudinary = require("cloudinary");
const fs = require("fs");

const test=(req,res)=>{
  console.log("Testing")
  res.send("okkkk")
}
const registeringauth = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("-->", name, email, password);

    const avatar = req.files.avatar.tempFilePath;
    // console.log("===>", avatar);

    let user = await usermongoose.findOne({ email });
    console.log(user);
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const otp = Math.floor(Math.random() * 1000000);
    // console.log("cloudinary started...");
    const mycloud = await cloudinary.v2.uploader.upload(avatar, {
      folder: "CollegoAPP",
    });
    // console.log("publicid===>",mycloud.public_id);

    fs.rmSync("./tmp", { recursive: true });
    // expiry = 5 min
    user = await usermongoose.create({
      name,
      email,
      password,
      avatar: {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      },
      otp,
      otp_expiry: new Date(
        Date.now() + process.env.OTP_EXPIRE_IN_MINUTES * 60 * 1000
      ),
    });

    await SendMail(email, "OTP received (test mail)", `your otp is ${otp}`);
    // console.log("sending token start");
    SendToken(
      res,
      user,
      201,
      "OTP sent to your email,please verify your account"
    );
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "error registeringauth user" });
  }
};

const verification = async (req, res) => {
  console.log("inside verification");
  try {
    const otp = Number(req.body.otp);
    // console.log("===>", req.body, otp);
    const user = await usermongoose.findById(req.user._id);
    //  console.log("===>", user);
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "invalid otp " });
    } else if (user.otp_expiry < Date.now()) {
      return res.status(401).json({ success: false, message: "otp expired" });
    }
    user.verified = true;
    user.otp = null;
    user.otp_expiry = null;
    await user.save();

    SendToken(res, user, 200, "ACCOUNT VERIFIED SUCCESSFULLY");
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const loginauth = async (req, res) => {
  try {
    const { email, password } = req.body;
    // const avatar = req.files;
    console.log(email, password);
    const user = await usermongoose.findOne({ email });
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }
    console.log("=========>", user);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exists, please sign up",
      });
    }

    const isMatch = await user.comparePassword(password);
    console.log(isMatch);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Password is incorrect" });
    }
    SendToken(res, user, 200, "Login Successfull");
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "error registeringauth user" });
  }
};

const logoutauth = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
      })
      .json({ success: true, message: "logout successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "error registeringauth user" });
  }
};
const addTaskauth = async (req, res) => {
  try {
    const { title, description } = req.body;
    const user = await usermongoose.findById(req.user._id);
    user.tasks.push({
      title,
      description,
      completed: false,
      createdAt: new Date(Date.now()),
    });
    await user.save();

    res.status(200).json({ success: true, message: "Task successfully added" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "error registeringauth user" });
  }
};
const removeTaskAuth = async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = await usermongoose.findById(req.user._id);
    user.tasks = user.tasks.filter(
      (task) => task._id.toString() !== taskId.toString()
    );
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Task successfully removed" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "error registeringauth user" });
  }
};

const updateTaskAuth = async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = await usermongoose.findById(req.user._id);
    user.task = user.tasks.find(
      (task) => task._id.toString() === taskId.toString()
    );
    user.task.completed = !user.task.completed;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Task successfully Updated" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "error registeringauth user" });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const user = await usermongoose.findById(req.user._id);
    SendToken(res, user, 201, `Welcome back ${user.name}`);
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "error registeringauth user" });
  }
};
const updateProfileAuth = async (req, res) => {
  try {
    console.log("Updating profile")
    console.log(req.user)
    const user = await usermongoose.findById(req.user._id);
    console.log(`Welcome back ===>`,user);
    const { name } = req.body;

    const avatar = req.files.avatar.tempFilePath;

    if (name) user.name = name;

    if (avatar) {
      console.log("Uploading avatar=============",user.avatar);
       await cloudinary.v2.uploader.destroy(user.avatar.public_id);
      const mycloud = await cloudinary.v2.uploader.upload(avatar,{
        folder:"CollegoAPPupdating"
      });

      fs.rmSync("./tmp", { recursive: true });
      user.avatar = {
        publid_id: mycloud.public_id,
        url: mycloud.secure_url,
      };
      console.log("closing avatar=============")
    }

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "error registeringauth user" });
  }
};
const updatePasswordAuth = async (req, res) => {
  try {
    const user = await usermongoose.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      res
        .status(400)
        .json({ success: false, message: "Please enter Password fields" });
    }
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      res.status(400).json({ success: false, message: "Invalid Old password" });
    }
    user.password = newPassword;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Password Updated Successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "error updatePasswordAuth user" });
  }
};
const forgetPasswordAuth = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await usermongoose.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
    }
    const otp = Math.floor(Math.random() * 1000000);
    user.resetPasswordOtp = otp;
    //  10 min
    user.resetPasswordOtpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();
    const message = `your otp is ${otp} for resetting password,if you didnot request for this ,please ignore this email`;
    await SendMail(email, "Request to reset password ", message);
    // console.log("sending token start");

    res.status(200).json({ success: true, message: `OTP sent to ${email}` });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "error updatePasswordAuth user" });
  }
};
const resetPasswordAuth = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    console.log(otp, newPassword);
    const user = await usermongoose
      .findOne({
        resetPasswordOtp: otp,
        resetPasswordOtpExpiry: { $gt: Date.now() },
      })
      .select("+password");
    console.log("===>", user);
    if (!user) {
      res
        .status(400)
        .json({ success: false, message: "Otp invalid or has been expired" });
    }

    user.password = newPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpiry = null;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "error updatePasswordAuth user" });
  }
};
module.exports = {
  test,
  registeringauth,
  verification,
  loginauth,
  logoutauth,
  addTaskauth,
  removeTaskAuth,
  updateTaskAuth,
  getMyProfile,
  updateProfileAuth,
  updatePasswordAuth,
  forgetPasswordAuth,
  resetPasswordAuth,
};
