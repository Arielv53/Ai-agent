import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PremiumGate from "./components/PremiumGate";
import {
  NotificationLevel,
  SpotGroup,
  SpotGroupMessage,
} from "./types";

type AccessState = "loading" | "ready" | "premium-required" | "error";

const NOTIFICATION_OPTIONS: {
  value: NotificationLevel;
  label: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    value: "all",
    label: "All messages",
    detail: "Notify me for every new message",
    icon: "notifications-outline",
  },
  {
    value: "mentions",
    label: "Mentions only",
    detail: "Only notify me when someone mentions me",
    icon: "at-outline",
  },
  {
    value: "muted",
    label: "Muted",
    detail: "Do not send notifications for this group",
    icon: "notifications-off-outline",
  },
];

function formatMessageTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SpotGroupChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = Number(id);
  const { token, user, loading: authLoading } = useAuth();
  const listRef = useRef<FlatList<SpotGroupMessage>>(null);
  const [group, setGroup] = useState<SpotGroup | null>(null);
  const [messages, setMessages] = useState<SpotGroupMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [accessState, setAccessState] = useState<AccessState>("loading");
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [preferenceLoading, setPreferenceLoading] = useState(false);

  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : undefined;

  const loadMessages = useCallback(async (signal?: AbortSignal) => {
    if (!token || !Number.isInteger(groupId)) {
      return;
    }

    const response = await fetch(
      `${API_BASE}/spot-groups/${groupId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      },
    );

    if (!response.ok) {
      return;
    }

    const body = await response.json();

    if (Array.isArray(body) && !signal?.aborted) {
      setMessages(body);
    }
  }, [groupId, token]);

  const loadGroup = useCallback(async (signal?: AbortSignal) => {
    if (authLoading || !token || !Number.isInteger(groupId)) {
      return;
    }

    setAccessState("loading");

    try {
      const response = await fetch(`${API_BASE}/spot-groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      });
      const body = await response.json().catch(() => ({}));

      if (response.status === 403 && body.code === "PREMIUM_REQUIRED") {
        setAccessState("premium-required");
        return;
      }

      if (!response.ok) {
        throw new Error(body.error || "Unable to load this spot group.");
      }

      setGroup(body);
      setAccessState("ready");

      if (body.is_joined) {
        await loadMessages(signal);
      }
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      console.error("Unable to load spot group", error);
      setAccessState("error");
    }
  }, [authLoading, groupId, loadMessages, token]);

  useEffect(() => {
    const controller = new AbortController();
    void loadGroup(controller.signal);

    return () => controller.abort();
  }, [loadGroup]);

  useEffect(() => {
    if (accessState !== "ready" || !group?.is_joined) {
      return;
    }

    const interval = setInterval(() => {
      void loadMessages();
    }, 6000);

    return () => clearInterval(interval);
  }, [accessState, group?.is_joined, loadMessages]);

  useEffect(() => {
    if (messages.length) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [messages.length]);

  const joinGroup = async () => {
    if (!token || !group) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/spot-groups/${group.id}/membership`,
        {
          method: "POST",
          headers,
        },
      );
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error || "Unable to join this group.");
      }

      setGroup(body);
      await loadMessages();
    } catch (error) {
      Alert.alert(
        "Unable to join",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  const sendMessage = async () => {
    const content = draft.trim();

    if (!token || !group || !content || sending) {
      return;
    }

    setSending(true);

    try {
      const response = await fetch(
        `${API_BASE}/spot-groups/${group.id}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        },
      );
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error || "Unable to send this message.");
      }

      setMessages((current) => [...current, body]);
      setDraft("");
    } catch (error) {
      Alert.alert(
        "Message not sent",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  const updateNotificationLevel = async (level: NotificationLevel) => {
    if (!token || !group || preferenceLoading) {
      return;
    }

    setPreferenceLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/spot-groups/${group.id}/membership`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notification_level: level }),
        },
      );
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error || "Unable to update notifications.");
      }

      setGroup((current) =>
        current
          ? {
              ...current,
              notification_level: body.notification_level,
            }
          : current,
      );
      setMenuOpen(false);
    } catch (error) {
      Alert.alert(
        "Settings not saved",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setPreferenceLoading(false);
    }
  };

  const leaveGroup = () => {
    if (!token || !group) {
      return;
    }

    Alert.alert(
      `Leave ${group.name}?`,
      "You can join this group again at any time.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_BASE}/spot-groups/${group.id}/membership`,
                {
                  method: "DELETE",
                  headers,
                },
              );

              if (!response.ok) {
                throw new Error("Unable to leave this group.");
              }

              setMenuOpen(false);
              router.back();
            } catch (error) {
              Alert.alert(
                "Unable to leave",
                error instanceof Error ? error.message : "Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  const renderMessage = ({ item }: { item: SpotGroupMessage }) => {
    const isOwnMessage = item.user.id === user?.id;
    const initial = item.user.username.charAt(0).toUpperCase();

    return (
      <View
        style={[
          styles.messageRow,
          isOwnMessage && styles.ownMessageRow,
        ]}
      >
        {!isOwnMessage && (
          <View style={styles.avatar}>
            {item.user.profile_photo ? (
              <Image
                source={{ uri: item.user.profile_photo }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
          </View>
        )}

        <View style={styles.messageContent}>
          <View style={styles.messageMeta}>
            <Text style={styles.messageAuthor}>
              {isOwnMessage ? "You" : item.user.username}
            </Text>
            <Text style={styles.messageTime}>
              {formatMessageTime(item.created_at)}
            </Text>
          </View>

          <View
            style={[
              styles.messageBubble,
              isOwnMessage && styles.ownMessageBubble,
            ]}
          >
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Return to spot groups"
        >
          <Ionicons name="chevron-back" size={23} color="#dff6ff" />
        </TouchableOpacity>

        <View style={styles.headerIdentity}>
          <View style={styles.headerIcon}>
            <Ionicons name="location" size={18} color="#18baff" />
          </View>
          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {group?.name || "Spot Group"}
            </Text>
            {!!group && (
              <Text style={styles.headerMeta}>
                {group.member_count} {group.member_count === 1 ? "member" : "members"}
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setMenuOpen(true)}
          disabled={!group?.is_joined}
          accessibilityRole="button"
          accessibilityLabel="Group settings"
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={22}
            color={group?.is_joined ? "#dff6ff" : "#476171"}
          />
        </TouchableOpacity>
      </View>

      {accessState === "premium-required" ? (
        <PremiumGate />
      ) : accessState === "loading" ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#18baff" size="large" />
        </View>
      ) : accessState === "error" || !group ? (
        <View style={styles.centered}>
          <Text style={styles.statusText}>Unable to load this spot group.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void loadGroup()}
          >
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : !group.is_joined ? (
        <View style={styles.centered}>
          <View style={styles.joinIcon}>
            <Ionicons name="chatbubbles" size={38} color="#18baff" />
          </View>
          <Text style={styles.joinTitle}>Join the conversation</Text>
          <Text style={styles.statusText}>{group.description}</Text>
          <TouchableOpacity style={styles.joinButton} onPress={joinGroup}>
            <Text style={styles.joinButtonText}>Join {group.name}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.guidelines}>
            <Ionicons name="pin" size={18} color="#18baff" />
            <View style={styles.guidelineTextGroup}>
              <Text style={styles.guidelineTitle}>Spot Guidelines</Text>
              <Text style={styles.guidelineText}>
                Share conditions, catches, and advice. Protect exact honey holes.
              </Text>
            </View>
          </View>

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(message) => String(message.id)}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            keyboardDismissMode="on-drag"
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Start the conversation with a current fishing report.
              </Text>
            }
          />

          <View style={styles.composer}>
            <TextInput
              style={styles.composerInput}
              value={draft}
              onChangeText={setDraft}
              placeholder={`Share with ${group.name}…`}
              placeholderTextColor="#6f8d9c"
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!draft.trim() || sending) && styles.sendButtonDisabled,
              ]}
              onPress={() => void sendMessage()}
              disabled={!draft.trim() || sending}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              {sending ? (
                <ActivityIndicator color="#02111b" size="small" />
              ) : (
                <Ionicons name="send" size={19} color="#02111b" />
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
        >
          <View style={styles.settingsCard}>
            <Text style={styles.settingsTitle}>Notifications</Text>

            {NOTIFICATION_OPTIONS.map((option) => {
              const selected = group?.notification_level === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={styles.settingRow}
                  onPress={() => void updateNotificationLevel(option.value)}
                  disabled={preferenceLoading}
                >
                  <View style={styles.settingIcon}>
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={selected ? "#18baff" : "#8aa7b6"}
                    />
                  </View>
                  <View style={styles.settingTextGroup}>
                    <Text style={styles.settingLabel}>{option.label}</Text>
                    <Text style={styles.settingDetail}>{option.detail}</Text>
                  </View>
                  <Ionicons
                    name={selected ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={selected ? "#18baff" : "#5d7887"}
                  />
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.leaveRow} onPress={leaveGroup}>
              <Ionicons name="exit-outline" size={21} color="#ff6868" />
              <Text style={styles.leaveText}>Leave group</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020d16",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#06354d",
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#075a83",
    backgroundColor: "#061c2d",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#082b43",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  headerMeta: {
    color: "#7fa1b2",
    fontSize: 11,
    marginTop: 2,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  statusText: {
    color: "#9fbdcc",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: "#0a6f98",
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
    marginTop: 18,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
  },
  joinIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#07253a",
    alignItems: "center",
    justifyContent: "center",
  },
  joinTitle: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "800",
    marginTop: 20,
  },
  joinButton: {
    backgroundColor: "#18baff",
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 13,
    marginTop: 24,
  },
  joinButtonText: {
    color: "#02111b",
    fontWeight: "800",
  },
  guidelines: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderColor: "#075a83",
    borderRadius: 12,
    backgroundColor: "#052035",
    marginHorizontal: 14,
    marginTop: 12,
    padding: 12,
  },
  guidelineTextGroup: {
    flex: 1,
  },
  guidelineTitle: {
    color: "#18baff",
    fontSize: 13,
    fontWeight: "800",
  },
  guidelineText: {
    color: "#9fbdcc",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  messageList: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingVertical: 18,
  },
  emptyText: {
    color: "#7895a4",
    textAlign: "center",
    marginTop: 50,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginBottom: 18,
    maxWidth: "88%",
  },
  ownMessageRow: {
    alignSelf: "flex-end",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0b4565",
    borderWidth: 1,
    borderColor: "#0b75a2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "800",
  },
  messageContent: {
    flexShrink: 1,
  },
  messageMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 5,
  },
  messageAuthor: {
    color: "#eaf8ff",
    fontSize: 12,
    fontWeight: "800",
  },
  messageTime: {
    color: "#688899",
    fontSize: 10,
  },
  messageBubble: {
    backgroundColor: "#071f31",
    borderWidth: 1,
    borderColor: "#075a83",
    borderRadius: 14,
    borderTopLeftRadius: 4,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  ownMessageBubble: {
    backgroundColor: "#0a5a7d",
    borderColor: "#0b7fab",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 4,
  },
  messageText: {
    color: "#f1fbff",
    fontSize: 14,
    lineHeight: 20,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 9,
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: "#06354d",
    backgroundColor: "#03131f",
  },
  composerInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: "#075a83",
    borderRadius: 22,
    backgroundColor: "#061c2d",
    color: "#fff",
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#18baff",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.42,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 7, 12, 0.72)",
    justifyContent: "flex-end",
  },
  settingsCard: {
    backgroundColor: "#061827",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: "#075a83",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 22,
  },
  settingsTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#0a3249",
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#09283c",
    alignItems: "center",
    justifyContent: "center",
  },
  settingTextGroup: {
    flex: 1,
  },
  settingLabel: {
    color: "#eefaff",
    fontSize: 14,
    fontWeight: "700",
  },
  settingDetail: {
    color: "#7895a4",
    fontSize: 11,
    marginTop: 3,
  },
  leaveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
    marginTop: 6,
  },
  leaveText: {
    color: "#ff6868",
    fontSize: 15,
    fontWeight: "700",
  },
});
