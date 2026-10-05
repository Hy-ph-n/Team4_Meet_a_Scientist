// Makes text easier to compare during a search.
function cleanText(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim().toLowerCase();
}

function searchScientists(scientists, options = {}) {
  if (!Array.isArray(scientists)) {
    throw new TypeError("scientists must be an array");
  }

  const query = cleanText(options.query);
  const selectedField = cleanText(options.researchField);
  const selectedLocation = cleanText(options.location);
  const results = [];

  for (const scientist of scientists) {
    // Visitors should only see profiles that have been published.
    if (!scientist || scientist.publicationStatus !== "published") {
      continue;
    }

    let interests = scientist.researchInterests || "";
    if (Array.isArray(interests)) {
      interests = interests.join(" ");
    }

    const searchableText = cleanText(
      scientist.name + " " + interests + " " + scientist.institution,
    );

    if (query && !searchableText.includes(query)) {
      continue;
    }

    if (
      selectedField &&
      cleanText(scientist.researchField) !== selectedField
    ) {
      continue;
    }

    const profileLocation = cleanText(
      scientist.city + " " + scientist.region + " " + scientist.institution,
    );

    if (selectedLocation && !profileLocation.includes(selectedLocation)) {
      continue;
    }

    results.push(scientist);
  }

  return results;
}

module.exports = { searchScientists };
