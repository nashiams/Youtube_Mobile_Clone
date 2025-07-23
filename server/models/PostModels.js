import { ObjectId } from "mongodb";
import database from "../config/mongodb.js";

export default class PostModels {
  static async collection() {
    return database.collection("Posts");
  }

  static async GetPosts() {
    const agg = [
      {
        $lookup: {
          from: "Users",
          localField: "authorId",
          foreignField: "_id",
          as: "userDetail",
        },
      },
      {
        $unwind: {
          path: "$userDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          "userDetail.password": 0,
        },
      },
      {
        $sort: { createdAt: -1 }, //  SORT HERE inside aggregation
      },
    ];
    const cursor = (await this.collection()).aggregate(agg);
    let result = await cursor.toArray();
    console.log("cursor", result);
    return result;
  }

  static async GetPostById(postId) {
    if (!postId) {
      throw new Error("Post ID must be provided");
    }
    const agg = [
      {
        $match: { _id: new ObjectId(postId) },
      },
      {
        $lookup: {
          from: "Users",
          localField: "authorId",
          foreignField: "_id",
          as: "userDetail",
        },
      },
      {
        $unwind: {
          path: "$userDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          "userDetail.password": 0,
        },
      },
      {
        $sort: { createdAt: -1 }, //  SORT HERE inside aggregation
      },
    ];
    const cursor = (await this.collection()).aggregate(agg);
    let result = await cursor.toArray();
    console.log("cursor", result);
    return await result;
  }
  static async AddPosts(post) {
    const cursor = (await this.collection()).insertOne(post);
    return cursor;
  }
  static async AddComment(comment) {
    const cursor = (await this.collection()).updateOne(
      { _id: new ObjectId(comment.postId) },
      { $push: { comments: comment } }
    );
    return cursor;
  }
  static async AddLike(like) {
    const collection = await this.collection();

    // 1. Find the post by ID
    const post = await collection.findOne({ _id: new ObjectId(like.postId) });

    if (!post) throw new Error("Post not found");

    // 2. Check if the user already liked the post
    const alreadyLiked = post.likes?.some((l) => l.username === like.username);
    if (alreadyLiked) {
      throw new Error("You have already liked this post");
    }

    // 3. Add the like if not already liked
    const result = await collection.updateOne(
      { _id: new ObjectId(like.postId) },
      { $push: { likes: like } }
    );

    return result;
  }
}
