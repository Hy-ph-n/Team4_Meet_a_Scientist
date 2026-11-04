const test = require("node:test");
const assert = require("node:assert/strict");
const { scientists } = require("../src/scientists");
const { searchScientists } = require("../src/searchScientists");

test("sample profiles have unique identifiers", () => {
  const ids = scientists.map((scientist) => scientist.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("sample published profiles contain the fields used by search results", () => {
  const published = scientists.filter(
    (scientist) => scientist.publicationStatus === "published",
  );

  assert.ok(published.length > 0);
  for (const scientist of published) {
    assert.ok(scientist.name);
    assert.ok(scientist.researchField);
    assert.ok(scientist.institution);
    assert.ok(scientist.city);
    assert.ok(scientist.region);
  }
});

test("the public search excludes the sample draft profile", () => {
  const results = searchScientists(scientists);
  assert.equal(results.some((scientist) => scientist.name === "Draft Profile"), false);
});

test("sample published profiles include valid optional biography and contact links", () => {
  const published = scientists.filter(
    (scientist) => scientist.publicationStatus === "published",
  );

  for (const scientist of published) {
    if (scientist.bio !== undefined) {
      assert.equal(typeof scientist.bio, "string");
      assert.ok(scientist.bio.trim().length > 0);
    }
    if (scientist.website !== undefined) {
      assert.match(scientist.website, /^https?:\/\//);
    }
    if (scientist.publicationsLink !== undefined) {
      assert.match(scientist.publicationsLink, /^https?:\/\//);
    }
    if (scientist.contactMethod !== undefined) {
      assert.match(scientist.contactMethod, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    }
  }
});

