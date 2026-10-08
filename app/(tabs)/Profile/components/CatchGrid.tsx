import { router } from "expo-router";
import React from "react";
import { Dimensions, FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
const screenWidth = Dimensions.get("window").width;
const imageSize = (screenWidth - 44) / 3;
export default function CatchGrid({ catches }: { catches: any[] }) { return <FlatList data={catches} keyExtractor={(item) => item.id.toString()} numColumns={3} columnWrapperStyle={styles.row} renderItem={({ item }) => <TouchableOpacity style={styles.tile} accessibilityRole="button" accessibilityLabel={`View ${item.species || "catch"} post`} onPress={() => router.push(`./post/${item.id}`, { relativeToDirectory: true })}><Image source={{ uri: item.image_url }} style={styles.image}/></TouchableOpacity>} contentContainerStyle={styles.content}/>; }
const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 5,
  },
  tile: {
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#062238",
    borderWidth: .5,
    borderColor: "#0a5478",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
