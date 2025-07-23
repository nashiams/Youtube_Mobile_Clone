import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

const DetailCard = ({ post, onPress }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  const getRandomViews = () => {
    const views = Math.floor(Math.random() * 1000) + 100;
    return views > 1000 ? `${(views / 1000).toFixed(1)}K` : views.toString();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: post.imgUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.durationContainer}>
          <Text style={styles.duration}>12:24</Text>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.channelAvatar}>
          <Text style={styles.channelAvatarText}>
            {post.userDetail?.username?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {post.content}
          </Text>
          <Text style={styles.channelName}>{post.userDetail?.username}</Text>
          <Text style={styles.metaText}>
            {getRandomViews()} views • {formatDate(post.createdAt)}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreIcon}>⋮</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0f0f0f",
    marginBottom: 16,
  },
  thumbnailContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 9,
    marginBottom: 8,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    backgroundColor: "#272727",
    borderRadius: 8,
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
    alignItems: "flex-start",
  },
  channelAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ff0000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  channelAvatarText: {
    color: "#fff",
    fontSize: 14,
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
  moreButton: {
    padding: 8,
    marginLeft: 8,
  },
  moreIcon: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DetailCard;
