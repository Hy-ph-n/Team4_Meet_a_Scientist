// State
let currentRole = "visitor";
let profileList = [...scientists];
let nextProfileId = Math.max(...scientists.map((s) => s.id), 0) + 1;

// Elements
const form = document.querySelector("#search-form");
const queryInput = document.querySelector("#query");
const fieldInput = document.querySelector("#research-field");
const locationInput = document.querySelector("#location");
const sortInput = document.querySelector("#sort-by");
const resultsElement = document.querySelector("#results");
const countElement = document.querySelector("#result-count");
const clearButton = document.querySelector("#clear");
const quickChipsContainer = document.querySelector("#quick-chips");
const toastElement = document.querySelector("#toast");

// Role elements
const rolePills = document.querySelectorAll(".role-pill");
const roleStatusBadge = document.querySelector("#role-status-badge");
const roleStatusDescription = document.querySelector("#role-status-description");
const addProfileBtn = document.querySelector("#add-profile-btn");

// Detail Modal elements (FR-01)
const profileModal = document.querySelector("#profile-modal");
const modalCloseBtn = document.querySelector("#modal-close");
const modalAvatar = document.querySelector("#modal-avatar");
const modalName = document.querySelector("#modal-name");
const modalField = document.querySelector("#modal-field");
const modalStatusBadge = document.querySelector("#modal-status-badge");
const modalAffiliation = document.querySelector("#modal-affiliation");
const modalBio = document.querySelector("#modal-bio");
const modalInterests = document.querySelector("#modal-interests");
const modalLinks = document.querySelector("#modal-links");

// Editor Modal elements (FR-04)
const editorModal = document.querySelector("#editor-modal");
const editorForm = document.querySelector("#editor-form");
const editorTitle = document.querySelector("#editor-title");
const editorCloseBtn = document.querySelector("#editor-close");
const editorCancelBtn = document.querySelector("#editor-cancel-btn");
const editorErrors = document.querySelector("#editor-errors");
const editorProfileId = document.querySelector("#editor-profile-id");
const editorName = document.querySelector("#editor-name");
const editorField = document.querySelector("#editor-field");
const editorInstitution = document.querySelector("#editor-institution");
const editorCity = document.querySelector("#editor-city");
const editorRegion = document.querySelector("#editor-region");
const editorInterests = document.querySelector("#editor-interests");
const editorBio = document.querySelector("#editor-bio");
const editorWebsite = document.querySelector("#editor-website");
const editorPublications = document.querySelector("#editor-publications");
const editorEmail = document.querySelector("#editor-email");
const editorStatus = document.querySelector("#editor-status");
const editorStatusContainer = document.querySelector("#editor-status-container");
const fieldsDatalist = document.querySelector("#fields-datalist");

