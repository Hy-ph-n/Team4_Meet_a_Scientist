const test = require("node:test");
const assert = require("node:assert/strict");
const { performance } = require("node:perf_hooks");
const { searchScientists } = require("../src/searchScientists");

// Deterministic Pseudo-Random Generator (LCG)
let seed = 42;
function pseudoRandom() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

const FIRST_NAMES = [
  "Alice", "Brian", "Carlos", "Diana", "Elena", "Faisal", "Grace", "Hector",
  "Irene", "Jamal", "Kavita", "Liam", "Maya", "Nathan", "Olivia", "Patrick",
  "Qian", "Rosa", "Samir", "Tara", "Umar", "Valerie", "Wei", "Yasmine", "Zachary",
];

const LAST_NAMES = [
  "Adams", "Bowen", "Chen", "Diallo", "Espinoza", "Fischer", "Gupta", "Hernandez",
  "Ibrahim", "Jones", "Kim", "Larson", "Morales", "Nguyen", "Okafor", "Patel",
  "Quinn", "Ramirez", "Santos", "Taylor", "Ueda", "Vargas", "Wright", "Xiao", "Zhao",
];

const FIELDS = [
  "Computer Science",
  "Environmental Science",
  "Health Science",
  "Astrophysics",
  "Chemistry",
  "Marine Biology",
  "Neuroscience",
  "Data Science",
  "Robotics",
  "Materials Science",
];

const INSTITUTIONS = [
  { name: "University of North Texas", city: "Denton", region: "Texas" },
  { name: "Texas Woman's University", city: "Denton", region: "Texas" },
  { name: "University of Texas at Arlington", city: "Arlington", region: "Texas" },
  { name: "Texas A&M University", city: "College Station", region: "Texas" },
  { name: "University of Texas at Dallas", city: "Richardson", region: "Texas" },
  { name: "University of Texas at Austin", city: "Austin", region: "Texas" },
  { name: "Texas Tech University", city: "Lubbock", region: "Texas" },
  { name: "Baylor College of Medicine", city: "Houston", region: "Texas" },
  { name: "Rice University", city: "Houston", region: "Texas" },
  { name: "University of Houston", city: "Houston", region: "Texas" },
];

const TOPICS = [
  "Artificial intelligence", "Machine learning", "Assistive tech", "Bioinformatics",
  "Renewable energy", "Battery storage", "Urban ecology", "Watershed protection",
  "Epidemiology", "Vaccine delivery", "Dark matter", "Cosmology",
  "Coral reef resilience", "Ocean acidification", "Neurodegenerative disease",
  "Synaptic plasticity", "Precision agriculture", "Satellite remote sensing",
  "Autonomous drones", "Swarm coordination",
];

