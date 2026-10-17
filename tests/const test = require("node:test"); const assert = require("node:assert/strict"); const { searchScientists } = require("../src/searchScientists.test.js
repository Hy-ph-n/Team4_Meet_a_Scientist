const test = require("node:test");
const assert = require("node:assert/strict");
const { searchScientists } = require("../src/searchScientists");

const scientists = [
  {
    id: 1,
    name: "Ada Lovelace",
    researchInterests: ["Algorithms", "Computing"],
    institution: "University of North Texas",
    researchField: "Computer Science",
    city: "Denton",
    region: "Texas",
    publicationStatus: "published",
  },
  {
    id: 2,
    name: "George Washington Carver",
    researchInterests: "Agriculture and botany",
    institution: "Tuskegee University",
    researchField: "Biology",
    city: "Tuskegee",
    region: "Alabama",
    publicationStatus: "published",
  },
  {
    id: 3,
    name: "Draft Scientist",
    researchInterests: ["Computing"],
    institution: "University of North Texas",
    researchField: "Computer Science",
    city: "Denton",
    region: "Texas",
    publicationStatus: "draft",
  },
];

test("rejects a non-array scientist collection", () => {
  assert.throws(() => searchScientists(null), {
    name: "TypeError",
    message: "scientists must be an array",
  });
});

test("returns only published profiles when no filters are supplied", () => {
  assert.deepEqual(
    searchScientists(scientists).map((scientist) => scientist.id),
    [1, 2],
  );
});

test("searches names without case sensitivity and ignores surrounding spaces", () => {
  const result = searchScientists(scientists, { query: "  ADA  " });
  assert.deepEqual(result.map((scientist) => scientist.id), [1]);
});

test("searches research interests stored as an array or a string", () => {
  assert.deepEqual(
    searchScientists(scientists, { query: "algorithms" }).map((item) => item.id),
    [1],
  );
  assert.deepEqual(
    searchScientists(scientists, { query: "botany" }).map((item) => item.id),
    [2],
  );
});

test("searches by institution and returns an empty list for no match", () => {
  assert.deepEqual(
    searchScientists(scientists, { query: "tuskegee university" }).map(
      (item) => item.id,
    ),
    [2],
  );
  assert.deepEqual(searchScientists(scientists, { query: "chemistry" }), []);
});

test("matches research fields exactly but without case sensitivity", () => {
  assert.deepEqual(
    searchScientists(scientists, { researchField: " biology " }).map(
      (item) => item.id,
    ),
    [2],
  );
  assert.deepEqual(searchScientists(scientists, { researchField: "bio" }), []);
});

test("filters location using city, region, or institution", () => {
  assert.deepEqual(
    searchScientists(scientists, { location: "denton" }).map((item) => item.id),
    [1],
  );
  assert.deepEqual(
    searchScientists(scientists, { location: "ALABAMA" }).map((item) => item.id),
    [2],
  );
  assert.deepEqual(
    searchScientists(scientists, { location: "north texas" }).map(
      (item) => item.id,
    ),
    [1],
  );
});

test("applies query, research field, and location together", () => {
  const matching = searchScientists(scientists, {
    query: "computing",
    researchField: "computer science",
    location: "texas",
  });
  assert.deepEqual(matching.map((scientist) => scientist.id), [1]);

  const wrongLocation = searchScientists(scientists, {
    query: "computing",
    researchField: "computer science",
    location: "alabama",
  });
  assert.deepEqual(wrongLocation, []);
});

test("handles missing optional profile values", () => {
  const incompleteProfile = {
    id: 4,
    name: "Marie Curie",
    researchField: "Physics",
    publicationStatus: "published",
  };

  assert.deepEqual(searchScientists([incompleteProfile]), [incompleteProfile]);
  assert.deepEqual(
    searchScientists([incompleteProfile], { query: "missing" }),
    [],
  );
});
