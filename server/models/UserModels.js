import database from "../config/mongodb.js";
import { comparePassword, hashPassword } from "../helpers/bcrypt.js";
import { signToken } from "../helpers/jwt.js";

export default class UserModel {
  static collection() {
    return database.collection("Users");
  }

  static async Users() {
    const cursor = this.collection().find();
    return await cursor.toArray();
  }
  static async FindUserById({ id }) {
    const user = await this.collection().findOne({ _id: id });
    // console.log("user", user);
    if (!user) {
      console.log("masukkkk");
      throw new Error("User not found");
    }
    return user;
  }

  static async SearchUser(searchTerm) {
    const searchPattern = new RegExp(searchTerm, "i"); // 'i' for case-insensitive

    const users = await this.collection().find({
      $or: [
        { username: { $regex: searchPattern } },
        { name: { $regex: searchPattern } },
      ],
    });

    let result = await users.toArray();
    console.log("search results:", result);
    return result;
  }

  static async Register(name, username, email, password) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    const isUniqueEmail = await this.collection().findOne({ email: email });
    console.log("isUniqueEmail", isUniqueEmail);

    const isUniqueUsername = await this.collection().findOne({
      username: username,
    });

    if (isUniqueEmail || isUniqueUsername) {
      console.log("Email or Username already exists");
      throw new Error("Email already exists");
    }

    if (password.length < 5) {
      throw new Error("Password must be at least 6 characters long");
    }

    password = hashPassword(password);
    return await this.collection().insertOne({
      name,
      username,
      email,
      password,
    });
  }

  static async Login(email, password) {
    const user = await this.collection().findOne({ email: email });
    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = comparePassword(password, user.password);
    console.log("isPasswordValid", isPasswordValid);
    if (!isPasswordValid) {
      throw new Error("Invalid login");
    }
    let token = signToken({
      id: user._id,
    });
    console.log("token", token);
    return { token, userId: user._id };
  }

  static async GetUserById(id) {
    if (!id) {
      throw new Error("User ID must be provided");
    }
    const agg = [
      {
        $match: { _id: id },
      },
      {
        $lookup: {
          from: "Follows",
          localField: "_id",
          foreignField: "followingId",
          as: "followersData",
        },
      },
      {
        $lookup: {
          from: "Users",
          let: {
            followerIds: "$followersData.followerId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$followerIds"],
                },
              },
            },
            {
              $project: {
                password: 0,
              },
            },
          ],
          as: "followers",
        },
      },
      {
        $lookup: {
          from: "Follows",
          localField: "_id",
          foreignField: "followerId",
          as: "followingData",
        },
      },
      {
        $lookup: {
          from: "Users",
          let: {
            followerIds: "$followersData.followerId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$followerIds"],
                },
              },
            },
            {
              $project: {
                username: 1,
                name: 1,
              },
            },
          ],
          as: "followers",
        },
      },
      {
        $lookup: {
          from: "Users",
          let: {
            followingIds: "$followingData.followingId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", "$$followingIds"],
                },
              },
            },
            {
              $project: {
                username: 1,
                name: 1,
              },
            },
          ],
          as: "following",
        },
      },
      {
        $project: {
          followersData: 0,
          followingData: 0,
          password: 0,
        },
      },
      {
        $lookup: {
          from: "Posts",
          localField: "_id",
          foreignField: "authorId",
          as: "posts",
        },
      },
      {
        $project: {
          followersData: 0,
          followingData: 0,
          password: 0,
          "posts.comments": 0, // optional: exclude embedded arrays
          "posts.likes": 0, // optional: exclude embedded arrays
        },
      },
    ];

    const result = await (await this.collection()).aggregate(agg).toArray();
    console.log("result", result);
    return result[0];
  }
}
