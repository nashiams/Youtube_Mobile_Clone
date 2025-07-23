import {
  View,
  Text,
  Alert,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, gql } from "@apollo/client";
import { deleteSecure, getSecure } from "../helpers/secureStone";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigation, useRoute } from "@react-navigation/native";

const GET_USER_BY_ID = gql`
  query GetUserById($id: String!) {
    getUserById(_id: $id) {
      _id
      username
      name
      email
      following {
        username
      }
      followers {
        username
      }
      posts {
        updatedAt
        imgUrl
        createdAt
        content
        authorId
        _id
      }
    }
  }
`;

const FOLLOW_USER = gql`
  mutation FollowUser($followingId: String!) {
    followUser(followingId: $followingId) {
      followingId
    }
  }
`;

const Profile = ({ navigation: propNavigation }) => {
  const navigation = propNavigation || useNavigation();
  const route = useRoute();
  const [userId, setUserId] = useState(null); // The userId to display (may be current or from params)
  const [loggedInUserId, setLoggedInUserId] = useState(null); // Always the logged-in userId
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Videos");
  const [sortBy, setSortBy] = useState("Latest");
  const [isFollowing, setIsFollowing] = useState(false);
  const { isSignedIn, setSignedIn } = useContext(AuthContext);

  // Get the logged-in userId from secure storage
  useEffect(() => {
    (async () => {
      const storedUserId = await getSecure("userId");
      setLoggedInUserId(storedUserId);
      // If route.params?.userId exists, use it; otherwise, use logged-in user
      setUserId(route.params?.userId || storedUserId);
    })();
  }, [route.params?.userId]);

  const { data, loading, error, refetch } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !userId, // wait until we get userId
    onCompleted: (data) => {
      const isCurrentlyFollowing = data.getUserById.followers.some(
        (follower) => follower._id === userId
      );
      setIsFollowing(isCurrentlyFollowing);
    },
  });

  const [followUser] = useMutation(FOLLOW_USER, {
    onCompleted: () => {
      setIsFollowing(!isFollowing);
      refetch();
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to follow/unfollow user");
      console.error("Follow error:", error);
    },
  });

  const handleFollow = async () => {
    try {
      await followUser({ variables: { followingId: userId } });
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  const handleLogout = async () => {
    setSignedIn(false);
    console.log(isSignedIn);
    await deleteSecure("token");
    navigation.navigate("Home");
  };

  const handleSearchPress = () => {
    navigation.navigate("Search");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.ceil(diffHours / 24);
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  };

  const formatCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const sortPosts = (posts) => {
    if (!posts) return [];
    const sorted = [...posts];
    switch (sortBy) {
      case "Latest":
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "Oldest":
        return sorted.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case "Popular":
        return sorted.sort(() => Math.random() - 0.5); // Fake for now
      default:
        return sorted;
    }
  };

  const renderVideoItem = ({ item, index }) => (
    <Pressable
      style={({ pressed }) => [
        styles.videoItem,
        pressed && styles.videoItemPressed,
      ]}
      onPress={() => navigation?.navigate("DetailPost", { postId: item._id })}
    >
      <View style={styles.videoThumbnail}>
        <Image
          source={{ uri: item.imgUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.videoDuration}>
          <Text style={styles.durationText}>3:30</Text>
        </View>
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={styles.videoMeta}>
          {formatCount(Math.floor(Math.random() * 50000))} views •{" "}
          {formatDate(item.createdAt)}
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.videoMoreButton,
          pressed && styles.pressedOpacity,
        ]}
      >
        <Ionicons name="ellipsis-vertical" size={16} color="#aaa" />
      </Pressable>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading profile</Text>
      </View>
    );
  }

  const user = data?.getUserById;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.headerButton,
            pressed && styles.pressedOpacity,
          ]}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable
            style={({ pressed }) => [
              styles.headerAction,
              pressed && styles.pressedOpacity,
            ]}
            onPress={handleSearchPress}
          >
            <Ionicons name="search-outline" size={24} color="#fff" />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.pressedOpacity,
            ]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Channel Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: "https://picsum.photos/800/200?random=banner" }}
            style={styles.banner}
            resizeMode="cover"
          />
        </View>

        {/* Channel Info */}
        <View style={styles.channelInfo}>
          <View style={styles.channelHeader}>
            <View style={styles.channelAvatar}>
              <Text style={styles.channelAvatarText}>
                {user?.username?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.channelDetails}>
              <Text style={styles.channelName}>
                {user?.name || user?.username}
              </Text>
              <Text style={styles.channelHandle}>@{user?.username}</Text>
              <Text style={styles.channelStats}>
                {formatCount(user?.followers?.length || 0)} subscribers •{" "}
                {formatCount(user?.posts?.length || 0)} videos
              </Text>
            </View>
          </View>

          <Text style={styles.channelDescription}>
            follow {user?.username} dibawah
          </Text>
          <Text style={styles.channelLink}>
            twitter.com/WElite28362t=TRgExi725yAjb60jbeTSMw&s=09
          </Text>

          {/* Follow/Subscribe Button */}
          <Pressable
            style={({ pressed }) => [
              styles.followButton,
              isFollowing && styles.followingButton,
              pressed && styles.followButtonPressed,
            ]}
            onPress={handleFollow}
          >
            <Ionicons
              name={isFollowing ? "notifications" : "person-add"}
              size={16}
              color={isFollowing ? "#000" : "#fff"}
            />
            <Text
              style={[
                styles.followButtonText,
                isFollowing && styles.followingButtonText,
              ]}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
            {isFollowing && (
              <Ionicons name="chevron-down" size={16} color="#000" />
            )}
          </Pressable>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {["Videos", "Posts"].map((tab) => (
            <Pressable
              key={tab}
              style={({ pressed }) => [
                styles.tab,
                selectedTab === tab && styles.activeTab,
                pressed && styles.pressedOpacity,
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Sort Options */}
        {selectedTab === "Videos" && (
          <View style={styles.sortContainer}>
            {["Latest", "Popular", "Oldest"].map((sort) => (
              <Pressable
                key={sort}
                style={({ pressed }) => [
                  styles.sortButton,
                  sortBy === sort && styles.activeSortButton,
                  pressed && styles.sortButtonPressed,
                ]}
                onPress={() => setSortBy(sort)}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    sortBy === sort && styles.activeSortButtonText,
                  ]}
                >
                  {sort}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Videos List */}
        {selectedTab === "Videos" && (
          <FlatList
            data={sortPosts(user?.posts)}
            renderItem={renderVideoItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            contentContainerStyle={styles.videosList}
          />
        )}
      </ScrollView>

      {/* Options Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Options</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.modalCloseButton,
                  pressed && styles.pressedOpacity,
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </Pressable>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.modalOption,
                pressed && styles.modalOptionPressed,
              ]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#ff4444" />
              <Text style={styles.modalOptionTextLogout}>Logout</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerAction: {
    marginLeft: 20,
    padding: 4,
  },
  bannerContainer: {
    height: 120,
  },
  banner: {
    width: "100%",
    height: "100%",
  },
  channelInfo: {
    padding: 16,
  },
  channelHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  channelAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ff0000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  channelAvatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  channelDetails: {
    flex: 1,
  },
  channelName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  channelHandle: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 4,
  },
  channelStats: {
    color: "#aaa",
    fontSize: 14,
  },
  channelDescription: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 8,
  },
  channelLink: {
    color: "#4a9eff",
    fontSize: 14,
    marginBottom: 16,
  },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff0000",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: "#e0e0e0",
  },
  followButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  followButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    marginRight: 4,
  },
  followingButtonText: {
    color: "#000",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#272727",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#fff",
  },
  tabText: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
  },
  sortContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#272727",
    marginRight: 8,
  },
  activeSortButton: {
    backgroundColor: "#fff",
  },
  sortButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  sortButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  activeSortButtonText: {
    color: "#000",
  },
  videosList: {
    paddingHorizontal: 16,
  },
  videoItem: {
    flexDirection: "row",
    marginBottom: 12,
    borderRadius: 8,
  },
  videoItemPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    transform: [{ scale: 0.98 }],
  },
  videoThumbnail: {
    position: "relative",
    width: 120,
    height: 68,
    marginRight: 12,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  videoDuration: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  durationText: {
    color: "#fff",
    fontSize: 10,
  },
  videoInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  videoTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18,
  },
  videoMeta: {
    color: "#aaa",
    fontSize: 12,
  },
  videoMoreButton: {
    padding: 8,
    borderRadius: 4,
  },
  pressedOpacity: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  modalOptionPressed: {
    backgroundColor: "rgba(255, 68, 68, 0.1)",
  },
  modalOptionText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 16,
  },
  modalOptionTextLogout: {
    color: "#ff4444",
    fontSize: 16,
    marginLeft: 16,
  },
});

export default Profile;
