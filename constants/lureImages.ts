import type { ImageSourcePropType } from "react-native";

export const LURE_IMAGES: Record<string, ImageSourcePropType> = {
  Swimbait: require("../assets/lures/swimbait.jpeg"),
  Bucktail: require("../assets/lures/bucktail.jpeg"),
  Sp_minnow: require("../assets/lures/sp_minnow.jpeg"),
  "Rooster Tail": require("../assets/lures/roostertail.png"),
  Crankbait: require("../assets/lures/crankbait.png"),
  "Deep-diving Crankbait": require("../assets/lures/deep_diving_crankbait.png"),
  Jerkbait: require("../assets/lures/jerkbait.png"),
  Spinnerbait: require("../assets/lures/spinnerbait.png"),
  Chatterbait: require("../assets/lures/chatterbait.png"),
  "Football Jig": require("../assets/lures/football_jig.png"),
  "Ned Rigged Plastic": require("../assets/lures/ned_rigged_plastic.png"),
  "Ned Rigged Craw": require("../assets/lures/ned_rigged_craw.png"),
  "Diamond Jig": require("../assets/lures/diamond_jig.png"),
};

// Match free-text names regardless of capitalization, spaces, or separators.
const normalizeLure = (name: string) =>
  name.trim().toLowerCase().replace(/[\s_-]+/g, "");

const imagesByName = new Map(
  Object.entries(LURE_IMAGES).map(([name, image]) => [normalizeLure(name), image]),
);

const aliases = new Map([
  ["deepcrankbait", "Deep-diving Crankbait"],
  ["deepdiver", "Deep-diving Crankbait"],
  ["bladedjig", "Chatterbait"],
  ["nedrig", "Ned Rigged Plastic"],
  ["nedrigplastic", "Ned Rigged Plastic"],
  ["nedriggedsoftplastic", "Ned Rigged Plastic"],
  ["nedrigcraw", "Ned Rigged Craw"],
  ["nedriggedcrawfish", "Ned Rigged Craw"],
]);

export function getLureImage(lure: string): ImageSourcePropType | undefined {
  const name = normalizeLure(lure);
  const singular = name.endsWith("s") ? name.slice(0, -1) : name;
  return imagesByName.get(name)
    ?? imagesByName.get(singular)
    ?? imagesByName.get(normalizeLure(aliases.get(singular) ?? ""));
}
