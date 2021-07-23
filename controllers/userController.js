const User = require("../model/userModel");
const cloudinary = require("../utils/cloudinary");
const multer = require("../utils/multer");

exports.updateMe = async (req, res, next) => {
  try {
    // req.user is my current user
    const updated_details = req.body;
    const filtered_updated_details = {};
    Object.keys(updated_details).forEach((obj) => {
      if (obj !== "password" && obj !== "passwordConfirm") {
        filtered_updated_details[obj] = updated_details[obj];
      }
    });
    console.log(filtered_updated_details);
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      filtered_updated_details,
      {
        runValidators: true,
        new: true,
      }
    );
    updatedUser.password = undefined;
    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { active: false });
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfilePhoto = async (req, res, next) => {
  try {
    // console.log(req);
    const result = await cloudinary.uploader.upload(req.file.path);
    const user = req.user;

    if (user.avatar) {
      await cloudinary.uploader.destroy(user.cloudinary_id);
    }
    const newUser = await User.findByIdAndUpdate(
      user._id,
      {
        avatar: result.secure_url,
        cloudinary_id: result.public_id,
      },
      { new: true }
    );
    res.status(200).json({
      status: "success",
      data: {
        newUser,
      },
    });
  } catch (err) {
    next(err);
  }
};
exports.deleteProfilePhoto = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.avatar) {
      await cloudinary.uploader.destroy(user.cloudinary_id);
    }
    user.avatar = undefined;
    user.cloudinary_id = undefined;
    await user.save({
      validateBeforeSave: false,
      new: true,
    });
    res.status(201).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
