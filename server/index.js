import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { Userresolvers, UsertypeDefs } from "./schemas/user.js";
import { PostResolvers, PostTypeDefs } from "./schemas/post.js";
import { verifyToken } from "./helpers/jwt.js";
import UserModel from "./models/UserModels.js";
import { ObjectId } from "mongodb";
import { FollowResolvers, FollowTypeDefs } from "./schemas/follow.js";

const server = new ApolloServer({
  typeDefs: [UsertypeDefs, PostTypeDefs, FollowTypeDefs],
  resolvers: [Userresolvers, PostResolvers, FollowResolvers],
  introspection: true,
});

(async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: process.env.PORT || 4000 },
    context: ({ req }) => {
      const auth = async () => {
        const rawtoken = req.headers.authorization;
        if (!rawtoken) {
          throw new Error("You must be logged in");
        }
        const tokenParts = rawtoken.split(" ");
        const token = tokenParts[1];
        // console.log(token);
        const isPasswordValid = verifyToken(token);

        if (!isPasswordValid) {
          console.log("masuk");
          throw new Error("Invalid token");
        }
        console.log("isPasswordValid", isPasswordValid);

        const user = await UserModel.FindUserById({
          id: new ObjectId(isPasswordValid.id),
        });
        if (!user) {
          throw new Error("User not found");
        }
        // console.log("user", user);

        return user;
      };

      return {
        auth,
      };
    },
  });

  console.log(`🚀  Server ready at: ${url}`);
})();
