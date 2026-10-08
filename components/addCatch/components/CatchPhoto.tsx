import React from "react";
import { Image, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { CatchForm } from "../_hooks/useCatchForm";
import { styles } from "../styles";

type Props = {
  form: Pick<
    CatchForm,
    "file"
    | "pickImage"
  >;
};

export default function CatchPhoto({ form }: Props) {
  const {
    file,
    pickImage,
  } = form;
  return (
    <>
      {/* ✅ Image Placeholder or Selected Image */}
      {!file ? (
        <TouchableOpacity onPress={pickImage} style={styles.imagePlaceholder}>
          <ImageBackground
            source={require("../../../assets/stats/stats-banner.jpg")}
            style={styles.uploadBackground}
            imageStyle={styles.uploadBackgroundImage}
          >
            <View style={styles.uploadOverlay}>
              <View style={styles.cameraBadge}>
                <Ionicons name="camera-outline" size={29} color="#20bfff" />
              </View>
              <Text style={styles.imagePlaceholderText}>Tap to Upload Photo</Text>
              <Text style={styles.uploadHint}>Add a photo of your catch</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      ) : (
        <Image
          source={{ uri: file.uri }}
          style={styles.previewImage}
          resizeMode="cover"
        />
      )}
    </>
  );
}
