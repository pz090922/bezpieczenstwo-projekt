import React from "react";
import ProfilePicture from "../ProfilePicture/ProfilePicture";
import { useNavigate } from "react-router-dom";
export default function ModalUserList({
  isVisible,
  onClose,
  users,
  title,
  onMove,
}) {
  const navigate = useNavigate();
  if (!isVisible) return null;
  return (
    <div className="fixed text-white inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center">
      <div className="flex flex-col w-[400px] bg-zinc-800 rounded-2xl p-4">
        <div className="flex justify-between items-center font-bold border-b border-zinc-600 pb-3">
          <div></div>
          <p>{title}</p>
          <button
            className="text-white font-bold place-self-end"
            onClick={() => onClose()}
          >
            X
          </button>
        </div>
        <ul className="flex flex-col gap-5 pt-3 overflow-y-auto">
          {users.map((user) => (
            <li
              key={user.username}
              className="flex items-center font-bold gap-3 cursor-pointer hover:bg-zinc-700 p-1 rounded"
              onClick={() => {
                navigate(`/${user.username}`);
                onMove();
                onClose();
              }}
            >
              <ProfilePicture user={user} size="h-8 w-8" />
              {user.username}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
