import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { getSecure } from "../helpers/secureStone";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Proportional sizing helpers
const wp = (percentage) => (screenWidth * percentage) / 100;
const hp = (percentage) => (screenHeight * percentage) / 100;
const fp = (percentage) => (screenWidth * percentage) / 100; // Font proportional

const ADD_POST = gql`
  mutation AddPost($content: String!, $tags: [String], $imgUrl: String) {
    addPost(content: $content, tags: $tags, imgUrl: $imgUrl) {
      content
      tags
      imgUrl
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

const GET_USER_BY_ID = gql`
  query GetUserById($id: String!) {
    getUserById(_id: $id) {
      username
    }
  }
`;

const AddPost = ({ navigation }) => {
  const [userId, setUserId] = useState(null);
  const [content, setContent] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Post");

  // Get user ID from secure storage
  useEffect(() => {
    (async () => {
      const storedUserId = await getSecure("userId");
      setUserId(storedUserId);
    })();
  }, []);

  // Get user data
  const { data: userData, loading: userLoading } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !userId,
  });

  const [addPost, { loading: postLoading }] = useMutation(ADD_POST, {
    refetchQueries: [{ query: GET_POSTS }], //  this is the key
    awaitRefetchQueries: true,
    onCompleted: (data) => {
      Alert.alert("Success", "Post created successfully!", [
        {
          text: "OK",
          onPress: () => {
            navigation?.goBack();
          },
        },
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create post");
      console.error("Add post error:", error);
    },
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Please enter some content for your post");
      return;
    }

    if (imgUrl && !validateUrl(imgUrl)) {
      Alert.alert("Error", "Please enter a valid URL for the image/video");
      return;
    }

    try {
      await addPost({
        variables: {
          content: content.trim(),
          tags: tags.length > 0 ? tags : null,
          imgUrl: imgUrl.trim() || null,
        },
      });
    } catch (error) {
      console.error("Post creation error:", error);
    }
  };

  const isPostDisabled = !content.trim() || postLoading;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#0f0f0f" }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.keyboardAvoidingView, { backgroundColor: "#0f0f0f" }]}
      >
        {/* Header - No SafeArea padding here since it's already in SafeAreaView */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation?.goBack()}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons name="close" size={wp(6)} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Create post</Text>
          <Pressable
            style={({ pressed }) => [
              styles.postButton,
              isPostDisabled && styles.postButtonDisabled,
              pressed && !isPostDisabled && styles.pressedButton,
            ]}
            onPress={handlePost}
            disabled={isPostDisabled}
          >
            <Text
              style={[
                styles.postButtonText,
                isPostDisabled && styles.postButtonTextDisabled,
              ]}
            >
              Post
            </Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {userData?.getUserById?.username?.charAt(0).toUpperCase() ||
                  "U"}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.username}>
                {userLoading
                  ? "Loading..."
                  : userData?.getUserById?.username || "User"}
              </Text>
              <View style={styles.privacyContainer}>
                <Ionicons name="globe-outline" size={wp(4)} color="#aaa" />
                <Text style={styles.privacyText}>Public</Text>
                <Pressable
                  style={({ pressed }) => pressed && styles.pressedButton}
                >
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={wp(4)}
                    color="#aaa"
                  />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Content Input */}
          <TextInput
            style={styles.contentInput}
            placeholder="Give a shoutout! Type @ to mention a channel"
            placeholderTextColor="#666"
            multiline
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />

          {/* Media URL Input */}
          <View style={styles.mediaSection}>
            <Text style={styles.sectionTitle}>Add Media (Optional)</Text>
            <View style={styles.urlInputContainer}>
              <Ionicons
                name="link-outline"
                size={wp(5)}
                color="#aaa"
                style={styles.urlIcon}
              />
              <TextInput
                style={styles.urlInput}
                placeholder="Paste image or video URL here"
                placeholderTextColor="#666"
                value={imgUrl}
                onChangeText={setImgUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {imgUrl ? (
                <Pressable
                  onPress={() => setImgUrl("")}
                  style={({ pressed }) => pressed && styles.pressedButton}
                >
                  <Ionicons name="close-circle" size={wp(5)} color="#aaa" />
                </Pressable>
              ) : null}
            </View>
            {imgUrl && validateUrl(imgUrl) && (
              <View style={styles.urlPreview}>
                <Ionicons
                  name="checkmark-circle"
                  size={wp(4)}
                  color="#4CAF50"
                />
                <Text style={styles.urlPreviewText}>Valid URL</Text>
              </View>
            )}
            {imgUrl && !validateUrl(imgUrl) && (
              <View style={styles.urlPreview}>
                <Ionicons name="alert-circle" size={wp(4)} color="#ff4444" />
                <Text style={styles.urlErrorText}>Invalid URL format</Text>
              </View>
            )}
          </View>

          {/* Tags Section */}
          <View style={styles.tagsSection}>
            <View style={styles.tagsSectionHeader}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <Pressable
                onPress={() => setShowTagInput(true)}
                style={({ pressed }) => [
                  styles.addTagButton,
                  pressed && styles.pressedButton,
                ]}
              >
                <Ionicons name="add" size={wp(4)} color="#fff" />
                <Text style={styles.addTagText}>Add Tag</Text>
              </Pressable>
            </View>

            {/* Tag Input */}
            {showTagInput && (
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  placeholder="Enter tag name"
                  placeholderTextColor="#666"
                  value={tagInput}
                  onChangeText={setTagInput}
                  autoCapitalize="none"
                  onSubmitEditing={handleAddTag}
                />
                <Pressable
                  onPress={handleAddTag}
                  style={({ pressed }) => [
                    styles.tagAddButton,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <Ionicons name="checkmark" size={wp(4)} color="#fff" />
                </Pressable>
                <Pressable
                  onPress={() => setShowTagInput(false)}
                  style={({ pressed }) => [
                    styles.tagCancelButton,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <Ionicons name="close" size={wp(4)} color="#aaa" />
                </Pressable>
              </View>
            )}

            {/* Tags Display */}
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                    <Pressable
                      onPress={() => handleRemoveTag(tag)}
                      style={({ pressed }) => pressed && styles.pressedButton}
                    >
                      <Ionicons name="close" size={wp(3.5)} color="#fff" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Tabs */}
        <View style={styles.bottomTabs}>
          {["Video", "Post"].map((tab) => (
            <Pressable
              key={tab}
              style={({ pressed }) => [
                styles.bottomTab,
                selectedTab === tab && styles.activeBottomTab,
                pressed && styles.pressedTab,
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text
                style={[
                  styles.bottomTabText,
                  selectedTab === tab && styles.activeBottomTabText,
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    paddingTop: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: "#272727",
  },
  headerButton: {
    padding: wp(2),
  },
  headerTitle: {
    color: "#fff",
    fontSize: fp(4.5),
    fontWeight: "600",
  },
  postButton: {
    backgroundColor: "#ff0000",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(5),
  },
  postButtonDisabled: {
    backgroundColor: "#666",
  },
  postButtonText: {
    color: "#fff",
    fontSize: fp(3.5),
    fontWeight: "600",
  },
  postButtonTextDisabled: {
    color: "#aaa",
  },
  pressedButton: {
    opacity: 0.7,
  },
  pressedTab: {
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(4),
    backgroundColor: "#0f0f0f",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(2),
  },
  userAvatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: "#ff0000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
  },
  userAvatarText: {
    color: "#fff",
    fontSize: fp(4),
    fontWeight: "bold",
  },
  userDetails: {
    flex: 1,
  },
  username: {
    color: "#fff",
    fontSize: fp(4),
    fontWeight: "500",
    marginBottom: hp(0.5),
  },
  privacyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  privacyText: {
    color: "#aaa",
    fontSize: fp(3.5),
    marginLeft: wp(1),
    marginRight: wp(2),
  },
  contentInput: {
    color: "#fff",
    fontSize: fp(4),
    minHeight: hp(15),
    textAlignVertical: "top",
    marginBottom: hp(2.5),
  },
  mediaSection: {
    marginBottom: hp(2.5),
  },
  sectionTitle: {
    color: "#fff",
    fontSize: fp(4),
    fontWeight: "500",
    marginBottom: hp(1.5),
  },
  urlInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: wp(2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.5),
    borderWidth: 1,
    borderColor: "#333",
  },
  urlIcon: {
    marginRight: wp(2),
  },
  urlInput: {
    flex: 1,
    color: "#fff",
    fontSize: fp(3.5),
  },
  urlPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(1),
  },
  urlPreviewText: {
    color: "#4CAF50",
    fontSize: fp(3),
    marginLeft: wp(1),
  },
  urlErrorText: {
    color: "#ff4444",
    fontSize: fp(3),
    marginLeft: wp(1),
  },
  tagsSection: {
    marginBottom: hp(2.5),
  },
  tagsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1.5),
  },
  addTagButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff0000",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.75),
    borderRadius: wp(4),
  },
  addTagText: {
    color: "#fff",
    fontSize: fp(3),
    marginLeft: wp(1),
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.5),
  },
  tagInput: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    color: "#fff",
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: "#333",
    marginRight: wp(2),
    fontSize: fp(3.5),
  },
  tagAddButton: {
    backgroundColor: "#4CAF50",
    padding: wp(2),
    borderRadius: wp(4),
    marginRight: wp(1),
  },
  tagCancelButton: {
    padding: wp(2),
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff0000",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.75),
    borderRadius: wp(4),
    marginRight: wp(2),
    marginBottom: hp(1),
  },
  tagText: {
    color: "#fff",
    fontSize: fp(3),
    marginRight: wp(1),
  },
  mediaThumbnails: {
    marginBottom: hp(2.5),
  },
  thumbnail: {
    width: wp(20),
    height: wp(20),
    marginRight: wp(2),
  },
  thumbnailPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#272727",
    borderRadius: wp(2),
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: hp(2.5),
  },
  actionButton: {
    padding: wp(3),
  },
  bottomTabs: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#272727",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(2),
  },
  bottomTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: hp(1),
  },
  activeBottomTab: {
    backgroundColor: "#333",
    borderRadius: wp(5),
    marginHorizontal: wp(2),
  },
  bottomTabText: {
    color: "#aaa",
    fontSize: fp(3.5),
  },
  activeBottomTabText: {
    color: "#fff",
  },
});

export default AddPost;
