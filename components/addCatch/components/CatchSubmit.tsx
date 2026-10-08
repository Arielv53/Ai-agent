import React from "react";
import { Animated, Text, TouchableOpacity } from "react-native";
import type { CatchForm } from "../_hooks/useCatchForm";
import { styles } from "../styles";

type Props = {
  form: Pick<
    CatchForm,
    "editReady"
    | "loading"
    | "error"
    | "successMessage"
    | "editId"
    | "fadeAnim"
    | "handleSubmit"
  >;
};

export default function CatchSubmit({ form }: Props) {
  const {
    editReady,
    loading,
    error,
    successMessage,
    editId,
    fadeAnim,
    handleSubmit,
  } = form;
  return (
    <>
      <TouchableOpacity
        style={[styles.addButton, loading && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={loading || (!!editId && !editReady)}
      >
        <Text style={styles.addButtonText}>
          {loading ? "Saving..." : editId ? "Save changes" : "Add Catch"}
        </Text>
      </TouchableOpacity>

      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      {successMessage ? (
        <Animated.View
          style={{
            opacity: fadeAnim,
            backgroundColor: "#2f2e2e",
            borderColor: "#f5b20b",
            borderWidth: 1,
            padding: 10,
            borderRadius: 8,
            marginTop: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#f5b20b", fontWeight: "600" }}>
            {successMessage}
          </Text>
        </Animated.View>
      ) : null}
    </>
  );
}
