import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfilePicture from "../ProfilePicture/ProfilePicture";
import { useUser } from "../../context/userContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import ModalUserList from "../ModalUserList/ModalUserList";
import { useKeycloak } from "@react-keycloak/web";

export default function ProfileHeader({ userData, posts, onMove }) {
  const { keycloak} = useKeycloak();
  const { user, setUser } = useUser();
  const [isProfileOwner, setIsProfileOwner] = useState(true);
  const [isFollowed, setIsFollowed] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  useEffect(() => {
    if (user._id !== userData._id) {
      setIsProfileOwner(false);
      if (user.following.includes(userData._id)) {
        setIsFollowed(true);
      } else {
        setIsFollowed(false);
      }
    } else {
      setIsProfileOwner(true);
    }
  }, [user._id, user.following, userData._id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const followers = await axios.get(
          `${process.env.REACT_APP_API_URL}/${userData.username}/followers`, {
            headers: {
              Authorization: `Bearer ${keycloak.token}`
            }
          }
        );
        const following = await axios.get(
          `${process.env.REACT_APP_API_URL}/${userData.username}/following`, {
            headers: {
              Authorization: `Bearer ${keycloak.token}`
            }
          }
        );
        const newFollowersList = followers.data.followersList;
        setFollowers(newFollowersList);
        setFollowing(following.data.followingList);
      } catch (error) {
        console.log(error);
      }
    };

    if (userData.username) {
      fetchData();
    }
  }, [userData.username]);

  const toggleFollow = async () => {
    try {
      let response;
      if (!isFollowed) {
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/${userData.username}/follow`,
          { sub: keycloak.tokenParsed.sub },
          {
            headers: {
              Authorization: `Bearer ${keycloak.token}`
            }
          }
        );
      } else {
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/${userData.username}/unfollow`,
          { sub: keycloak.tokenParsed.sub },
          {
            headers: {
              Authorization: `Bearer ${keycloak.token}`
            }
          }
        );
      }
      const user = await axios.post(
        `${process.env.REACT_APP_API_URL}/getUserInfoByToken`,
        { data: {sub: keycloak.tokenParsed.sub} }, {
          headers: {
            Authorization: `Bearer ${keycloak.token}`
          }
        }
      );
      setUser(user.data.user);
      toast.success(response.data.message);
    } catch (error) {
      toast.error("Coś poszło nie tak");
      console.log(error);
    }
  };
  const [showModalFollowers, setShowModalFollowers] = useState(false);
  const [showModalFollowing, setShowModalFollowing] = useState(false);
  const navigate = useNavigate();
  return (
    <header className="flex w-full text-white pb-10">
      <div className="flex basis-2/5 justify-center mr-10">
        <ProfilePicture user={userData} size="h-40 w-40" />
      </div>
      <div className="flex flex-col basis-3/5 gap-5">
        <div className="flex gap-10 items-center w-full">
          <p className="text-xl font-semibold">{userData.username}</p>
          {isProfileOwner ? (
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/profile/edit")}
                className="bg-zinc-800 pt-2 pb-2 pl-4 pr-4 font-bold text-sm rounded-lg hover:bg-zinc-700"
              >
                Edytuj profil
              </button>
              <button className="bg-zinc-800 pt-2 pb-2 pl-4 pr-4 font-bold text-sm rounded-lg hover:bg-zinc-700">
                Wyświetl archiwum
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              {isFollowed ? (
                <button
                  onClick={toggleFollow}
                  className="bg-zinc-800 pt-2 pb-2 pl-4 pr-4 font-bold text-sm rounded-lg hover:bg-zinc-700"
                >
                  Przestań obserwować
                </button>
              ) : (
                <button
                  onClick={toggleFollow}
                  className="bg-zinc-800 pt-2 pb-2 pl-4 pr-4 font-bold text-sm rounded-lg hover:bg-zinc-700"
                >
                  Obserwuj
                </button>
              )}
              <button className="bg-zinc-800 pt-2 pb-2 pl-4 pr-4 font-bold text-sm rounded-lg hover:bg-zinc-700">
                Wyślij wiadomość
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center w-full">
          <div className="mr-8">
            Posty: <strong>{posts}</strong>
          </div>
          <div
            className="mr-8 cursor-pointer"
            onClick={() => setShowModalFollowing(true)}
          >
            Obserwujących: <strong>{userData.followers.length}</strong>
          </div>
          <div
            className="cursor-pointer"
            onClick={() => setShowModalFollowers(true)}
          >
            Obserwowani: <strong>{userData.following.length}</strong>
          </div>
        </div>
        <div className="flex items-center w-full">
          <div className="flex text-sm font-bold gap-1">
            <div>{userData.firstName}</div>
            <div>{userData.lastName}</div>
          </div>
        </div>
      </div>
      <ModalUserList
        isVisible={showModalFollowing}
        onClose={() => setShowModalFollowing(false)}
        users={followers}
        title="Obserwujący"
        onMove={() => onMove()}
      />
      <ModalUserList
        isVisible={showModalFollowers}
        onClose={() => setShowModalFollowers(false)}
        users={following}
        title="Obserwowani"
        onMove={() => onMove()}
      />
    </header>
  );
}
