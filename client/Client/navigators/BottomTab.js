import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../screens/Home";
import Search from "../screens/Search";
import Profile from "../screens/Profile";
import AddPost from "../screens/AddPost";
import { Ionicons } from "@expo/vector-icons";
import CustomHeader from "../components/CustomHeader";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Search":
              iconName = focused ? "search" : "search-outline";
              break;
            case "Add":
              iconName = "add-circle-outline";
              size = 32;
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#aaa",
        tabBarStyle: {
          backgroundColor: "#0f0f0f",
          borderTopColor: "#272727",
          borderTopWidth: 1,
          height: 90,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
        },
        headerShown: false, // Default to false for all screens
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: true,
          header: () => <CustomHeader />,
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddPost}
        options={{
          tabBarLabel: () => null,
          tabBarStyle: { display: "none" },
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          headerShown: false,
          headerStyle: {
            backgroundColor: "#0f0f0f",
          },
          headerTintColor: "#fff",
        }}
      />
    </Tab.Navigator>
  );
}
