import { API_BASE } from "@/constants/config";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import SpotGroupCard from "./components/SpotGroupCard";
import { SpotGroup } from "./types";

type AccessState = "loading" | "ready" | "premium-required" | "error";

export default function SpotGroupsScreen() {
  const { token, user, loading: authLoading } = useAuth();
  const [groups, setGroups] = useState<SpotGroup[]>([]);
  const [query, setQuery] = useState("");
  const [accessState, setAccessState] = useState<AccessState>("loading");
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestCity, setRequestCity] = useState(user?.city || "");
  const [requesting, setRequesting] = useState(false);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  const loadPendingRequestCount = useCallback(async (signal?: AbortSignal) => {
    if (!token || !user?.is_admin) {
      setPendingRequestCount(0);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/admin/spot-locations/pending-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
        },
      );
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error || "Unable to load pending request count.");
      }

      if (!signal?.aborted) {
        setPendingRequestCount(Number(body.count) || 0);
      }
    } catch (error) {
      if (!signal?.aborted) {
        console.error("Unable to load pending location count", error);
      }
    }
  }, [token, user?.is_admin]);

  const loadGroups = useCallback(async (signal?: AbortSignal) => {
    if (authLoading) {
      return;
    }

    if (!token) {
      setAccessState("error");
      return;
    }

    setAccessState("loading");

    try {
      const response = await fetch(`${API_BASE}/spot-groups`, {
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

      if (!response.ok || !Array.isArray(body)) {
        throw new Error(body.error || "Unable to load spot groups.");
      }

      setGroups(body);
      setAccessState("ready");
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      console.error("Unable to load spot groups", error);
      setAccessState("error");
    }
  }, [authLoading, token]);

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      void loadGroups(controller.signal);
      void loadPendingRequestCount(controller.signal);

      return () => controller.abort();
    }, [loadGroups, loadPendingRequestCount]),
  );

  const visibleGroups = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return groups;
    }

    return groups.filter((group) =>
      `${group.name} ${group.city}`.toLowerCase().includes(search),
    );
  }, [groups, query]);

  const openGroup = (group: SpotGroup) => {
    router.push({
      pathname: "/spot-groups/[id]",
      params: {
        id: String(group.id),
      },
    });
  };

  const joinGroup = async (group: SpotGroup) => {
    if (!token || joiningId !== null) {
      return;
    }

    setJoiningId(group.id);

    try {
      const response = await fetch(
        `${API_BASE}/spot-groups/${group.id}/membership`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error || "Unable to join this group.");
      }

      setGroups((current) =>
        current.map((item) => (item.id === group.id ? body : item)),
      );
      openGroup(body);
    } catch (error) {
      Alert.alert(
        "Unable to join",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setJoiningId(null);
    }
  };

  const requestGroup = async () => {
    if (!token || !requestName.trim() || requesting) {
      return;
    }

    setRequesting(true);

    try {
      const response = await fetch(`${API_BASE}/spot-groups/requests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: requestName,
          city: requestCity,
          country: user?.country,
        }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok && response.status !== 202) {
        throw new Error(body.error || "Unable to request this location.");
      }

      setRequestOpen(false);
      setRequestName("");

      if (body.status === "active") {
        await loadGroups();
        Alert.alert(
          "Group already available",
          `${body.name} is already listed in Spot Groups.`,
        );
      } else {
        Alert.alert(
          "Request submitted",
          `${body.name} will appear after the location is reviewed.`,
        );
      }
    } catch (error) {
      Alert.alert(
        "Request not submitted",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setRequesting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Return to feed"
        >
          <Ionicons name="chevron-back" size={23} color="#dff6ff" />
        </TouchableOpacity>

        <View style={styles.titleGroup}>
          <Text style={styles.title}>Spot Groups</Text>
          <View style={styles.premiumPill}>
            <Ionicons name="star" size={9} color="#f4b942" />
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>
        </View>

        {user?.is_admin ? (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push("/spot-groups/admin" as never)}
            accessibilityRole="button"
            accessibilityLabel="Review requested locations"
          >
            <Ionicons name="shield-checkmark-outline" size={21} color="#f4b942" />
            {pendingRequestCount > 0 && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>
                  {pendingRequestCount > 99 ? "99+" : pendingRequestCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {accessState === "premium-required" ? (
        <PremiumGate />
      ) : accessState === "loading" ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#18baff" size="large" />
        </View>
      ) : accessState === "error" ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={38} color="#7895a4" />
          <Text style={styles.errorText}>
            Sign in again or retry when your connection is available.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void loadGroups()}
          >
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={visibleGroups}
          keyExtractor={(group) => String(group.id)}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={21} color="#82a6b8" />
                <TextInput
                  style={styles.searchInput}
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search fishing spots"
                  placeholderTextColor="#7895a4"
                  autoCorrect={false}
                  returnKeyType="search"
                />
              </View>

              <View style={styles.introRow}>
                <View>
                  <Text style={styles.sectionTitle}>Fishing locations</Text>
                  <Text style={styles.sectionSubtitle}>
                    Join active local chats and trade current reports.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.requestButton}
                  onPress={() => setRequestOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Request a Spot Group"
                >
                  <Ionicons name="add" size={19} color="#02111b" />
                  <Text style={styles.requestButtonText}>Request</Text>
                </TouchableOpacity>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <SpotGroupCard
              group={item}
              joining={joiningId === item.id}
              onOpen={() => openGroup(item)}
              onJoin={() => void joinGroup(item)}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No matching fishing spots.</Text>
          }
        />
      )}

      <Modal
        visible={requestOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setRequestOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <View style={styles.requestSheet}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Request a Spot Group</Text>
                <Text style={styles.sheetSubtitle}>
                  Requests are reviewed to prevent duplicate or private spots.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setRequestOpen(false)}
              >
                <Ionicons name="close" size={21} color="#d8edf6" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Location name</Text>
            <TextInput
              style={styles.requestInput}
              value={requestName}
              onChangeText={setRequestName}
              placeholder="Example: Coney Island Pier"
              placeholderTextColor="#6f8d9c"
              maxLength={120}
              autoFocus
            />

            <Text style={styles.inputLabel}>City or area</Text>
            <TextInput
              style={styles.requestInput}
              value={requestCity}
              onChangeText={setRequestCity}
              placeholder="Example: Brooklyn, NY"
              placeholderTextColor="#6f8d9c"
              maxLength={100}
            />

            <TouchableOpacity
              style={[
                styles.submitRequestButton,
                (!requestName.trim() || requesting) && styles.disabledButton,
              ]}
              onPress={() => void requestGroup()}
              disabled={!requestName.trim() || requesting}
            >
              {requesting ? (
                <ActivityIndicator color="#02111b" />
              ) : (
                <Text style={styles.submitRequestText}>Submit request</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
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
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 52,
    paddingBottom: 12,
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
  headerSpacer: {
    width: 38,
  },
  adminBadge: {
    position: "absolute",
    top: -5,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ff3b30",
    borderWidth: 2,
    borderColor: "#020d16",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  adminBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  titleGroup: {
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "800",
  },
  premiumPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  premiumText: {
    color: "#f4b942",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  errorText: {
    color: "#9fbdcc",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 14,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 18,
    backgroundColor: "#0a6f98",
    marginTop: 18,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#075a83",
    backgroundColor: "#061a2b",
    paddingHorizontal: 14,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
  },
  introRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 22,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#789bab",
    fontSize: 13,
    marginTop: 5,
  },
  requestButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 16,
    backgroundColor: "#18baff",
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  requestButtonText: {
    color: "#02111b",
    fontSize: 11,
    fontWeight: "800",
  },
  emptyText: {
    color: "#789bab",
    textAlign: "center",
    marginTop: 40,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 7, 12, 0.72)",
  },
  requestSheet: {
    backgroundColor: "#061827",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: "#075a83",
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 34,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 22,
  },
  sheetTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  sheetSubtitle: {
    maxWidth: 290,
    color: "#83a3b3",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#09283c",
    alignItems: "center",
    justifyContent: "center",
  },
  inputLabel: {
    color: "#cce4ee",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
  },
  requestInput: {
    height: 48,
    borderWidth: 1,
    borderColor: "#075a83",
    borderRadius: 12,
    backgroundColor: "#041a2d",
    color: "#fff",
    paddingHorizontal: 13,
    marginBottom: 17,
  },
  submitRequestButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#18baff",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  disabledButton: {
    opacity: 0.45,
  },
  submitRequestText: {
    color: "#02111b",
    fontWeight: "800",
  },
});
