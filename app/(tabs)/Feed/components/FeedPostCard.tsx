import { getPostAge } from "../_utils/postTime";
import { Image } from "expo-image";
import { feedImageUrl } from "@/components/feedImage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useEffect, useRef, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCatchComments } from "../_hooks/useCatchComments";
import { PublicCatch } from "../types";
import CatchComments from "./CatchComments";

interface Props {
  post: PublicCatch;
  onLikeToggle: (id: number) => void;
  onOptionsPress?: () => void;
}

function FeedPostCard({ post, onLikeToggle, onOptionsPress }: Props) {
  // state to control enlarged image modal
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const router = useRouter();
  const comments = useCatchComments(post.id, post.comments_count ?? 0, post.comments_preview, post.comments_next_cursor);
  const commentInput = useRef<TextInput>(null);

  const goToUserProfile = () => {
    router.push(`/UserProfile/${post.user_id}`);
  };

  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!post.created_at) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, [post.created_at]);
  const postAge = getPostAge(post.created_at, now);

  return (
    <>
      <View style={styles.postCard}>
        {/* 🧑‍🎣 User header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={goToUserProfile}>
            <Image
              source={{
                uri:
                  (post.user_avatar ? feedImageUrl(post.user_avatar, 144) : "") ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              cachePolicy="memory-disk" contentFit="cover" style={styles.avatar}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <TouchableOpacity onPress={goToUserProfile}>
              <Text style={styles.userName}>
                {post.user_name || "Anonymous"}
              </Text>
            </TouchableOpacity>
            {postAge && <Text style={styles.timestamp}>{postAge}</Text>}
          </View>

          <View style={{ flex: 1 }} />

          {onOptionsPress && <TouchableOpacity onPress={onOptionsPress} style={styles.moreButton} accessibilityLabel="Post options">
            <Ionicons name="ellipsis-horizontal" size={21} color="#d2effa" />
          </TouchableOpacity>}

        </View>

        {/* 🐟 Catch image */}
        <TouchableOpacity onPress={() => setImageModalVisible(true)} style={styles.imageContainer}>
          <Image source={{ uri: feedImageUrl(post.image_url, 1080) }} cachePolicy="memory-disk" contentFit="cover" style={styles.postImage} />
        </TouchableOpacity>

        {/* 📄 Location */}
        <View style={styles.locationContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="fish-outline" size={18} color="#14baff" />
            <Text numberOfLines={1} style={styles.speciesText}>{post.species}</Text>
          </View>
          {post.location && (
            <View style={[styles.detailRow, styles.locationRow]}>
              <Ionicons name="location" size={17} color="#14baff" />
              <Text numberOfLines={1} style={styles.locationText}>{post.location}</Text>
            </View>
          )}
        </View>

        {/* 📄 Caption */}
        <View style={styles.captionContainer}>
          {post.caption ? ( 
            <Text style={styles.captionText}>{post.caption}</Text>
          ) : null}
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
            <Text style={styles.actionText}>
              {post.likes_count || 0} {post.likes_count === 1 ? "Like" : "Likes"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => commentInput.current?.focus()}
            accessibilityRole="button" accessibilityLabel="Add a comment">
            <Ionicons name="chatbubble-outline" size={20} color="#868585ff" />
            <Text style={styles.actionText}>
              {comments.count} {comments.count === 1 ? "Comment" : "Comments"}
            </Text>
          </TouchableOpacity>
        </View>
        <CatchComments state={comments} inputRef={commentInput} />
      </View>

      {/* NEW: fullscreen image modal */}
      {imageModalVisible && <Modal visible={imageModalVisible} transparent={true}>
        <TouchableOpacity
          style={styles.modalContainer}
          onPress={() => setImageModalVisible(false)} // NEW: tap anywhere to close
        >
          <Image
            source={{ uri: post.image_url }}
            style={styles.fullImage} // NEW: enlarged image
            contentFit="contain"
            cachePolicy="disk"
          />
        </TouchableOpacity>
      </Modal>}
    </>
  );
}

export default memo(FeedPostCard);

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: "#031527a6",
    marginBottom: 14,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 14,
    borderWidth: .5,
    borderColor: "#07638e",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    marginRight: 8,
    marginLeft: 9,
  },
  headerTextContainer: {
    flexDirection: "column",
  },
  userName: {
    fontWeight: "600",
    fontSize: 17,
    color: "#f0f0f0ff",
  },
  timestamp: {
    color: "#9cc1d3",
    fontSize: 12,
  },
  moreButton: { padding: 4 },
  imageContainer: { marginHorizontal: 14, borderRadius: 12, overflow: "hidden" },
  postImage: {
    width: "100%",
    height: 300,
  },
  modalContainer: {
    // modal background
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    // enlarged image
    width: "100%",
    height: "80%",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 2,
  },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 5, flexShrink: 1, minWidth: 0 },
  locationRow: { marginLeft: "auto", justifyContent: "flex-end", maxWidth: "55%" },
  speciesText: {
    flexShrink: 1,
    fontWeight: "500",
    fontSize: 13,
    color: "#a9c8d8",
  },
  locationText: {
    flexShrink: 1,
    color: "#a9c8d8",
    fontSize: 13,
  },
  captionContainer: {
    paddingHorizontal: 14,
    paddingTop: 7,
    paddingBottom: 8,
  },
  captionText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#ffffff",
    marginBottom: 4,
    lineHeight: 19,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    marginHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: "#0a4c6d",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#c5e4f1",
  },
});
