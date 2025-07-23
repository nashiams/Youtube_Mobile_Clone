import { ObjectId } from "mongodb";
import database from "../config/mongodb.js";

export default class FollowModels {
  static async collection() {
    return database.collection("Follows");
  }

  static async AddFollow(follow) {
    const result = (await this.collection()).insertOne(follow);
    return result;
  }

  static async FindFollow(followingId, followerId) {
    const follow = await (
      await this.collection()
    ).findOne({
      followingId: followingId,
      followerId: followerId,
    });
    return !!follow;
  }
}
