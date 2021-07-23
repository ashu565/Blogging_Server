const mongoose = require("mongoose");
const crypto = require("crypto");
const bcryptjs = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "Invalid First Name"],
    },
    last_name: {
      type: String,
      required: [true, "Invalid Last Name"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Invalid Email Address"],
    },
    password: {
      type: String,
      minLength: [8, "A Password Must not be less than 8 character"],
      required: [true, "Invalid Password"],
      select: false,
    },
    passwordConfirm: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    avatar: {
      type: String,
    },
    cloudinary_id: {
      type: String,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcryptjs.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre(/^find/, function (next) {
  this.find({
    active: { $ne: false },
  });
  next();
});
userSchema.methods.correctPassword = async function (
  typed_password,
  user_password
) {
  return await bcryptjs.compare(typed_password, user_password);
};
userSchema.methods.createPasswordResetToken = function () {
  // console.log(a);
  const resetToken = crypto.randomBytes(32).toString("hex");
  // hashing
  console.log(resetToken);
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
