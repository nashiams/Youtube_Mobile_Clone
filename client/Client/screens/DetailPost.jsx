import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  TextInput,
  Modal,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useState, useCallback, useMemo, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import DetailCard from "../components/DetailCard";

// Get screen dimensions
const { height: screenHeight } = Dimensions.get("window");

// Queries & Mutations
const GET_POST_BY_ID = gql`
  query GetPostById($postId: String!) {
    getPostById(postId: $postId) {
      _id
      content
      authorId
      createdAt
      updatedAt
      tags
      imgUrl
      userDetail {
        username
        name
        email
        _id
      }
      likes {
        username
        updatedAt
        postId
        createdAt
      }
      comments {
        username
        content
        createdAt
        updatedAt
      }
    }
  }
`;

const GET_POSTS = gql`
  query Posts {
    posts {
      _id
      content
      imgUrl
      authorId
      createdAt
      updatedAt
      tags
      userDetail {
        name
        email
        username
      }
      likes {
        postId
        username
        createdAt
        updatedAt
      }
      comments {
        username
        content
        createdAt
        updatedAt
      }
    }
  }
`;

const COMMENT_POST = gql`
  mutation CommentPost($postId: String!, $content: String!) {
    commentPost(postId: $postId, content: $content) {
      username
      content
      createdAt
      updatedAt
    }
  }
`;

const LIKE_POST = gql`
  mutation LikePost($postId: String!) {
    likePost(postId: $postId) {
      postId
    }
  }
`;

