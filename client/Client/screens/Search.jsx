"use client";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { getSecure } from "../helpers/secureStone";
import { useNavigation } from "@react-navigation/native";

const SEARCH_USER = gql`
  query SearchUser($searchTerm: String!) {
    searchUser(searchTerm: $searchTerm) {
      username
      name
      _id
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

const Search = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Get current user ID from secure storage
  useEffect(() => {
    (async () => {
      const storedUserId = await getSecure("userId");
      setCurrentUserId(storedUserId);
    })();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, loading, error } = useQuery(SEARCH_USER, {
    variables: { searchTerm: debouncedSearchTerm },
    skip: !debouncedSearchTerm.trim(),
  });

  const [followUser] = useMutation(FOLLOW_USER, {
    onCompleted: (data) => {
      const followingId = data.followUser.followingId;
      setFollowingUsers((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(followingId)) {
          newSet.delete(followingId);
        } else {
          newSet.add(followingId);
        }
        return newSet;
      });
    },
    onError: (error) => {
      console.error("Follow error:", error);
    },
  });

  const handleFollow = async (userId) => {
    try {
      await followUser({
        variables: {
          followingId: userId,
        },
      });
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
  };

  const handleUserPress = (userId) => {
    navigation?.navigate("Profile", { userId });
  };

  const generateFollowerCount = () => {
    const counts = ["198K", "45.2K", "12.8K", "626", "1.2M", "89.5K"];
    return counts[Math.floor(Math.random() * counts.length)];
  };

  const renderUserItem = ({ item, index }) => {
    const isFollowing = followingUsers.has(item._id);
    const isCurrentUser = item._id === currentUserId;

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleUserPress(item._id)}
      >
        <View style={styles.userInfo}>
          {/* Profile Avatar */}
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {item.username?.charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* User Details */}
          <View style={styles.userDetails}>
            <View style={styles.usernameContainer}>
              <Text style={styles.username}>{item.username}</Text>
              {index === 0 && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#4a9eff"
                  style={styles.verifiedIcon}
                />
              )}
            </View>
            <Text style={styles.displayName}>{item.name}</Text>
            <Text style={styles.followerCount}>
              {generateFollowerCount()} followers
            </Text>
          </View>
        </View>

        {/* Follow Button */}
        {!isCurrentUser && (
          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={() => handleFollow(item._id)}
          >
            <Ionicons
              name={isFollowing ? "person-remove" : "person-add"}
              size={20}
              color={isFollowing ? "#ff4444" : "#fff"}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderSearchSuggestion = () => {
    if (!searchTerm.trim()) return null;

    return (
      <TouchableOpacity style={styles.searchSuggestion}>
        <Ionicons name="search" size={20} color="#aaa" />
        <Text style={styles.searchSuggestionText}>{searchTerm}</Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (!debouncedSearchTerm.trim()) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={48} color="#666" />
          <Text style={styles.emptyStateTitle}>Search for users</Text>
          <Text style={styles.emptyStateSubtitle}>
            Find and follow other users on the platform
          </Text>
        </View>
      );
    }

    if (data && data.searchUser.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="person-outline" size={48} color="#666" />
          <Text style={styles.emptyStateTitle}>No users found</Text>
          <Text style={styles.emptyStateSubtitle}>
            Try searching with a different term
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#aaa"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="#666"
            value={searchTerm}
            onChangeText={setSearchTerm}
            autoFocus
            returnKeyType="search"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearButton}
            >
              <Ionicons name="close" size={20} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading && debouncedSearchTerm ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff0000" />
            <Text style={styles.loadingText}>Searching users...</Text>
          </View>
        ) : (
          <FlatList
            data={data?.searchUser || []}
            renderItem={renderUserItem}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={renderSearchSuggestion}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#272727",
  },
  backButton: {
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 12,
  },
  listContainer: {
    flexGrow: 1,
  },
  searchSuggestion: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#272727",
  },
  searchSuggestionText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 12,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ff0000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userDetails: {
    flex: 1,
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  username: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  displayName: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 2,
  },
  followerCount: {
    color: "#aaa",
    fontSize: 12,
  },
  followButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ff0000",
    justifyContent: "center",
    alignItems: "center",
  },
  followingButton: {
    backgroundColor: "#333",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default Search;
