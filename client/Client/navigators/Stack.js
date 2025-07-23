import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import Home from "../screens/Home";
import Login from "../screens/Login";
import Register from "../screens/Register";

import DetailPost from "../screens/DetailPost";
import BottomTabs from "./BottomTab";
import CustomHeader from "../components/CustomHeader";
import Search from "../screens/Search"; // <-- add this import
import Profile from "../screens/Profile"; // <-- add this import

const Stack = createNativeStackNavigator();

export default function MainStack() {
  const { isSignedIn } = useContext(AuthContext);

  return (
    <Stack.Navigator>
      {!isSignedIn ? (
        <>
          {/* Not signed in: Show single Home screen with header */}
          <Stack.Screen
            name="Home"
            component={Home}
            options={{
              header: () => <CustomHeader />,
            }}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={Register}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          {/* Signed in: Show bottom tabs as the main screen */}
          <Stack.Screen
            name="MainTabs"
            component={BottomTabs}
            options={{ headerShown: false }}
          />
        </>
      )}

      {/* Always available screens */}
      <Stack.Screen
        name="DetailPost"
        component={DetailPost}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Search"
        component={Search}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