// Color theme mapping by scientific discipline
const FIELD_THEMES = {
  "computer science": { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
  "environmental science": { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
  "health science": { bg: "#ccfbf1", text: "#115e59", border: "#5eead4" },
  "astrophysics": { bg: "#ede9fe", text: "#5b21b6", border: "#c4b5fd" },
  "chemistry": { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  "marine biology": { bg: "#e0f2fe", text: "#075985", border: "#7dd3fc" },
  "neuroscience": { bg: "#fae8ff", text: "#86198f", border: "#f0abfc" },
  "data science": { bg: "#e0e7ff", text: "#3730a3", border: "#a5b4fc" },
  "robotics": { bg: "#ffe4e6", text: "#9f1239", border: "#fca5a5" },
  default: { bg: "#f1f5f9", text: "#334155", border: "#cbd5e1" },
};

function getFieldTheme(field) {
  if (!field) return FIELD_THEMES.default;
  const key = String(field).trim().toLowerCase();
  return FIELD_THEMES[key] || FIELD_THEMES.default;
}

function getInitials(name) {
  if (!name) return "?";
  const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function showToast(message, isError = false) {
  if (!toastElement) return;
  toastElement.textContent = message;
  toastElement.className = `toast ${isError ? "error" : "success"}`;
  toastElement.style.display = "block";
  setTimeout(() => {
    toastElement.style.display = "none";
  }, 4000);
}

function syncUrlParams() {
  const params = new URLSearchParams();
  if (queryInput.value.trim()) params.set("q", queryInput.value.trim());
  if (fieldInput.value) params.set("field", fieldInput.value);
  if (locationInput && locationInput.value.trim()) {
    params.set("location", locationInput.value.trim());
  }
  if (sortInput && sortInput.value !== "name-asc") {
    params.set("sort", sortInput.value);
  }
  if (currentRole !== "visitor") {
    params.set("role", currentRole);
  }

  const newUrl =
    window.location.pathname +
    (params.toString() ? `?${params.toString()}` : "");
  window.history.replaceState({}, "", newUrl);
}

function loadUrlParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("q")) queryInput.value = params.get("q");
  if (params.has("field")) fieldInput.value = params.get("field");
  if (params.has("location") && locationInput) {
    locationInput.value = params.get("location");
  }
  if (params.has("sort") && sortInput) {
    sortInput.value = params.get("sort");
  }
  if (params.has("role")) {
    setRole(params.get("role"));
  }
}

function setRole(newRole) {
  currentRole = newRole;

  rolePills.forEach((pill) => {
    const isActive = pill.dataset.role === newRole;
    pill.classList.toggle("active", isActive);
    pill.setAttribute("aria-checked", isActive ? "true" : "false");
  });

  if (newRole === "admin") {
    roleStatusBadge.textContent = "Admin Mode";
    roleStatusBadge.className = "badge badge-admin";
    roleStatusDescription.textContent =
      "Full administrative access: Review, publish, unpublish, and edit profiles.";
    addProfileBtn.style.display = "inline-block";
    addProfileBtn.textContent = "+ Add Profile";
  } else if (newRole === "scientist") {
    roleStatusBadge.textContent = "Scientist Mode";
    roleStatusBadge.className = "badge badge-scientist";
    roleStatusDescription.textContent =
      "Scientist (Editor) mode: Create and maintain scientist profile information.";
    addProfileBtn.style.display = "inline-block";
    addProfileBtn.textContent = "+ Create Profile";
  } else {
    roleStatusBadge.textContent = "Visitor View";
    roleStatusBadge.className = "badge badge-visitor";
    roleStatusDescription.textContent =
      "Browsing public directory (published profiles only).";
    addProfileBtn.style.display = "none";
  }

  syncUrlParams();
  runSearch();
}

function populateFieldOptions() {
  const uniqueFields = Array.from(
    new Set(
      profileList
        .map((s) => s.researchField)
        .filter(Boolean)
        .map((f) => f.trim()),
    ),
  ).sort();

  // Populate <select> dropdown
  const currentVal = fieldInput.value;
  fieldInput.replaceChildren();
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All fields";
  fieldInput.append(allOption);

  for (const field of uniqueFields) {
    const opt = document.createElement("option");
    opt.value = field;
    opt.textContent = field;
    fieldInput.append(opt);
  }
  fieldInput.value = currentVal;

  // Populate datalist for editor
  if (fieldsDatalist) {
    fieldsDatalist.replaceChildren();
    for (const field of uniqueFields) {
      const opt = document.createElement("option");
      opt.value = field;
      fieldsDatalist.append(opt);
    }
  }

  // Populate quick-filter chips
  if (quickChipsContainer) {
    quickChipsContainer.replaceChildren();

    const allChip = document.createElement("button");
    allChip.type = "button";
    allChip.className = `quick-chip ${!fieldInput.value ? "active" : ""}`;
    allChip.textContent = "All";
    allChip.addEventListener("click", () => {
      fieldInput.value = "";
      updateQuickChipStates();
      runSearch();
    });
    quickChipsContainer.append(allChip);

    for (const field of uniqueFields) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `quick-chip ${fieldInput.value === field ? "active" : ""}`;
      chip.textContent = field;
      chip.dataset.field = field;
      chip.addEventListener("click", () => {
        fieldInput.value = fieldInput.value === field ? "" : field;
        updateQuickChipStates();
        runSearch();
      });
      quickChipsContainer.append(chip);
    }
  }
}

function updateQuickChipStates() {
  if (!quickChipsContainer) return;
  const currentField = fieldInput.value;
  const chips = quickChipsContainer.querySelectorAll(".quick-chip");
  chips.forEach((chip) => {
    if (!chip.dataset.field) {
      chip.classList.toggle("active", !currentField);
    } else {
      chip.classList.toggle("active", chip.dataset.field === currentField);
    }
  });
}

function openProfileModal(scientist) {
  if (!profileModal || !scientist) return;

  const theme = getFieldTheme(scientist.researchField);
  modalAvatar.textContent = getInitials(scientist.name);
  modalAvatar.style.backgroundColor = theme.bg;
  modalAvatar.style.color = theme.text;
  modalAvatar.style.borderColor = theme.border;

  modalName.textContent = scientist.name;
  modalField.textContent = scientist.researchField || "General Science";
  modalField.style.backgroundColor = theme.bg;
  modalField.style.color = theme.text;

  // Status pill in admin mode
  if (currentRole === "admin") {
    modalStatusBadge.style.display = "inline-block";
    modalStatusBadge.textContent =
      scientist.publicationStatus === "published" ? "Published" : "Draft";
    modalStatusBadge.className = `status-pill ${scientist.publicationStatus === "published" ? "status-published" : "status-draft"}`;
  } else {
    modalStatusBadge.style.display = "none";
  }

  modalAffiliation.textContent = `${scientist.institution || "Independent"} · ${scientist.city || ""}, ${scientist.region || ""}`;
  modalBio.textContent =
    scientist.bio ||
    "This scientist has not provided a detailed biography yet.";

  // Interests
  modalInterests.replaceChildren();
  const rawInterests = scientist.researchInterests;
  const interests = Array.isArray(rawInterests)
    ? rawInterests
    : rawInterests
      ? [rawInterests]
      : [];

  if (interests.length === 0) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "No specific research interests listed.";
    modalInterests.append(p);
  } else {
    for (const interest of interests) {
      const badge = document.createElement("span");
      badge.className = "tag";
      badge.textContent = interest;
      modalInterests.append(badge);
    }
  }

  // Links & Contact
  modalLinks.replaceChildren();
  const links = [];
  if (scientist.website) {
    links.push({
      label: "🌐 Professional Website",
      href: scientist.website,
      external: true,
    });
  }
  if (scientist.publicationsLink) {
    links.push({
      label: "📄 Publications & Citations",
      href: scientist.publicationsLink,
      external: true,
    });
  }
  if (scientist.contactMethod) {
    links.push({
      label: `✉️ ${scientist.contactMethod}`,
      href: `mailto:${scientist.contactMethod}`,
      external: false,
    });
  }

  if (links.length === 0) {
    const noLinks = document.createElement("p");
    noLinks.className = "muted";
    noLinks.textContent = "No public contact information or website published.";
    modalLinks.append(noLinks);
  } else {
    const list = document.createElement("ul");
    list.className = "profile-links-list";
    for (const linkData of links) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = linkData.href;
      a.textContent = linkData.label;
      if (linkData.external) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      li.append(a);
      list.append(li);
    }
    modalLinks.append(list);
  }

  profileModal.showModal();
}

