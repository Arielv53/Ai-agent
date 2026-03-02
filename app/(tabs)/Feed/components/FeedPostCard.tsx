import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PublicCatch } from "../index";

interface Props {
  post: PublicCatch;
  onLikeToggle: (id: number) => void;
}

export default function FeedPostCard({ post, onLikeToggle }: Props) {
  const [isFollowing, setIsFollowing] = useState(post.is_following ?? false);

  const [followLoading, setFollowLoading] = useState(false);
  const router = useRouter();
  const { user, token } = useAuth();
  console.log("Auth user:", user);
  console.log("Auth token:", token);

  const goToUserProfile = () => {
    router.push(`/UserProfile/${post.user_id}`);
  };

  // 🆕 REAL FOLLOW TOGGLE USING AUTH TOKEN
  const handleFollowToggle = async () => {
    if (!user || !token) return;

    try {
      setFollowLoading(true);

      const endpoint = isFollowing ? "/unfollow" : "/follow";

      console.log("TOKEN BEING SENT:", token);
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🆕 SECURE AUTH HEADER
        },
        body: JSON.stringify({
          following_id: post.user_id, // 🆕 ONLY SEND TARGET USER
        }),
      });

      if (!res.ok) {
        throw new Error("Follow request failed");
      }

      setIsFollowing((prev) => !prev);
    } catch (err) {
      console.error("Follow error:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <View style={styles.postCard}>
      {/* 🧑‍🎣 User header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={goToUserProfile}>
          <Image
            source={{
              uri:
                post.user_avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <TouchableOpacity onPress={goToUserProfile}>
            <Text style={styles.userName}>{post.user_name || "Anonymous"}</Text>
          </TouchableOpacity>
          <Text style={styles.timestamp}>
            {new Date(post.date_caught).toLocaleDateString()}
          </Text>
        </View>

        {/* 🆕 FLEX SPACER (must be INSIDE headerRow) */}
        <View style={{ flex: 1 }} />

        {/* 🆕 FOLLOW BUTTON (must also be INSIDE headerRow) */}
        {user && post.user_id !== user.id && (
          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={handleFollowToggle}
            disabled={followLoading}
          >
            <Text style={styles.followText}>
              {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 🐟 Catch image */}
      <Image source={{ uri: post.image_url }} style={styles.postImage} />

      {/* 📄 Caption */}
      <View style={styles.captionContainer}>
        <Text style={styles.speciesText}>{post.species}</Text>
        {post.location && (
          <Text style={styles.captionText}>Caught near {post.location}</Text>
        )}
      </View>

      {/* ❤️ 💬 Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onLikeToggle(post.id)}
        >
          <Ionicons
            name={post.liked ? "heart" : "heart-outline"}
            size={20}
            color={post.liked ? "#00c8ffba" : "#868585ff"}
          />
          <Text style={styles.actionText}>{post.like_count || 0} Likes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#868585ff" />
          <Text style={styles.actionText}>
            {post.comment_count || 0} Comments
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: "#020d16ff",
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 12,
    borderWidth: 0.5,
    borderColor: "#00c8ff3d",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  headerTextContainer: {
    flexDirection: "column",
  },
  userName: {
    fontWeight: "600",
    fontSize: 16,
    color: "#f0f0f0ff",
  },
  timestamp: {
    color: "#999",
    fontSize: 11,
    marginTop: 3,
  },
  followButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#00c8ffb3",
    backgroundColor: "#1f2a33",
  },
  followingButton: {
    backgroundColor: "#1f2a33",
    borderWidth: 1,
    borderColor: "#00c8ff9f",
  },
  followText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  postImage: {
    width: "90%",
    alignSelf: "center",
    borderRadius: 12,
    height: 300,
  },
  captionContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
  },
  speciesText: {
    fontWeight: "700",
    fontSize: 15,
    color: "#f9f8f8ff",
  },
  captionText: {
    color: "#cccbcbff",
    fontSize: 13,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#00c8ff3d",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    color: "#fdfcfcff",
  },
});
