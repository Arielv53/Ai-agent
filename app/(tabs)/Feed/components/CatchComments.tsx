import { router } from "expo-router";
import { RefObject, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useCatchComments } from "../_hooks/useCatchComments";

type Props = {
  state: ReturnType<typeof useCatchComments>;
  inputRef: RefObject<TextInput | null>;
};

export default function CatchComments({ state, inputRef }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState("");
  const visible = expanded ? state.comments : state.comments.slice(0, 3);
  const post = async () => {
    if (await state.submit(draft)) setDraft("");
  };

  return (
    <View style={styles.container}>
      {state.loading && <ActivityIndicator color="#9cc1d3" />}
      {!!state.error && <TouchableOpacity onPress={state.retry} accessibilityRole="button">
        <Text style={styles.error}>{state.error} Tap to retry.</Text>
      </TouchableOpacity>}
      {visible.map((comment) => (
        <View key={comment.id} style={styles.comment}>
          <Text style={styles.content}>
            <Text style={styles.username} onPress={() => router.push({ pathname: "/UserProfile/[id]",
              params: { id: String(comment.user.id) } })}>{comment.user.username}</Text>
            {"  "}{comment.content}
          </Text>
        </View>
      ))}
      {state.count > 3 && <TouchableOpacity onPress={() => {
          if (!expanded && state.hasMore) state.loadMore();
          setExpanded((value) => !value);
        }}
        accessibilityRole="button" style={styles.expand}>
        <Text style={styles.link}>{expanded ? "Show fewer comments" : `View all ${state.count} comments`}</Text>
      </TouchableOpacity>}
      {expanded && state.hasMore && !state.loading && !state.error && (
        <TouchableOpacity onPress={state.loadMore} accessibilityRole="button" style={styles.expand}>
          <Text style={styles.link}>Load more comments</Text>
        </TouchableOpacity>
      )}
      {state.signedIn ? <View style={styles.composer}>
        <TextInput ref={inputRef} value={draft} onChangeText={setDraft} multiline maxLength={2000}
          editable={!state.posting} placeholder="Add a comment…" placeholderTextColor="#9cc1d3"
          accessibilityLabel="Add a comment" style={styles.input} />
        <TouchableOpacity onPress={post} accessibilityRole="button" accessibilityLabel="Post comment"
          disabled={state.posting || state.loading || !!state.error || !draft.trim()} style={styles.post}>
          {state.posting ? <ActivityIndicator color="#00c8ff" />
            : <Text style={[styles.link, (state.loading || !!state.error || !draft.trim()) && styles.disabled]}>Post</Text>}
        </TouchableOpacity>
      </View> : <Text style={styles.muted}>Sign in to comment.</Text>}
      {!!state.postError && <Text style={styles.error}>{state.postError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
  comment: { paddingVertical: 3 },
  content: { color: "#e3eff5", fontSize: 14, lineHeight: 21 },
  username: { fontWeight: "700", color: "#fff" },
  muted: { color: "#9cc1d3", fontSize: 13 },
  expand: { paddingVertical: 6 },
  link: { color: "#00c8ff", fontWeight: "600", fontSize: 14 },
  composer: { flexDirection: "row", alignItems: "center", backgroundColor: "#0c2435", borderRadius: 12, marginTop: 4 },
  input: { flex: 1, color: "#fff", padding: 12, fontSize: 14, maxHeight: 120 },
  post: { padding: 12 },
  disabled: { opacity: 0.4 },
  error: { color: "#ffb4ab", fontSize: 13 },
});