// Helper function for date formatting
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)} weeks ago`;
};

// Comment Item Component
const CommentItem = ({ comment }) => {
  const firstLetter = comment?.username?.charAt(0).toUpperCase() || "U";

  return (
    <View style={styles.commentItem}>
      <View style={styles.commentAvatar}>
        <Text style={styles.commentAvatarText}>{firstLetter}</Text>
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUsername}>
            @{comment?.username || "Unknown"}
          </Text>
          <Text style={styles.commentTime}>
            {formatDate(comment.createdAt)}
          </Text>
        </View>
        <Text style={styles.commentText}>{comment.content}</Text>
      </View>
    </View>
  );
};

// Comments Modal Component
const CommentsModal = ({
  visible,
  onClose,
  comments,
  postId,
  onCommentAdded,
  modalHeight,
}) => {
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentPost] = useMutation(COMMENT_POST);

  const handleComment = async () => {
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await commentPost({
        variables: { postId, content: commentText },
      });
      setCommentText("");
      onCommentAdded();
    } catch (error) {
      Alert.alert("Error", "Failed to post comment. Please try again.");
      console.error("Error commenting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { height: modalHeight }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <Pressable
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </Pressable>
            </View>

            <ScrollView
              style={styles.commentsContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {comments?.length > 0 ? (
                comments.map((comment, index) => (
                  <CommentItem
                    key={`${comment.username}-${index}`}
                    comment={comment}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No comments yet. Be the first!
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.commentInputContainer}>
              <View style={styles.commentInputAvatar}>
                <Text style={styles.commentInputAvatarText}>U</Text>
              </View>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="#aaa"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
                editable={!isSubmitting}
              />
              <Pressable
                onPress={handleComment}
                style={({ pressed }) => [
                  styles.sendButton,
                  {
                    opacity:
                      pressed || isSubmitting || !commentText.trim() ? 0.5 : 1,
                  },
                ]}
                disabled={isSubmitting || !commentText.trim()}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

// Main Component
export default function DetailPost() {
  const navigation = useNavigation();
  const route = useRoute();
  const postId = route?.params?.postId;

  const [commentsVisible, setCommentsVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [modalHeight, setModalHeight] = useState(screenHeight * 0.6);
  const imageRef = useRef(null);

  const { data, loading, error, refetch } = useQuery(GET_POST_BY_ID, {
    variables: { postId },
    skip: !postId,
  });

  const { data: postsData } = useQuery(GET_POSTS);

  const [likePost] = useMutation(LIKE_POST);

  const post = useMemo(() => data?.getPostById?.[0], [data]);
  const otherPosts = useMemo(() => {
    if (!postsData?.posts || !postId) return [];
    return postsData.posts.filter((p) => p._id !== postId);
  }, [postsData, postId]);

  const handleLike = useCallback(async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      await likePost({ variables: { postId: post._id } });
      setIsLiked(!isLiked);
      refetch();
    } catch (error) {
      Alert.alert("Error", "Failed to like post. Please try again.");
      console.error("Error liking post:", error);
    } finally {
      setIsLiking(false);
    }
  }, [isLiked, isLiking, likePost, post?._id, refetch]);

  const handleCommentAdded = useCallback(() => {
    refetch();
  }, [refetch]);

  const handlePostPress = useCallback(
    (clickedPostId) => {
      navigation.push("DetailPost", { postId: clickedPostId });
    },
    [navigation]
  );

  const handleOpenComments = useCallback(() => {
    if (imageRef.current) {
      imageRef.current.measure((x, y, width, height, pageX, pageY) => {
        const remainingHeight = screenHeight - (pageY + height);
        setModalHeight(remainingHeight - 20); // 20px padding
      });
    }
    setCommentsVisible(true);
  }, []);

  if (!postId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: No post ID provided</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Thumbnail */}
        <View style={styles.videoContainer} ref={imageRef}>
          <Image
            source={{ uri: post.imgUrl }}
            style={styles.video}
            resizeMode="cover"
          />
          <View style={styles.videoDuration}>
            <Text style={styles.durationText}>12:24</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{post.content}</Text>
          <Text style={styles.videoMeta}>
            {post.likes?.length || 0} likes • {formatDate(post.createdAt)}
          </Text>

          <View style={styles.channelContainer}>
            <View style={styles.channelInfo}>
              <View style={styles.channelAvatar}>
                <Text style={styles.channelAvatarText}>
                  {post.userDetail?.username?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
              <View>
                <Text style={styles.channelName}>
                  {post.userDetail?.username || "Unknown User"}
                </Text>
                <Text style={styles.subscriberCount}>624 Subscribers</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.subscribeButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.subscribeText}>Subscribe</Text>
            </Pressable>
          </View>

          {/* Actions */}
          <View style={styles.actionButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed || isLiking ? 0.6 : 1 },
              ]}
              onPress={handleLike}
              disabled={isLiking}
            >
              <Ionicons
                name={isLiked ? "thumbs-up" : "thumbs-up-outline"}
                size={20}
                color={isLiked ? "#fff" : "#aaa"}
              />
              <Text style={styles.actionText}>{post.likes?.length || 0}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              onPress={handleOpenComments}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#aaa" />
              <Text style={styles.actionText}>Comment</Text>
            </Pressable>
          </View>

          {/* Comments Preview */}
          <Pressable
            style={({ pressed }) => [
              styles.commentsPreview,
              { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={handleOpenComments}
          >
            <Text style={styles.commentsTitle}>
              Comments ({post.comments?.length || 0})
            </Text>
            <Text style={styles.commentPreviewText} numberOfLines={2}>
              {post.comments?.[0]?.content || "No comments yet"}
            </Text>
          </Pressable>
        </View>

        {/* More Videos Section */}
        {otherPosts.length > 0 && (
          <View style={styles.moreVideosSection}>
            <Text style={styles.moreVideosTitle}>More videos</Text>
            {otherPosts.map((otherPost) => (
              <DetailCard
                key={otherPost._id}
                post={otherPost}
                onPress={() => handlePostPress(otherPost._id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <CommentsModal
        visible={commentsVisible}
        onClose={() => setCommentsVisible(false)}
        comments={post.comments}
        postId={post._id}
        onCommentAdded={handleCommentAdded}
        modalHeight={modalHeight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f0f",
    padding: 20,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#ff0000",
    borderRadius: 20,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  videoContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 9,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  videoDuration: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  durationText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 8,
  },
  videoMeta: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 16,
  },
  channelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  channelInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  channelAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ff0000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  channelAvatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  channelName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  subscriberCount: {
    color: "#aaa",
    fontSize: 12,
  },
  subscribeButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subscribeText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#272727",
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#272727",
    borderRadius: 20,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
  },
  commentsPreview: {
    backgroundColor: "#272727",
    padding: 12,
    borderRadius: 8,
  },
  commentsTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  commentPreviewText: {
    color: "#aaa",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0f0f0f",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#272727",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  commentsContainer: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    color: "#aaa",
    fontSize: 16,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ff0000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  commentAvatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  commentUsername: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginRight: 8,
  },
  commentTime: {
    color: "#aaa",
    fontSize: 12,
  },
  commentText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#272727",
  },
  commentInputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ff0000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  commentInputAvatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  commentInput: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    backgroundColor: "#272727",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  moreVideosSection: {
    padding: 16,
    borderTopWidth: 8,
    borderTopColor: "#272727",
  },
  moreVideosTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 16,
  },
});
