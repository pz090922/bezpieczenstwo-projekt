const express = require("express");
const router = express.Router();
const userActions = require("../actions/api/userActions");
const postActions = require("../actions/api/postActions");
const multer = require("multer");
const uploadMiddleware = require("../upload");

// UserActions

router.post("/getUserInfoByToken", userActions.getUserInfoByToken);
// router.put("/profile/update/name", userActions.updateUserName);
// router.put("/profile/update/password", userActions.updateUserPassword);
router.put("/profile/update/gender", userActions.updateUserGender);
router.post("/login",  userActions.signInCallback)
///
router.put(
  "/profile/update/image",
  uploadMiddleware,
  userActions.updateUserImage
);
router.delete("/profile/delete", userActions.deleteUser);
router.get("/:username", userActions.getUserByUsername);
router.put("/:username/follow", userActions.followUser);
router.put("/:username/unfollow", userActions.unfollowUser);
router.get("/:username/followers", userActions.getFollowersByUsername);
router.get("/:username/following", userActions.getFollowingByUsername);
router.post("/dashboard/users", userActions.getFiveRandomUsers);
router.get("/search/search", userActions.getUsersByQuery);
// router.put("/import/:id", userActions.importProfile);
// router.get("/export/:id", userActions.exportProfile);
// router.post("/post/getOwner", userActions.getUserById);
//PostActions
router.post("/post", uploadMiddleware, postActions.createPost);
router.post("/post/get", postActions.getAllPosts);
router.post("/post/get/other", postActions.getPostsFromProfile);
router.post("/post/get/single", postActions.getPostWithDetails);
router.put("/post/comment", postActions.CreateAndAddComment);
router.put("/post/like", postActions.AddOrRemoveLike);
router.put("/post", postActions.editPost);
router.delete("/post", postActions.deletePost);
router.post("/dashboard", postActions.getPostOnDashboard);
module.exports = router;
