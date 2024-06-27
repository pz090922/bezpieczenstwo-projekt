import React, { useState } from "react";
import ModalPost from "../ModalPost/ModalPost";
export default function ProfilePosts({ posts, setReload }) {
  const [showModal, setShowModal] = useState(false);
  const [clickedPost, setClickedPost] = useState(null);
  return (
    <div className="flex w-full">
      <ul className="grid grid-cols-3 gap-1 w-full">
        {posts.map((post) => (
          <li key={post._id}>
            <img
              src={`http://localhost:3001/Images/${post.imagePath}`}
              alt="fotka"
              className="object-cover aspect-square cursor-pointer hover:brightness-50"
              onClick={() => {
                setClickedPost(post);
                setShowModal(true);
              }}
            />
          </li>
        ))}
      </ul>
      <ModalPost
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        post={clickedPost}
        setReload={() => setReload(true)}
      />
    </div>
  );
}