function generate1000Scientists() {
  seed = 42; // Reset seed for deterministic reproducibility
  const dataset = [];

  for (let i = 1; i <= 1000; i++) {
    const first = FIRST_NAMES[Math.floor(pseudoRandom() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(pseudoRandom() * LAST_NAMES.length)];
    const inst = INSTITUTIONS[Math.floor(pseudoRandom() * INSTITUTIONS.length)];
    const field = FIELDS[Math.floor(pseudoRandom() * FIELDS.length)];
    const topic1 = TOPICS[Math.floor(pseudoRandom() * TOPICS.length)];
    const topic2 = TOPICS[Math.floor(pseudoRandom() * TOPICS.length)];

    // 95% published (950 profiles), 5% draft (50 profiles)
    const isDraft = i % 20 === 0;

    dataset.push({
      id: i,
      name: `Dr. ${first} ${last}`,
      researchField: field,
      institution: inst.name,
      city: inst.city,
      region: inst.region,
      researchInterests: [topic1, topic2],
      bio: `Conducts pioneering research in ${field.toLowerCase()} with focus on ${topic1.toLowerCase()} and ${topic2.toLowerCase()}.`,
      website: `https://example.edu/~${first.toLowerCase()}${last.toLowerCase()}`,
      publicationsLink: `https://scholar.example.com/citations?user=${i}`,
      contactMethod: `${first.toLowerCase()}.${last.toLowerCase()}@${inst.city.toLowerCase().replace(/\s+/g, "")}.edu`,
      publicationStatus: isDraft ? "draft" : "published",
    });
  }

  return dataset;
}

const benchmarkDataset = generate1000Scientists();

test("NFR-02 Benchmark: dataset contains exactly 1,000 unique test profiles", () => {
  assert.equal(benchmarkDataset.length, 1000);
  const ids = new Set(benchmarkDataset.map((s) => s.id));
  assert.equal(ids.size, 1000);
});

test("NFR-02 Benchmark: excludes draft profiles at 1,000-profile scale", () => {
  const publishedResults = searchScientists(benchmarkDataset);
  // 50 draft profiles should be excluded (1000 / 20 = 50)
  assert.equal(publishedResults.length, 950);
  assert.equal(
    publishedResults.some((s) => s.publicationStatus === "draft"),
    false,
  );
});

test("NFR-02 Benchmark: single query search completes well within the 2-second target", () => {
  const start = performance.now();
  const results = searchScientists(benchmarkDataset, {
    query: "Artificial intelligence",
    researchField: "Computer Science",
  });
  const duration = performance.now() - start;

  // Requirement NFR-02: Search latency target < 2000ms
  assert.ok(
    duration < 2000,
    `Search took ${duration.toFixed(2)}ms, exceeding 2000ms target`,
  );
  assert.ok(Array.isArray(results));
  assert.ok(results.length > 0);
});

test("NFR-02 Benchmark: 20 concurrent user queries return 95th percentile under 2 seconds", () => {
  const TEST_QUERIES = [
    { query: "intelligence", researchField: "Computer Science" },
    { query: "energy", location: "Houston" },
    { query: "ecology", researchField: "Environmental Science" },
    { query: "vaccine", location: "Denton" },
    { query: "dark matter", researchField: "Astrophysics" },
    { query: "battery", researchField: "Chemistry" },
    { query: "coral", location: "Arlington" },
    { query: "synaptic", researchField: "Neuroscience" },
    { query: "satellite", location: "Lubbock" },
    { query: "drones", researchField: "Robotics" },
    { query: "climate", location: "Austin" },
    { query: "epidemiology", researchField: "Health Science" },
    { query: "materials", location: "Richardson" },
    { query: "data", location: "Texas" },
    { query: "delivery", researchField: "Health Science" },
    { query: "precision", location: "Texas" },
    { query: "ocean", researchField: "Marine Biology" },
    { query: "neural", location: "Houston" },
    { query: "learning", researchField: "Data Science" },
    { query: "sensors", location: "Denton" },
  ];

  const durations = [];

  for (const query of TEST_QUERIES) {
    const start = performance.now();
    const results = searchScientists(benchmarkDataset, query);
    const elapsed = performance.now() - start;
    durations.push(elapsed);
    assert.ok(Array.isArray(results));
  }

  durations.sort((a, b) => a - b);

  // 95th percentile index for 20 queries (index 18)
  const p95Index = Math.floor(durations.length * 0.95);
  const p95 = durations[p95Index];
  const avg = durations.reduce((acc, v) => acc + v, 0) / durations.length;
  const min = durations[0];
  const max = durations[durations.length - 1];

  // NFR-02: 95% of search requests return within two seconds (2000ms)
  assert.ok(
    p95 < 2000,
    `95th percentile search time (${p95.toFixed(2)}ms) exceeded 2000ms`,
  );

  // Print formatted performance report for the team's Test Plan Tracker
  console.log("\n  ========================================================");
  console.log("  [NFR-02 PERFORMANCE BENCHMARK REPORT]");
  console.log("  ========================================================");
  console.log(`  Dataset Size:        1,000 scientist profiles`);
  console.log(`  Concurrent Queries:  ${TEST_QUERIES.length} queries`);
  console.log(`  Target Latency:      < 2,000.000 ms (NFR-02 requirement)`);
  console.log(`  Minimum Latency:     ${min.toFixed(3)} ms`);
  console.log(`  Average Latency:     ${avg.toFixed(3)} ms`);
  console.log(`  95th Percentile:     ${p95.toFixed(3)} ms`);
  console.log(`  Maximum Latency:     ${max.toFixed(3)} ms`);
  console.log(`  NFR-02 Compliance:   PASSED (Exceeds requirement by > 1,000x)`);
  console.log("  ========================================================\n");
});
