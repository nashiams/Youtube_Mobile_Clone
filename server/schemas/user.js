import { ObjectId } from "mongodb";
import UserModel from "../models/UserModels.js";
// Get User by Id: untuk menampilkan profile user untuk menampilkan profile user, dan menampilkan siapa saja yang follow
// Menampilkan list nama/username user follower
// Menampilkan list nama/username user following
export const UsertypeDefs = `#graphql
  type User {
    _id: ID!
    name: String
    username: String
    email: String
  }

  type UserDetail {
    _id: ID!
    name: String
    username: String
    email: String
    followers: [User]
    following: [User]
    posts: [UserPost]
  }
  type UserPost {
    _id: ID!
    content: String
    imgUrl: String  
    authorId: String!
    createdAt: String
    updatedAt: String
  }

  type LoginResponse {
    token: String!
    userId: ID!
  }


  type Query {
    users: [User]
    searchUser(searchTerm: String!): [User]
    getUserById(_id: String!): UserDetail
  } 

  type Mutation {
    register(name: String!, username: String!, email: String!, password: String!): User
    login(email: String!, password: String!): LoginResponse
  }
`;

export const Userresolvers = {
  Query: {
    users: async (_, __, context) => {
      const user = await context.auth();
      if (!user) {
        throw new Error("You must be logged in to view posts");
      }
      const users = await UserModel.Users();
      return users;
    },
    searchUser: async (_, { searchTerm }, context) => {
      const checkuser = await context.auth();
      if (!checkuser) {
        throw new Error("You must be logged in to search users");
      }

      // Don't search if the search term is empty
      if (!searchTerm || searchTerm.trim() === "") {
        return [];
      }

      const users = await UserModel.SearchUser(searchTerm);
      return users; // Return empty array if no users found, don't throw error
    },
    getUserById: async (_, { _id }, context) => {
      const checkuser = await context.auth();
      if (!checkuser) {
        throw new Error("You must be logged in to view posts");
      }
      const user = await UserModel.FindUserById({ id: new ObjectId(_id) });
      const userDetails = await UserModel.GetUserById(new ObjectId(_id));
      console.log("userDetails", userDetails);
      if (!userDetails) throw new Error("User not found");
      return userDetails;
    },
  },

  Mutation: {
    register: async (_, { name, username, email, password }) => {
      const newuser = {
        name,
        username,
        email,
        password,
      };
      const user = await UserModel.Register(name, username, email, password);
      return newuser;
    },
    login: async (_, { email, password }) => {
      const result = await UserModel.Login(email, password);
      return result;
    },
  },
};