function openEditorModal(scientist = null) {
  if (!editorModal) return;
  editorErrors.style.display = "none";
  editorErrors.replaceChildren();

  if (scientist) {
    editorTitle.textContent = `Edit Profile: ${scientist.name}`;
    editorProfileId.value = scientist.id;
    editorName.value = scientist.name || "";
    editorField.value = scientist.researchField || "";
    editorInstitution.value = scientist.institution || "";
    editorCity.value = scientist.city || "";
    editorRegion.value = scientist.region || "";
    editorInterests.value = Array.isArray(scientist.researchInterests)
      ? scientist.researchInterests.join(", ")
      : scientist.researchInterests || "";
    editorBio.value = scientist.bio || "";
    editorWebsite.value = scientist.website || "";
    editorPublications.value = scientist.publicationsLink || "";
    editorEmail.value = scientist.contactMethod || "";
    editorStatus.value = scientist.publicationStatus || "draft";
  } else {
    editorTitle.textContent = "Add Scientist Profile";
    editorForm.reset();
    editorProfileId.value = "";
    editorStatus.value = currentRole === "admin" ? "published" : "draft";
  }

  // Show status select if Admin
  if (currentRole === "admin") {
    editorStatusContainer.style.display = "block";
  } else {
    editorStatusContainer.style.display = "none";
  }

  editorModal.showModal();
  editorName.focus();
}

function togglePublicationStatus(scientist) {
  const newStatus =
    scientist.publicationStatus === "published" ? "draft" : "published";
  scientist.publicationStatus = newStatus;
  showToast(
    `Profile "${scientist.name}" is now ${newStatus.toUpperCase()}.`,
    false,
  );
  runSearch();
}

