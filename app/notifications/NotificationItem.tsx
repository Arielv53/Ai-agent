import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Notification = {
  id: number;
  type: "like" | "comment";
  catch_id?: number;
  actor_id: number;
  actor_username: string;
  actor_avatar_url?: string;
  is_read: boolean;
  created_at: string;
};

type Props = {
  notification: Notification;
  onPress: () => void;
};

export default function NotificationItem({ notification, onPress }: Props) {
  const message =
    notification.type === "like"
      ? "liked your catch"
      : "commented on your catch";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        !notification.is_read && styles.unread,
      ]}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {notification.actor_avatar_url ? (
          <Image
            source={{ uri: notification.actor_avatar_url }}
            style={styles.avatar}
          />
        ) : (
          <Ionicons name="person-circle" size={42} color="#6b7280" />
        )}
      </View>

      {/* Text */}
      <View style={styles.textContainer}>
        <Text style={styles.message}>
          <Text style={styles.username}>
            {notification.actor_username}
          </Text>{" "}
          {message}
        </Text>

        <Text style={styles.time}>
          {new Date(notification.created_at).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2933",
    backgroundColor: "#020d16",
  },
  unread: {
    backgroundColor: "#041826",
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    color: "#e5e7eb",
    fontSize: 17,
    lineHeight: 19,
  },
  username: {
    fontWeight: "600",
    color: "#fff",
  },
  time: {
    marginTop: 4,
    fontSize: 12,
    color: "#9ca3af",
  },
});