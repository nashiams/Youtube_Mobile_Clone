import { ObjectId } from "mongodb";
import PostModels from "../models/PostModels.js";
import { redis } from "../config/redis.js";

export const PostTypeDefs = `#graphql
  type Post {
    _id: String!
    content: String
    imgUrl: String
    authorId: String!
    createdAt: String
    updatedAt: String
    tags: [String]
    likes: [Likes]
    comments: [Comments]
    userDetail: User  
  }
 type User {
  _id: ID
  name: String
  username: String
  email: String
}
    type Likes {
        postId: String!
        username: String
        createdAt: String
        updatedAt: String
    }

    type Comments {
        username: String
        content: String
        createdAt: String
        updatedAt: String
    }

  type Query {
    posts: [Post]
    getPostById(postId: String!): [Post]
  }

  type Mutation {
    addPost(
      content: String!,
      imgUrl: String,
      tags: [String],
    ): Post
    commentPost(
      postId: String!,
      content: String,
    ): Comments
    likePost(
      postId: String!,
    ): Likes
    
  }
  `;
export const PostResolvers = {
  Query: {
    posts: async (_, __, context) => {
      // const user = await context.auth();
      // if (!user) {
      //   throw new Error("You must be logged in to view posts");
      // }

      const cachedPosts = await redis.get("posts");
      if (cachedPosts) {
        console.log("Using cached posts");
        return JSON.parse(cachedPosts);
      }

      const posts = await PostModels.GetPosts();
      console.log("posts", posts);
      await redis.set("posts", JSON.stringify(posts), "EX", 60 * 60); //sejam fetch
      return posts;
    },
    getPostById: async (_, { postId }, context) => {
      // const user = await context.auth();
      // if (!user) {
      //   throw new Error("You must be logged in to view posts");
      // }
      if (!postId) {
        throw new Error("Post ID must be provided");
      }
      const post = await PostModels.GetPostById(postId);
      // console.log("post", post);
      return post;
    },
  },
  Mutation: {
    addPost: async (_, { content, imgUrl, tags }, context) => {
      console.log("addPost called with content:");
      const user = await context.auth();
      const authorId = new ObjectId(user._id);
      console.log("authorId", authorId);
      if (!content) {
        throw new Error("Content must be provided");
      }
      const newPost = {
        content: content,
        imgUrl: imgUrl,
        tags: tags || [],
        authorId: authorId,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await PostModels.AddPosts(newPost);
      await redis.del("posts"); // Invalidate cache
      return newPost;
    },
    commentPost: async (_, { content, postId }, context) => {
      let user = await context.auth();

      if (!content) {
        throw new Error("Content must be provided");
      }
      const newComment = {
        postId: new ObjectId(postId),
        content: content,
        username: user.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      console.log("newComment", newComment);
      const post = await PostModels.AddComment(newComment);
      await redis.del("posts");
      return newComment;
    },
    likePost: async (_, { postId }, context) => {
      let user = await context.auth();
      if (!user) {
        throw new Error("Username must be provided");
      }
      const newLike = {
        postId: new ObjectId(postId),
        username: user.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      console.log("newLike", newLike);
      const post = await PostModels.AddLike(newLike);
      await redis.del("posts");
      return newLike;
    },
  },
};
