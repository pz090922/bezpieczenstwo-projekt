const { Post, Comment } = require("../../db/models/Post");
const fs = require("fs").promises;
const path = require("path");
const User = require("../../db/models/User");
const { token } = require("../../config");
const jwt = require("jsonwebtoken");

class PostActions {
  async createPost(req, res) {
    if (!req.body || !req.body.sub || !req.file?.filename)
      return res.status(400).json({ error: "Musisz podać dane!" });
    const { text, privacy } = req.body;
    const sub = req.body.sub;
    const imageName = req.file?.filename || "";
    if (!sub || !privacy || imageName === "") {
      return res.status(400).json({ error: "Brak wystarczających danych" });
    }
    if (
      privacy !== "private" &&
      privacy !== "friends" &&
      privacy !== "public"
    ) {
      return res.status(400).json({ error: "Nie ma takiego rodzaju posta" });
    }
    try {
      const user = await User.findOne({sub});
      const newPost = new Post({
        owner: user._id,
        content: text,
        privacy,
        imagePath: imageName,
      });
      await newPost.save();
      return res.status(201).json({ message: "Pomyślnie utworzono post" });
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ error: error.errors[0] });
      }
      return res.status(400).json({ error });
    }
  }

  async getAllPosts(req, res) {
    if (!req.body.sub)
      return res.status(400).json({ error: "Musisz podać dane!" });
    const sub = req.body.sub;
    try {
      const user = await User.findOne({ sub });
      const posts = await Post.find({ owner: user._id });
      return res.status(200).json({ posts });
    } catch (err) {
      return res.status(400).json({ error: err });
    }
  }

  async getPostWithDetails(req, res) {
    if (!req.body.id) return res.status(400).json({ error: "Brak id!" });
    const { id } = req.body;
    try {
      const post = await Post.findById(id)
        .populate({
          path: "owner",
          select: ["_id", "username", "imagePath"],
        })
        .populate({
          path: "comments",
          populate: {
            path: "owner",
            select: ["_id", "username", "imagePath"],
          },
        })
        .exec();

      return res.status(200).json({ post });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  }

  async CreateAndAddComment(req, res) {
    if (!req.body.id || !req.body.sub || !req.body.comment)
      return res
        .status(400)
        .json({ error: "Brak id, użytkownika lub komentarza" });
    try {
      const { id, sub, comment } = req.body;
      const user = await User.findOne({sub})
      if (comment && comment.trim().length === 0) {
        return res.status(400).json({ error: "" });
      }
      const newComment = new Comment({
        text: comment,
        owner: user._id,
      });
      await newComment.save();
      await Post.findByIdAndUpdate(
        id,
        { $push: { comments: newComment } },
        { new: true }
      );
      return res.status(201).json({ newComment });
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  async AddOrRemoveLike(req, res) {
    if (!req.body.postId || !req.body.sub)
      return res
        .status(400)
        .json({ error: "Użytkownika lub komentarza" });
    const { postId, sub } = req.body;
    try {
      const currentUser = await User.findOne({sub});
      if (!currentUser) {
        return res.status(400).json({ error: "Brak użytkownika" });
      }
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(400).json({ error: "Nie znaleziono posta" });
      }
      if (post.likes.includes(currentUser._id)) {
        await post.updateOne({
          $pull: { likes: currentUser._id },
        });
        return res.status(201).json({ message: "Przestałeś lubić post" });
      } else {
        await post.updateOne({ $push: { likes: currentUser._id } });
        return res.status(201).json({ message: "Polubiłeś post" });
      }
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  async getPostsFromProfile(req, res) {
    if (!req.body.sub || !req.body.username)
      return res.status(400).json({ error: "Brak id usera!" });
    const username = req.body.username;
    const sub = req.body.sub
    if (!username) {
      return res.status(400).json({ error: "Brakuje nazwy użytkownika" });
    }
    try {
      const user = await User.findOne({ sub });
      const owner = await User.findOne({ username });
      if (user.following.includes(owner._id)) {
        const posts = await Post.find({
          owner: owner._id,
          privacy: { $in: ["public", "friends"] },
        });
        return res.status(200).json({ posts });
      } else {
        const posts = await Post.find({
          owner: owner._id,
          privacy: { $in: ["public"] },
        });
        return res.status(200).json({ posts });
      }
    } catch (err) {
      // console.log(err)
      return res.status(400).json({ error: err });
    }
  }

  async editPost(req, res) {
    if (!req.body.token || !req.body.id || !req.body.privacy)
      return res.status(400).json({ error: "Brak wszystkich danych" });
    const userToken = req.body.token;
    const { id, privacy, content } = req.body;
    try {
      const verified = jwt.verify(userToken, token);
      const user = await User.findById(verified.id);
      const post = await Post.findById(id);
      if (post.owner.toString() !== user._id.toString()) {
        return res
          .status(400)
          .json({ error: "Nie jesteś właścicielem tego posta!" });
      }
      if (privacy === post.privacy && content === post.content) {
        return res
          .status(400)
          .json({ error: "Nic nie zmieniłeś w tym poście!" });
      }
      await post.updateOne({
        privacy: privacy,
        content: content,
      });
      return res.status(200).json({ message: "Pomyślnie zedytowałeś post" });
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  async deletePost(req, res) {
    if (!req.body.token || !req.body.id) {
      return res.status(400).json({ error: "Brak wszystkich danych" });
    }
    const id = req.body.id;
    const userToken = req.body.token;
    try {
      const verified = jwt.verify(userToken, token);
      const user = await User.findById(verified.id);
      const post = await Post.findById(id);
      if (!post) {
        return res.status(400).json({ error: "Post nie istnieje" });
      }
      if (post.owner.toString() !== user._id.toString()) {
        return res
          .status(400)
          .json({ error: "Nie jesteś właścicielem tego posta!" });
      }
      const imagePathToDelete = path.join(
        __dirname,
        "../../public/Images",
        post.imagePath
      );
      await fs.unlink(imagePathToDelete);
      await post.deleteOne();
      return res.status(201).json({ message: "Pomyślnie usunięto post" });
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  async getPostOnDashboard(req, res) {
    if (!req.body.user) {
      return res.status(400).json({ error: "Nie ma usera" });
    }
    const user = req.body.user;
    try {
      const posts = await Post.aggregate([
        {
          $match: {
            privacy: { $in: ["public", "friends"] },
          },
        },
        {
          $addFields: {
            ownerString: { $toString: "$owner" },
          },
        },
        {
          $match: {
            ownerString: { $in: user.following.map((id) => id.toString()) },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
          },
        },
        {
          $project: {
            ownerString: 0,
          },
        },
      ]);
      return res.status(200).json({ posts });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  }
}
module.exports = new PostActions();
