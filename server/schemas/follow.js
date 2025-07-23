import { ObjectId } from "mongodb";
import FollowModels from "../models/FollowModels.js";

/*
1. create  Entitas/Table Follow
_id                : ObjectId
followingId        : ObjectId
followerId        : ObjectId
createdAt        : date
updatedAt        : date
typeDefs
2. create mutation follow user
3. createdat and updatedat use new Date().toISOString()W

*/
export const FollowTypeDefs = `#graphql
  type Follow {
    followingId: String!
  }

  type Query {
    follows: [Follow]
  }

  type Mutation {
    followUser(followingId: String!): Follow
  }
`;

export const FollowResolvers = {
  Mutation: {
    followUser: async (_, { followingId }, context) => {
      if (!followingId) {
        throw new Error("Both followingId and followerId must be provided");
      }

      const user = await context.auth(); // await ONCE
      const followerId = new ObjectId(user._id); // convert ONCE
      const followingIdObj = new ObjectId(followingId); // convert ONCE

      const alreadyFollowing = await FollowModels.FindFollow(
        followingIdObj,
        followerId
      );

      if (alreadyFollowing) {
        throw new Error("You are already following this user");
      }

      const newFollow = {
        followingId: followingIdObj,
        followerId: followerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const cursor = await FollowModels.AddFollow(newFollow);
      return newFollow;
    },
  },
};
