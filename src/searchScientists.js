// Search the published scientist profiles and apply any selected filters.
function searchScientists(scientists, options = {}) {
  if (!Array.isArray(scientists)) {
    throw new TypeError("scientists must be an array");
  }

  const normalize = (value) => String(value ?? "").trim().toLowerCase();
  const query = normalize(options.query);
  const researchField = normalize(options.researchField);
  const location = normalize(options.location);

  return scientists.filter((scientist) => {
    if (scientist?.publicationStatus !== "published") {
      return false;
    }

    const interests = Array.isArray(scientist.researchInterests)
      ? scientist.researchInterests.join(" ")
      : scientist.researchInterests;

    const searchableText = normalize(
      [scientist.name, interests, scientist.institution].join(" "),
    );

    const profileLocation = normalize(
      [scientist.city, scientist.region, scientist.institution].join(" "),
    );

    const matchesQuery = query === "" || searchableText.includes(query);
    const matchesField =
      researchField === "" || normalize(scientist.researchField) === researchField;
    const matchesLocation =
      location === "" || profileLocation.includes(location);

    return matchesQuery && matchesField && matchesLocation;
  });
}

module.exports = { searchScientists };
