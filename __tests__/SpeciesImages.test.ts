import { getSpeciesImage, SPECIES_IMAGES } from "@/constants/specieImages";

it("recognizes capitalization, spaces, and common species aliases", () => {
  expect(getSpeciesImage("  brown   trout ")).toBe(SPECIES_IMAGES["Brown Trout"]);
  expect(getSpeciesImage("King salmon")).toBe(SPECIES_IMAGES["King Salmon"]);
  expect(getSpeciesImage("Chinook Salmon")).toBe(SPECIES_IMAGES["King Salmon"]);
  expect(getSpeciesImage("steelhead")).toBe(SPECIES_IMAGES["Rainbow Trout"]);
  expect(getSpeciesImage("large-mouth bass")).toBe(SPECIES_IMAGES["Largemouth Bass"]);
  expect(getSpeciesImage("Fluke")).toBe(SPECIES_IMAGES["Summer Flounder"]);
});

it("keeps unsupported species on the existing fallback", () => {
  expect(getSpeciesImage("Unknown fish")).toBeUndefined();
  expect(getSpeciesImage("")).toBeUndefined();
  expect(getSpeciesImage("constructor")).toBeUndefined();
  expect(getSpeciesImage("__proto__")).toBeUndefined();
});


it.each([
  ["blackfish", "Blackfish"],
  ["tautog", "Blackfish"],
  ["porgy", "Porgy"],
  ["scup", "Porgy"],
  ["bluegill sunfish", "Bluegill Sunfish"],
  ["bluegill", "Bluegill Sunfish"],
  ["black crappie", "Black Crappie"],
  ["peacock bass", "Peacock Bass"],
  ["butterfly peacock bass", "Peacock Bass"],
  ["tarpon", "Tarpon"],
  ["Atlantic Tarpon", "Tarpon"],
  ["snook", "Snook"],
  ["Common Snook", "Snook"],
])("recognizes %s", (name, canonical) => {
  expect(getSpeciesImage(name)).toBeDefined();
  expect(getSpeciesImage(name)).toBe(SPECIES_IMAGES[canonical]);
});
