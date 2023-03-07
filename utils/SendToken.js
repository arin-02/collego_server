const SendToken =  (res, user, statuscode, message) => {
    console.log("in tokens")
  const token =  user.getJWTToken();
  const options = {
    expires:new Date(Date.now()+ process.env.JWT_COOKIE_EXPIRE * 60 * 1000),
    httpOnly:true
  };
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    tasks: user.tasks,
    verified:user.verified
  };
  return res
    .status(statuscode)
    .cookie("token", token, options)
    .json({ success: true, message:message, user: userData });
};

module.exports =  SendToken ;