function validateAndSaveProfile(event) {
  event.preventDefault();
  const errors = [];

  const nameVal = editorName.value.trim();
  const fieldVal = editorField.value.trim();
  const institutionVal = editorInstitution.value.trim();
  const cityVal = editorCity.value.trim();
  const regionVal = editorRegion.value.trim();
  const interestsVal = editorInterests.value.trim();
  const bioVal = editorBio.value.trim();
  const websiteVal = editorWebsite.value.trim();
  const publicationsVal = editorPublications.value.trim();
  const emailVal = editorEmail.value.trim();

  // Required fields check (FR-04)
  if (!nameVal) errors.push("Full Name is required.");
  if (!fieldVal) errors.push("Research Field is required.");
  if (!institutionVal) errors.push("Institution is required.");
  if (!cityVal) errors.push("City is required.");
  if (!regionVal) errors.push("State / Region is required.");
  if (!interestsVal) errors.push("At least one research interest is required.");

  // URL & Email format validation (FR-07)
  const urlPattern = /^https?:\/\/.+/i;
  if (websiteVal && !urlPattern.test(websiteVal)) {
    errors.push("Website URL must begin with http:// or https://");
  }
  if (publicationsVal && !urlPattern.test(publicationsVal)) {
    errors.push("Publications Link must begin with http:// or https://");
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailVal && !emailPattern.test(emailVal)) {
    errors.push("Contact Email must be a valid email address.");
  }

  if (errors.length > 0) {
    editorErrors.replaceChildren();
    const ul = document.createElement("ul");
    for (const err of errors) {
      const li = document.createElement("li");
      li.textContent = err;
      ul.append(li);
    }
    editorErrors.append(ul);
    editorErrors.style.display = "block";
    return;
  }

  const parsedInterests = interestsVal
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const existingId = editorProfileId.value
    ? Number(editorProfileId.value)
    : null;

  if (existingId) {
    const existing = profileList.find((s) => s.id === existingId);
    if (existing) {
      existing.name = nameVal;
      existing.researchField = fieldVal;
      existing.institution = institutionVal;
      existing.city = cityVal;
      existing.region = regionVal;
      existing.researchInterests = parsedInterests;
      existing.bio = bioVal;
      existing.website = websiteVal || undefined;
      existing.publicationsLink = publicationsVal || undefined;
      existing.contactMethod = emailVal || undefined;
      if (currentRole === "admin") {
        existing.publicationStatus = editorStatus.value;
      }
      showToast(`Updated profile for ${existing.name}.`);
    }
  } else {
    const newProfile = {
      id: nextProfileId++,
      name: nameVal,
      researchField: fieldVal,
      institution: institutionVal,
      city: cityVal,
      region: regionVal,
      researchInterests: parsedInterests,
      bio: bioVal,
      website: websiteVal || undefined,
      publicationsLink: publicationsVal || undefined,
      contactMethod: emailVal || undefined,
      publicationStatus:
        currentRole === "admin" ? editorStatus.value : "draft",
    };
    profileList.unshift(newProfile);
    showToast(
      `Created profile for ${newProfile.name} (${newProfile.publicationStatus}).`,
    );
  }

  editorModal.close();
  populateFieldOptions();
  runSearch();
}

