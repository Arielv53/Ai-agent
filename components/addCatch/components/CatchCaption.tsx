import React from "react";
import { TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { CatchForm } from "../_hooks/useCatchForm";
import { styles } from "../styles";

type Props = {
  form: Pick<
    CatchForm,
    "caption"
    | "setCaption"
  >;
};

export default function CatchCaption({ form }: Props) {
  const {
    caption,
    setCaption,
  } = form;
  return (
    <>
      <View style={styles.captionContainer}>
        <Ionicons name="create-outline" size={20} color="#20bfff" />
        <TextInput
          placeholder="Write a caption for your post"
          value={caption}
          onChangeText={setCaption}
          style={styles.captionInput}
          placeholderTextColor="#83a8bd"
          multiline
          maxLength={500}
        />
      </View>
    </>
  );
}
