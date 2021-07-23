const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    // user,blog,createdAt,likes,comment
    comment: {
      type: String,
      required: [true, "Comment cannot be empty"],
    },
    blog: {
      type: mongoose.Schema.ObjectId,
      ref: "Blog",
      required: [true, "A comment must belong to a blog"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    Likes: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
commentSchema.pre("save", function (next) {
  this.populate({
    path: "user",
    select: "first_name last_name email",
  });
  next();
});
commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "first_name last_name",
  });
  next();
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
