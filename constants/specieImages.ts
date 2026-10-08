import type { ImageSourcePropType } from "react-native";

export const SPECIES_IMAGES: Record<string, ImageSourcePropType> = {
  "Striped Bass": require("../assets/species/striped_bass.png"),
  Bluefish: require("../assets/species/bluefish.jpeg"),
  "Summer Flounder": require("../assets/species/summer_flounder.jpeg"),
  "Brown Trout": require("../assets/species/brown_trout.png"),
  "King Salmon": require("../assets/species/king_salmon.png"),
  "Rainbow Trout": require("../assets/species/rainbow_trout.png"),
  "Brook Trout": require("../assets/species/brook_trout.png"),
  "Largemouth Bass": require("../assets/species/largemouth_bass.png"),
  "Smallmouth Bass": require("../assets/species/smallmouth_bass.png"),
  "Northern Pike": require("../assets/species/northern_pike.png"),
  Blackfish: require("../assets/species/blackfish.png"),
  Porgy: require("../assets/species/porgy.png"),
  "Bluegill Sunfish": require("../assets/species/bluegill.png"),
  "Black Crappie": require("../assets/species/black_crappie.png"),
  "Peacock Bass": require("../assets/species/peacock_bass.png"),
  Tarpon: require("../assets/species/tarpon.png"),
  Snook: require("../assets/species/snook.png"),
};

const normalizeSpecies = (name: string) =>
  name.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");

const aliases = new Map(Object.entries({
  striper: "Striped Bass",
  "chinook salmon": "King Salmon",
  chinook: "King Salmon",
  steelhead: "Rainbow Trout",
  "steelhead trout": "Rainbow Trout",
  brookie: "Brook Trout",
  "large mouth bass": "Largemouth Bass",
  "small mouth bass": "Smallmouth Bass",
  pike: "Northern Pike",
  fluke: "Summer Flounder",
  tautog: "Blackfish",
  "black fish": "Blackfish",
  scup: "Porgy",
  bluegill: "Bluegill Sunfish",
  "blue gill": "Bluegill Sunfish",
  "blue gill sunfish": "Bluegill Sunfish",
  "butterfly peacock bass": "Peacock Bass",
  "atlantic tarpon": "Tarpon",
  "common snook": "Snook",
}));

const imagesByName = new Map(
  Object.entries(SPECIES_IMAGES).map(([name, image]) => [normalizeSpecies(name), image]),
);

export function getSpeciesImage(species: string): ImageSourcePropType | undefined {
  const name = normalizeSpecies(species);
  return imagesByName.get(name) ?? imagesByName.get(normalizeSpecies(aliases.get(name) ?? ""));
}
