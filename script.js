const STORAGE_KEYS = {
  feedback: "feedbackEntries",
  theme: "feedbackTheme"
};

const API_BASE = "http://localhost:3002";

let selectedRating = 0;

document.addEventListener("DOMContentLoaded", () => {
  initializeStorage();
  setupNavigation();
  setupThemeToggle();
  initializePage();
});

function initializeStorage() {
  const current = getLocalData(STORAGE_KEYS.feedback);
  if (!Array.isArray(current)) {
    setLocalData(STORAGE_KEYS.feedback, []);
  }
}

function setupNavigation() {
  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");

  if (!menuBtn || !navLinks) {
    return;
  }

  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
}

function setupThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = getLocalData(STORAGE_KEYS.theme);

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }

  if (!themeToggle) {
    return;
  }

  themeToggle.textContent = document.body.classList.contains("dark") ? "Light Mode" : "Dark Mode";

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    setLocalData(STORAGE_KEYS.theme, isDark ? "dark" : "light");
    themeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
  });
}

function initializePage() {
  const page = document.body.dataset.page;

  if (page === "home") {
    setupFeedbackFormPage();
  }

  if (page === "feedback-list") {
    setupFeedbackListPage();
  }
}

function setupFeedbackFormPage() {
  const form = document.getElementById("feedbackForm");
  const stars = document.querySelectorAll(".star");

  if (!form || stars.length === 0) {
    return;
  }

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      selectedRating = Number(star.dataset.rating);
      renderSelectedStars(selectedRating);
      document.getElementById("ratingError").textContent = "";
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const comments = document.getElementById("comments").value.trim();

    const valid = validateForm({ name, email, rating: selectedRating });
    if (!valid) {
      return;
    }

    const entry = {
      id: Date.now(),
      name,
      email,
      rating: selectedRating,
      comments,
      createdAt: new Date().toISOString()
    };

    saveFeedbackLocally(entry);
    await postFeedbackToBackend(entry);

    window.location.href = "thankyou.html";
  });
}

function renderSelectedStars(rating) {
  const stars = document.querySelectorAll(".star");

  stars.forEach((star) => {
    const starValue = Number(star.dataset.rating);
    star.classList.toggle("active", starValue <= rating);
  });
}

function clearErrors() {
  const emailError = document.getElementById("emailError");
  const ratingError = document.getElementById("ratingError");

  if (emailError) {
    emailError.textContent = "";
  }

  if (ratingError) {
    ratingError.textContent = "";
  }
}

function validateForm({ name, email, rating }) {
  let isValid = true;

  if (name.length < 2) {
    isValid = false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    const emailError = document.getElementById("emailError");
    if (emailError) {
      emailError.textContent = "Please enter a valid email address.";
    }
    isValid = false;
  }

  if (!rating || rating < 1 || rating > 5) {
    const ratingError = document.getElementById("ratingError");
    if (ratingError) {
      ratingError.textContent = "Please select a rating from 1 to 5 stars.";
    }
    isValid = false;
  }

  return isValid;
}

async function setupFeedbackListPage() {
  const feedbackContainer = document.getElementById("feedbackContainer");
  const filterRating = document.getElementById("filterRating");
  const sortOrder = document.getElementById("sortOrder");
  const exportJsonBtn = document.getElementById("exportJsonBtn");
  const exportCsvBtn = document.getElementById("exportCsvBtn");

  if (!feedbackContainer || !filterRating || !sortOrder || !exportJsonBtn || !exportCsvBtn) {
    return;
  }

  await syncFeedbackFromBackend();

  const render = () => {
    const allFeedback = getFeedbackEntries();
    const selectedFilter = filterRating.value;
    const selectedSort = sortOrder.value;

    let visibleFeedback = [...allFeedback];

    if (selectedFilter !== "all") {
      const ratingValue = Number(selectedFilter);
      visibleFeedback = visibleFeedback.filter((entry) => Number(entry.rating) === ratingValue);
    }

    visibleFeedback.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return selectedSort === "latest" ? dateB - dateA : dateA - dateB;
    });

    renderFeedbackItems(visibleFeedback);
    updateAverageRating(allFeedback);
  };

  render();

  filterRating.addEventListener("change", render);
  sortOrder.addEventListener("change", render);

  exportJsonBtn.addEventListener("click", () => {
    exportAsJson(getFeedbackEntries());
  });

  exportCsvBtn.addEventListener("click", () => {
    exportAsCsv(getFeedbackEntries());
  });
}

