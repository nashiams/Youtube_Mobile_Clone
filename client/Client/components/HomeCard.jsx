import { useNavigation } from "@react-navigation/native";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";

export const HomeCard = ({ post }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("DetailPost", { postId: post._id });
  };

  const handleMorePress = () => {
    // Add your more options functionality here
    console.log("More options pressed for post:", post._id);
  };

  // Format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Generate random view count for demo
  const getRandomViews = () => {
    const views = Math.floor(Math.random() * 1000) + 100;
    return views > 1000 ? `${(views / 1000).toFixed(1)}K` : views.toString();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
      onPress={handlePress}
    >
      {/* Video Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: post.imgUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {/* Duration overlay */}
        <View style={styles.durationContainer}>
          <Text style={styles.duration}>4:32</Text>
        </View>
      </View>

      {/* Video Info */}
      <View style={styles.infoContainer}>
        {/* Channel Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {post.userDetail?.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
        </View>

        {/* Video Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {post.content}
          </Text>

          <View style={styles.metaContainer}>
            <Text style={styles.channelName}>
              {post.userDetail?.name || "Unknown User"}
            </Text>
            <Text style={styles.metaText}>
              {getRandomViews()} views • {formatDate(post.createdAt)}
            </Text>
          </View>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {post.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* More Options */}
        <Pressable style={styles.moreButton} onPress={handleMorePress}>
          <Text style={styles.moreIcon}>⋮</Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0f0f0f",
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  containerPressed: {
    backgroundColor: "#1a1a1a",
    transform: [{ scale: 0.98 }],
  },
  thumbnailContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 9,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    backgroundColor: "#272727",
  },
  durationContainer: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  duration: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  infoContainer: {
    flexDirection: "row",
    padding: 12,
    alignItems: "flex-start",
  },
  avatarContainer: {
    marginRight: 12,
    borderRadius: 18,
  },
  avatarPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ff0000",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 22,
    marginBottom: 4,
  },
  metaContainer: {
    marginBottom: 8,
  },
  channelName: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 2,
  },
  metaText: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "400",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#272727",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagPressed: {
    backgroundColor: "#3a3a3a",
    transform: [{ scale: 0.95 }],
  },
  tagText: {
    color: "#fff",
    fontSize: 12,
  },
  moreButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 4,
  },
  moreButtonPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    opacity: 0.7,
  },
  moreIcon: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
