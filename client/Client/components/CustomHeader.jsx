import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { gql, useQuery } from "@apollo/client";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { deleteSecure } from "../helpers/secureStone";

const GET_TAGS = gql`
  query Posts {
    posts {
      tags
    }
  }
`;

export const CustomHeader = () => {
  const navigation = useNavigation();
  const { isSignedIn, setSignedIn } = useContext(AuthContext);
  const { loading, error, data } = useQuery(GET_TAGS);

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  // Extract all tags from all posts
  const allTags = data.posts.flatMap((post) => post.tags);

  // Use a Set to get unique tags
  const tags = [...new Set(allTags)];

  const handleSearchPress = () => {
    navigation.navigate("Search");
  };

  const handleProfilePress = async () => {
    if (isSignedIn) {
      navigation.navigate("Profile");
      // // console.log("htesss");
      // // console.log(isSignedIn);
      // // navigation.navigate("Login");
      // setSignedIn(false);
      // console.log(isSignedIn);
      // await deleteSecure("token");
      // navigation.navigate("Home");
    } else {
      // Navigate to Login screen if not signed in
      navigation.navigate("Login");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          {/* YouTube Logo */}
          <View style={styles.logoContainer}>
            <Ionicons name="logo-youtube" size={24} color="#ff0000" />
            <Text style={styles.logoText}>Yourself</Text>
          </View>

          {/* Right Actions */}
          <View style={styles.rightActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleProfilePress}
            >
              <Ionicons
                name={isSignedIn ? "person-circle" : "person-circle-outline"}
                size={28}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.notificationContainer}>
                <Ionicons name="notifications-outline" size={24} color="#fff" />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>1</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSearchPress}
            >
              <Ionicons name="search-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tags/Categories Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsContainer}
          contentContainerStyle={styles.tagsContent}
        >
          {tags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.tagButton, index === 0 && styles.activeTagButton]}
            >
              <Text
                style={[styles.tagText, index === 0 && styles.activeTagText]}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#0f0f0f",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    backgroundColor: "#0f0f0f",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: 20,
    padding: 4,
  },
  notificationContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ff0000",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  tagsContainer: {
    paddingBottom: 12,
  },
  tagsContent: {
    paddingRight: 16,
  },
  tagButton: {
    backgroundColor: "#272727",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  activeTagButton: {
    backgroundColor: "#fff",
  },
  tagText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTagText: {
    color: "#000",
  },
});

export default CustomHeader;
