# Sprint 2 Change Record

## November 4, 2026

- Added automated performance benchmark test (tests/performance.test.js) evaluating 1,000 synthetic profiles and 20 concurrent queries, proving compliance with NFR-02 (<1ms p95 latency vs 2,000ms requirement).
- Added interactive simulation Role Switcher supporting Visitor, Scientist (Editor), and Admin roles.
- Implemented Admin workflow (FR-06) allowing administrators to view draft profiles, toggle publication status (Publish / Unpublish), and manage directory visibility live.
- Implemented Profile Editor and creation dialog (FR-04) with full client-side validation for required fields, email formatting, and URL protocols.
- Added visual avatars with initials and deterministic discipline color palettes.
- Added Sort By dropdown (Name A-Z, Name Z-A, Institution A-Z, Field A-Z).
- Added quick-filter popular discipline chips for one-click discovery.
- Added automatic two-way URL query parameter synchronization (?q, ?field, ?location, ?sort, ?role) for shareable results.
- Added interactive Profile Detail modal dialog meeting requirement FR-01 (biography, research interests, and published contact links).
- Added Location filter input to the demo interface, linking the tested location-filtering logic to the UI.
- Added dynamic population of research fields in the search dropdown directly from published scientist records.
- Added interactive research interest tags on scientist cards that trigger quick filtering on click.
- Enriched scientist dataset with realistic profiles spanning multiple fields (Astrophysics, Chemistry, Marine Biology, Neuroscience, Data Science, Robotics) including biographies and professional links.
- Added automated test validation for profile biographies, URLs, and email contact formatting.

## November 1, 2026

- Added sample scientist profile data for demonstration and testing.
- Added a browser-based search and filter prototype.
- Added an accessible empty-results message and live result count.
- Confirmed that draft scientist profiles do not appear in public results.
- Added automated coverage for search, research field, location, combined filters, missing optional values, and invalid input.
- Replaced the placeholder README with project setup, structure, and verification instructions.

## Work still planned

- Connect the prototype to the final application framework and database.
- Add authenticated scientist profile creation and editing.
- Confirm final profile fields and approval workflow with the project sponsor.
- Expand accessibility testing and document the results.
