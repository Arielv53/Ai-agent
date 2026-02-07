import React from "react";
import { Dimensions, FlatList, Image, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;
const imageSize = (screenWidth - 48) / 3;

export default function CatchGrid({ catches }: { catches: any[] }) {
  return (
    <FlatList
      data={catches}
      keyExtractor={(item) => item.id.toString()}
      numColumns={3}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      renderItem={({ item }) => (
        <Image source={{ uri: item.image_url }} style={styles.image} />
      )}
      contentContainerStyle={{ paddingBottom: 80 }}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: 6,
    marginBottom: 8,
  },
});
