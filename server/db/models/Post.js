const mongoose = require("mongoose");
const yup = require("yup");

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imagePath: {
      type: String,
      require: true,
    },
    content: {
      type: String,
      maxLength: [200, "Post nie może mieć więcej niż 200 znaków"],
      text: true,
    },
    comments: [CommentSchema],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    privacy: {
      type: String,
      enum: ["public", "private", "friends"],
      default: "public",
    },
  },
  { collection: "posts", timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);
const Comment = mongoose.model("Comment", CommentSchema);
module.exports = { Post, Comment };