function renderFeedbackItems(entries) {
  const feedbackContainer = document.getElementById("feedbackContainer");
  const emptyState = document.getElementById("emptyState");

  feedbackContainer.innerHTML = "";

  if (entries.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  entries.forEach((entry) => {
    const item = document.createElement("article");
    item.className = "card feedback-item";

    item.innerHTML = `
      <div class="item-top">
        <div>
          <h3>${entry.name}</h3>
          <p class="muted">${entry.email}</p>
        </div>
        <p class="stars">${renderStarsText(entry.rating)}</p>
      </div>
      <p>${entry.comments || "No comment provided."}</p>
      <div class="item-top">
        <p class="muted">${formatDate(entry.createdAt)}</p>
        <button class="delete-btn" data-id="${entry.id}">Delete</button>
      </div>
    `;

    feedbackContainer.appendChild(item);
  });

  feedbackContainer.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = Number(button.dataset.id);
      deleteFeedbackLocally(id);
      await deleteFeedbackFromBackend(id);
      const updated = getFeedbackEntries();
      renderFeedbackItems(updated);
      updateAverageRating(updated);
    });
  });
}

function renderStarsText(rating) {
  const full = "★".repeat(Number(rating));
  const empty = "☆".repeat(5 - Number(rating));
  return `${full}${empty}`;
}

function updateAverageRating(entries) {
  const avgBox = document.getElementById("averageRating");
  if (!avgBox) {
    return;
  }

  if (!entries.length) {
    avgBox.textContent = "Average rating: 0.0 / 5";
    return;
  }

  const total = entries.reduce((sum, entry) => sum + Number(entry.rating), 0);
  const average = total / entries.length;
  avgBox.textContent = `Average rating: ${average.toFixed(1)} / 5`;
}

function getFeedbackEntries() {
  return getLocalData(STORAGE_KEYS.feedback) || [];
}

function saveFeedbackLocally(entry) {
  const current = getFeedbackEntries();
  current.push(entry);
  setLocalData(STORAGE_KEYS.feedback, current);
}

function deleteFeedbackLocally(id) {
  const current = getFeedbackEntries();
  const updated = current.filter((item) => Number(item.id) !== Number(id));
  setLocalData(STORAGE_KEYS.feedback, updated);
}

async function syncFeedbackFromBackend() {
  const serverData = await requestApi("/feedback", "GET");
  if (Array.isArray(serverData)) {
    setLocalData(STORAGE_KEYS.feedback, serverData);
  }
}

async function postFeedbackToBackend(entry) {
  await requestApi("/feedback", "POST", entry);
}

async function deleteFeedbackFromBackend(id) {
  await requestApi(`/feedback/${id}`, "DELETE");
}

async function requestApi(path, method, body = null) {
  try {
    const options = {
      method,
      headers: {}
    };

    if (body) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${path}`, options);
    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    // Backend is optional. Frontend still works with localStorage only.
    return null;
  }
}

function exportAsJson(entries) {
  const content = JSON.stringify(entries, null, 2);
  downloadFile(content, "feedback-export.json", "application/json");
}

function exportAsCsv(entries) {
  const headers = ["id", "name", "email", "rating", "comments", "createdAt"];
  const rows = entries.map((entry) => {
    return headers
      .map((header) => {
        const value = String(entry[header] ?? "").replaceAll('"', '""');
        return `"${value}"`;
      })
      .join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  downloadFile(csvContent, "feedback-export.csv", "text/csv");
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

function formatDate(value) {
  return new Date(value).toLocaleString();
}

function getLocalData(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function setLocalData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
