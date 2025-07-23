import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getSecure } from "../helpers/secureStone";

const httpLink = createHttpLink({
  uri: "https://2f2f.nashi.lat/",
});

const authLink = setContext(async (_, { headers }) => {
  const token = await getSecure("token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Apollo Client setup
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
