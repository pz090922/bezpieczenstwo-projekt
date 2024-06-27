export default function ProfilePicture({ user, size }) {
  return (
    <>
      {user.imagePath ? (
        <img
          src={`http://localhost:3001/Images/${user.imagePath}`}
          alt="fotka"
          className={`${size} object-cover rounded-full`}
        />
      ) : (
        <img
          src="/images/blank-profile-picture.webp"
          alt="fotka"
          className={`${size} rounded-full`}
        />
      )}
    </>
  );
}
