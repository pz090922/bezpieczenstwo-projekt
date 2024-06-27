const User = require("../../db/models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const yup = require("yup");
const fs = require("fs").promises;
const path = require("path");

class UserActions {
  async signInCallback(req,res) {
    try {
      if (!req.body) return res.status(400).json({ error: "Musisz podać dane!" });
      const { sub, preferred_username, given_name, family_name, email} = req.body.data;
      const userExsists = await User.findOne({ sub });
      if (!userExsists) {
       const newUser = new User({
          sub: sub,
          username: preferred_username,
          firstName: given_name,
          lastName: family_name,
          email: email,
        });
        await newUser.save();
      } else {
      }
    } catch (error) {
      console.error(error)
    }
  }
  
  async getUserInfoByToken(req, res) {
    try {
      if (!req.body)
        return res.status(400).json({ error: "Brak danych!" });
      const { sub } = req.body.data
      const user = await User.findOne({ sub });
      if (!user) {
        return res.status(404).json({ error: "Użytkownik nie istnieje" });
      }
      return res.status(200).json({ user });
    } catch (err) {
      return res.status(400).json({ error: err });
    }
  }

  async updateUserPassword(req, res) {
    const passwordValidationSchema = yup
      .string()
      .required("Pole nie może być puste")
      .min(8, "Hasło musi mieć conajmniej 8 znaków");

    try {
      if (!req.body.token || !req.body.password)
        return res
          .status(400)
          .json({ error: "Token wygasł lub niepodano danych" });
      const userToken = req.body.token;
      const password = req.body.password;
      await passwordValidationSchema.validate(password);
      const hashedPassword = await bcrypt.hash(password, 10);
      const verified = jwt.verify(userToken, token);
      const user = await User.findOneAndUpdate(
        { _id: verified.id },
        {
          $set: {
            password: hashedPassword,
          },
        },
        { new: true }
      );
      return res.status(201).json({ user });
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ error: error.errors[0] });
      }
      return res.status(400).json({ error });
    }
  }

  async updateUserName(req, res) {
    if (!req.body.token || !req.body.firstName || !req.body.lastName)
      return res
        .status(400)
        .json({ error: "Token wygasł lub niepodano danych" });
    const userToken = req.body.token;
    const { firstName, lastName } = req.body;
    const nameValidationSchema = yup
      .string()
      .required("Pole nie może być puste")
      .matches(
        /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/,
        "Musi składać sie z samych liter!"
      );
    try {
      await nameValidationSchema.validate(firstName);
      await nameValidationSchema.validate(lastName);
      const verified = jwt.verify(userToken, token);
      const user = await User.findOneAndUpdate(
        { _id: verified.id },
        {
          $set: {
            firstName: firstName,
            lastName: lastName,
          },
        },
        { new: true }
      );
      return res.status(201).json({ user });
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ error: error.errors[0] });
      }
      return res.status(400).json({ error });
    }
  }

  async updateUserGender(req, res) {
    if (!req.body.sub || !req.body.gender)
      return res
        .status(400)
        .json({ error: "Token wygasł lub niepodano danych" });
    const sub = req.body.sub;
    const gender = req.body.gender;
    const genderValidationSchema = yup
      .string()
      .required("Płeć jest wymagana")
      .oneOf(["male", "female", "other"], "Nie ma takiej płci");

    try {
      await genderValidationSchema.validate(gender);
      const user = await User.findOneAndUpdate(
        { sub },
        {
          $set: {
            gender: gender,
          },
        },
        { new: true }
      );
      return res.status(201).json({ user });
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({ error: error.errors[0] });
      }
      return res.status(400).json({ error });
    }
  }
  updateUserImage(req, res) {
    if (!req.body.sub) {
      return res.status(400).json({ error: "Brak id usera" });
    }
    if (!req.body.delete && !req.file) {
      return res.status(400).json({ error: "Brak pliku" })
    }
    const sub = req.body.sub;
    const imageName = req.file?.filename || "";
    User.findOne({ sub })
      .then(async (currentUser) => {
        if (currentUser.imagePath !== "") {
          try {
            const imagePathToDelete = path.join(
              __dirname,
              "../../public/Images",
              currentUser.imagePath
            );
            await fs.unlink(imagePathToDelete);
          } catch (error) {
            return res.status(400).json({ error });
          }
        }

        if (currentUser.imagePath === "" && imageName === "") {
          return res
            .status(400)
            .json({ error: "Nie możesz usunąć zdjęcia, którego nie masz!" });
        }

        return User.findOneAndUpdate(
          { _id: currentUser._id },
          {
            $set: {
              imagePath: imageName,
            },
          },
          { new: true }
        );
      })
      .then((user) => {
        return res.status(201).json({ user });
      })
      .catch((error) => {
        if (error.errors) {
          return res.status(400).json({ error: error.errors[0] });
        }
        return res.status(400).json({ error });
      });
  }

  async deleteUser(req, res) {
    if (!req.body.token)
      return res.status(400).json({ error: "Token wygasł!" });
    const userToken = req.body.token;
    try {
      const verified = jwt.verify(userToken, token);
      const currentUser = await User.findById(verified.id);
      if (currentUser.imagePath !== "") {
        const imagePathToDelete = path.join(
          __dirname,
          "../../public/Images",
          currentUser.imagePath
        );
        await fs.unlink(imagePathToDelete);
      }
      await User.deleteOne({ _id: verified.id });
      return res
        .status(201)
        .json({ message: "Pomyślnie usunięto użytkownika" });
    } catch (error) {
      return res.status(400).json({ error });
    }
  }

  async getUserByUsername(req, res) {
    try {
      const username = req.params.username;
      if (!username) {
        return res.status(400).json({ error: "Nie podano nazwy użytkownika" });
      }
      const userExsists = await User.findOne({ username });
      if (!userExsists) {
        return res.status(404).json({ error: "Nie ma takiego użytkownika" });
      }
      return res.status(200).json(userExsists);
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  async followUser(req, res) {
    if (!req.body.sub)
      return res.status(400).json({ error: "Brak id usera" });
    const sub = req.body.sub;
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ error: "Nie podano nazwy użytkownika" });
    }
    try {
      const currentUser = await User.findOne({ sub });
      const userToFollow = await User.findOne({ username });
      if (!userToFollow) {
        return res.status(404).json({ error: "Użytkownik nie istnieje" });
      }
      if (currentUser.following.includes(userToFollow._id)) {
        return res
          .status(404)
          .json({ error: "Obserwujesz już tego użytkownika!" });
      }
      await userToFollow.updateOne({ $push: { followers: currentUser._id } });
      await currentUser.updateOne({ $push: { following: userToFollow._id } });
      return res.status(200).json({ message: "Pomyślnie zaobserwowano" });
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  async unfollowUser(req, res) {
    if (!req.body.sub)
      return res.status(400).json({ error: "Brak id usera" });
    const sub = req.body.sub;
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ error: "Nie podano nazwy użytkownika" });
    }
    try {
      const currentUser = await User.findOne({ sub });
      const userToUnfollow = await User.findOne({ username });
      if (!userToUnfollow) {
        return res.status(404).json({ error: "Użytkownik nie istnieje" });
      }
      if (currentUser.following.includes(userToUnfollow._id)) {
        await userToUnfollow.updateOne({
          $pull: { followers: currentUser._id },
        });
        await currentUser.updateOne({
          $pull: { following: userToUnfollow._id },
        });
        return res.status(200).json({
          message: `Przestałeś obserwować ${userToUnfollow.username}`,
        });
      }
      return res
        .status(400)
        .json({ error: "Nie obserwujesz tego użytkownika" });
    } catch (error) {
      return res.status(500).json({ error });
    }
  }

  async getFollowersByUsername(req, res) {
    try {
      if (!req.params.username) {
        return res.status(400).json({ error: "Brakuje nazwy użytkownika" });
      }

      const username = req.params.username;
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: "Użytkownik nie istnieje" });
      }
      const followersList = await User.aggregate([
        { $match: { _id: { $in: user.followers } } },
        {
          $project: {
            _id: 0,
            username: 1,
            imagePath: 1,
          },
        },
      ]);
      return res.status(201).json({ followersList });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Wystąpił błąd serwera" });
    }
  }

  async getFollowingByUsername(req, res) {
    try {
      if (!req.params.username) {
        return res.status(400).json({ error: "Brakuje nazwy użytkownika" });
      }

      const username = req.params.username;
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: "Użytkownik nie istnieje" });
      }
      const followingList = await User.aggregate([
        { $match: { _id: { $in: user.following } } },
        {
          $project: {
            _id: 0,
            username: 1,
            imagePath: 1,
          },
        },
      ]);
      return res.status(201).json({ followingList });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Wystąpił błąd serwera" });
    }
  }
  async getFiveRandomUsers(req, res) {
    if (!req.body.user || !req.body.user._id)
      return res.status(400).json({ error: "Nie ma użytkownika" });
    const user = req.body.user;
    try {
      const unfollowedUsers = await User.aggregate([
        {
          $addFields: {
            idString: { $toString: "$_id" },
          },
        },
        {
          $match: {
            $and: [
              {
                idString: {
                  $not: { $in: user.following.map((id) => id.toString()) },
                },
              },
              {
                idString: {
                  $ne: user._id.toString(),
                },
              },
            ],
          },
        },
        { $sample: { size: 5 } },
      ]);

      return res.status(200).json({ users: unfollowedUsers });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  }

  async getUsersByQuery(req, res) {
    const searchString = req.query.q;
    try {
      const result = await User.find({
        username: { $regex: searchString, $options: "i" },
      }).limit(10);
      return res.status(201).json(result);
    } catch (err) {
      return res.status(400).json({ error: err });
    }
  }

  async importProfile(req, res) {
    if (!req.params || !req.body.user) {
      return res.status(400).json({ message: "Brak informacji o użytkowniku" });
    }
    try {
      const allowedKeys = [
        "_id",
        "username",
        "lastName",
        "firstName",
        "password",
        "email",
        "gender",
        "imagePath",
        "followers",
        "following",
        "__v",
      ];

      const { id } = req.params;
      const profile = req.body.user;
      for (const key in profile) {
        if (!allowedKeys.includes(key)) {
          return res
            .status(400)
            .json({ error: "JSON zawiera nieodpowiednie klucze" });
        }
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: "Użytkownik nie istnieje" });
      }
      if (profile._id && user._id !== profile._id) {
        return res
          .status(400)
          .json({ error: "Nie możesz zmienić ID użytkownika" });
      }
      if (
        profile.gender &&
        (profile.gender !== "male" ||
          profile.gender !== "female" ||
          profile.gender !== "other")
      ) {
        return res.status(400).json({ error: "JSON jest niepoprawny: gender" });
      }
      if (
        profile.firstName &&
        !/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/.test(profile.firstName)
      ) {
        return res
          .status(400)
          .json({ error: "JSON jest niepoprawny: firstName" });
      }
      if (
        profile.lastName &&
        !/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/.test(profile.lastName)
      ) {
        return res
          .status(400)
          .json({ error: "JSON jest niepoprawny: lastName" });
      }
      if (profile.email && profile.email !== user.email) {
        return res.status(400).json({ error: "Email nie może się różnić" });
      }
      if (profile.username && profile.username !== user.username) {
        return res.status(400).json({ error: "Username nie może sie różnić!" });
      }
      await user.updateOne({
        $set: profile,
      });
      return res
        .status(200)
        .json({ message: "Pomyślnie zimportowano użytkownika" });
    } catch (error) {
      return res.status(500).json({ error });
    }
  }
  exportProfile(req, res) {
    const { id } = req.params;
    User.findById(id)
      .then((user) => {
        if (!user) {
          return res.status(404).json({ error: "Użytkownik nie istnieje" });
        }

        return res.status(200).json({ user });
      })
      .catch((error) => {
        return res.status(500).json({ error });
      });
  }
}

module.exports = new UserActions();
