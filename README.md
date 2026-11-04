# Meet a Scientist

Meet a Scientist is a Team 4 capstone project for helping visitors discover scientists by name, research interest, field, institution, or location.

## Sprint 2 prototype

The current prototype includes:

- a reusable scientist search and filter function;
- published-profile filtering so draft profiles are not shown publicly;
- sample scientist profile data;
- a small browser demo for trying the search feature; and
- automated tests for normal, combined, empty-result, and invalid-input cases.

## Run the browser demo

Open `demo/index.html` in a web browser. Enter a search term, select a research field, or specify a location, then choose **Search**. Click on any research interest tag to quickly filter by that topic, or choose **View Profile** to open the profile details dialog with biography, research interests, and published contact links. Choose **Clear** to restore all published profiles.

## Run the automated tests

The tests use Node's built-in test runner and require Node.js 18 or newer.

```text
node --test
```

## Repository structure

```text
demo/                  Browser demonstration
src/scientists.js      Sample profile data
src/searchScientists.js Search and filter logic
tests/                 Automated tests
CHANGELOG.md            Sprint change record
```

## Team

- David Bowen
- Olaniyi Oladipo
- Rual Ting
- Dylan Liles
