import { NavigationContainer } from "@react-navigation/native";
import MainStack from "./navigators/Stack";
import { ApolloProvider } from "@apollo/client";
import client from "./config/apollo";
import AuthProvider from "./contexts/AuthContext";
import { View } from "react-native";

export default function App() {
  return (
    <AuthProvider>
      <ApolloProvider client={client}>
        <View style={{ flex: 1, backgroundColor: "#0f0f0f" }}>
          <NavigationContainer>
            <MainStack />
          </NavigationContainer>
        </View>
      </ApolloProvider>
    </AuthProvider>
  );
}
