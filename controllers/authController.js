const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");
const Email = require("../utils/email");
const AppError = require("../utils/AppError");

exports.signup = async (req, res, next) => {
  try {
    console.log(req.body);
    const { email, password, passwordConfirm, first_name, last_name } =
      req.body;
    if (password !== passwordConfirm) {
      return next(new AppError("Passwords do not match", 400));
    }
    const user = await User.create({
      first_name,
      last_name,
      email,
      password,
      passwordConfirm,
    }); // create run on "save" middleware
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    user.password = undefined;
    user.passwordConfirm = undefined;
    // user.save(); don't do this to avoid reflection
    res.status(201).json({
      status: "success",
      data: {
        user,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("Enter Email or Password"));
    }
    const user = await User.findOne({
      email: email,
    }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Invalid Email or Password"), 400);
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    user.password = undefined;
    user.passwordConfirm = undefined;
    res.status(200).json({
      status: "success",
      data: {
        user,
        token,
      },
    });
  } catch (err) {
    console.log("error");
    console.log(err);
  }
};
exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return next(new AppError("You are not logged in"), 400);
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);
    const user = await User.findOne({ _id: decoded.id });
    user.password = undefined;
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
exports.getUser = async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({
      email: email,
    });
    if (!user) {
      return next(new AppError("No such User exists"), 400);
    }
    const resetToken = await user.createPasswordResetToken();
    // await user.save(); // error block yet to be implemented
    // SEND EMAIL via Node Mailer
    // const resetURL = `http://localhost:4000/resetPassword/${resetToken}`;
    const resetURL = ` https://blogger-world.vercel.app/resetPassword/${resetToken}`;

    const message = `Forgot your password ? submit a patch reqest with your new password click to ${resetURL}`;
    try {
      await new Email(user, resetURL).sendPasswordReset();
      res.status(200).json({
        status: "success",
        message: "Token send to email!",
      });
      await user.save({ validateBeforeSave: false });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError("There was an error in sending a mail"), 400);
    }
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(new AppError("Token Expired"), 400);
    }
    const { password, passwordConfirm } = req.body;
    if (password !== passwordConfirm) {
      return next(new AppError("Passwords do not match"));
    }
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    next(err);
  }
};
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    console.log(user);
    // 3 fields
    // 1.currentPassword
    if (
      !(await user.correctPassword(req.body.currentPassword, user.password))
    ) {
      return next(new AppError("Old Passwords do not match same"), 400);
    }
    // 2.newPassword
    // 3.newPasswordConfirm
    const { newPassword, newPasswordConfirm } = req.body;
    if (newPassword !== newPasswordConfirm) {
      return next(new AppError("Passwords do not match Same"), 400);
    }
    if (newPassword.length <= 8) {
      return next(
        new AppError("New Password must be greater than 8 characters")
      );
    }
    user.password = newPassword;
    user.passwordConfirm = newPassword;
    console.log("Hello");

    await user.save({ validateBeforeSave: false, new: true });
    user.password = undefined;
    user.passwordConfirm = undefined;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