function sortProfiles(profiles, sortKey) {
  const sorted = [...profiles];
  switch (sortKey) {
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "institution-asc":
      return sorted.sort((a, b) =>
        (a.institution || "").localeCompare(b.institution || ""),
      );
    case "field-asc":
      return sorted.sort((a, b) =>
        (a.researchField || "").localeCompare(b.researchField || ""),
      );
    case "name-asc":
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}

function renderProfiles(profiles) {
  resultsElement.replaceChildren();
  const label = profiles.length === 1 ? "profile" : "profiles";
  countElement.textContent = `${profiles.length} ${label} found`;

  if (profiles.length === 0) {
    const message = document.createElement("div");
    message.className = "empty";
    message.innerHTML = `
      <p class="empty-title">No matching profiles found</p>
      <p class="empty-subtitle">Try broadening your search term, clearing your filters, or checking your spelling.</p>
    `;
    resultsElement.append(message);
    return;
  }

  for (const scientist of profiles) {
    const card = document.createElement("article");
    card.className = "profile-card";

    // Card Header with Avatar
    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header";

    const avatarTheme = getFieldTheme(scientist.researchField);
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = getInitials(scientist.name);
    avatar.style.backgroundColor = avatarTheme.bg;
    avatar.style.color = avatarTheme.text;
    avatar.style.borderColor = avatarTheme.border;

    const titleGroup = document.createElement("div");
    titleGroup.className = "title-group";

    const name = document.createElement("h2");
    name.textContent = scientist.name;

    const field = document.createElement("p");
    field.className = "field";
    field.textContent = scientist.researchField;

    const details = document.createElement("p");
    details.className = "details";
    details.textContent = `${scientist.institution} · ${scientist.city}, ${scientist.region}`;

    titleGroup.append(name, field, details);
    cardHeader.append(avatar, titleGroup);

    // If Admin mode, append draft/published status pill
    if (currentRole === "admin") {
      const statusPill = document.createElement("span");
      statusPill.className = `status-pill ${scientist.publicationStatus === "published" ? "status-published" : "status-draft"}`;
      statusPill.textContent =
        scientist.publicationStatus === "published" ? "Published" : "Draft";
      cardHeader.append(statusPill);
    }

    card.append(cardHeader);

    // Research interests
    const rawInterests = scientist.researchInterests;
    const interests = Array.isArray(rawInterests)
      ? rawInterests
      : rawInterests
        ? [rawInterests]
        : [];

    if (interests.length > 0) {
      const tagsContainer = document.createElement("div");
      tagsContainer.className = "tags-container";
      tagsContainer.setAttribute("aria-label", "Research interests");

      for (const interest of interests) {
        const tagButton = document.createElement("button");
        tagButton.type = "button";
        tagButton.className = "tag interactive-tag";
        tagButton.textContent = interest;
        tagButton.title = `Search by "${interest}"`;
        tagButton.setAttribute("aria-label", `Filter by ${interest}`);
        tagButton.addEventListener("click", (e) => {
          e.stopPropagation();
          queryInput.value = interest;
          syncUrlParams();
          runSearch();
          queryInput.focus();
        });
        tagsContainer.append(tagButton);
      }
      card.append(tagsContainer);
    }

    // Actions row
    const cardActions = document.createElement("div");
    cardActions.className = "card-actions";

    const viewButton = document.createElement("button");
    viewButton.type = "button";
    viewButton.className = "view-profile-btn";
    viewButton.textContent = "View Profile";
    viewButton.addEventListener("click", () => openProfileModal(scientist));
    cardActions.append(viewButton);

    // Scientist / Editor role actions
    if (currentRole === "scientist" || currentRole === "admin") {
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "secondary-btn";
      editButton.textContent = "Edit";
      editButton.title = `Edit profile for ${scientist.name}`;
      editButton.addEventListener("click", () => openEditorModal(scientist));
      cardActions.append(editButton);
    }

    // Admin role actions (FR-06 Publish / Unpublish)
    if (currentRole === "admin") {
      const isPublished = scientist.publicationStatus === "published";
      const toggleBtn = document.createElement("button");
      toggleBtn.type = "button";
      toggleBtn.className = isPublished ? "unpublish-btn" : "publish-btn";
      toggleBtn.textContent = isPublished ? "Unpublish" : "Publish";
      toggleBtn.title = isPublished
        ? "Remove from public results"
        : "Make visible to the public";
      toggleBtn.addEventListener("click", () =>
        togglePublicationStatus(scientist),
      );
      cardActions.append(toggleBtn);
    }

    card.append(cardActions);
    resultsElement.append(card);
  }
}

function runSearch() {
  syncUrlParams();

  // When admin role is active, include drafts so admin can inspect and publish them
  const includeDrafts = currentRole === "admin";

  const filtered = searchScientists(profileList, {
    query: queryInput.value,
    researchField: fieldInput.value,
    location: locationInput ? locationInput.value : "",
    includeDrafts,
  });

  const sortKey = sortInput ? sortInput.value : "name-asc";
  const sorted = sortProfiles(filtered, sortKey);

  renderProfiles(sorted);
}

// Event Listeners
form.addEventListener("submit", (event) => {
  event.preventDefault();
  runSearch();
});

clearButton.addEventListener("click", () => {
  form.reset();
  updateQuickChipStates();
  syncUrlParams();
  runSearch();
  queryInput.focus();
});

if (fieldInput) {
  fieldInput.addEventListener("change", () => {
    updateQuickChipStates();
    runSearch();
  });
}

if (sortInput) {
  sortInput.addEventListener("change", runSearch);
}

// Role switcher buttons
rolePills.forEach((pill) => {
  pill.addEventListener("click", () => {
    setRole(pill.dataset.role);
  });
});

if (addProfileBtn) {
  addProfileBtn.addEventListener("click", () => openEditorModal(null));
}

// Detail Modal close listeners
if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", () => profileModal.close());
}
if (profileModal) {
  profileModal.addEventListener("click", (event) => {
    if (event.target === profileModal) profileModal.close();
  });
}

// Editor Modal close listeners
if (editorCloseBtn) {
  editorCloseBtn.addEventListener("click", () => editorModal.close());
}
if (editorCancelBtn) {
  editorCancelBtn.addEventListener("click", () => editorModal.close());
}
if (editorModal) {
  editorModal.addEventListener("click", (event) => {
    if (event.target === editorModal) editorModal.close();
  });
}

if (editorForm) {
  editorForm.addEventListener("submit", validateAndSaveProfile);
}

// Initialization
populateFieldOptions();
loadUrlParams();
updateQuickChipStates();
runSearch();
