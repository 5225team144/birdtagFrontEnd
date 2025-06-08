// managePageScript.js

const manageElements = {
  tagFileUrls: document.getElementById("tag-file-urls"),
  tagOperation: document.getElementById("tag-operation"),
  tagValues: document.getElementById("tag-values"),
  submitTagsBtn: document.getElementById("submit-tags-btn"),
  tagUpdateStatus: document.getElementById("tag-update-status"),

  deleteFileUrls: document.getElementById("delete-file-urls"),
  deleteFilesBtn: document.getElementById("delete-files-btn"),
  deleteStatus: document.getElementById("delete-status"),
};

const API_CONFIG = {
  baseUrl: "https://d32mqshkvl.execute-api.ap-southeast-2.amazonaws.com/queries01",
  headers: {
    "Content-Type": "application/json",
    // You can add Authorization header here if needed
  },
};

function showLoading(el) {
  el.innerHTML = "<p>Loading...</p>";
}

function showError(el, msg) {
  el.innerHTML = `<p style='color:red;'>${msg}</p>`;
}

function displaySearchResults(result, container) {
  if (!result.links || result.links.length === 0) {
    container.innerHTML = "<p>No matching files found.</p>";
    return;
  }
  container.innerHTML = result.links
    .map((url) => `<div><a href="${url}" target="_blank">${url}</a></div>`) // Thumbnail preview optional
    .join("");
}

function addField(containerId, inputClass) {
  const container = document.getElementById(containerId);
  const div = document.createElement("div");
  div.className = "input-group";
  div.innerHTML = `
    <input type="text" class="${inputClass}" />
    <button class="remove-field">Remove</button>
  `;
  container.appendChild(div);
}

document.getElementById("add-tag-url").addEventListener("click", () => {
  addField("tag-file-url-list", "tag-url-input");
});

document.getElementById("add-tag-value").addEventListener("click", () => {
  addField("tag-values-list", "tag-value-input");
});

document.getElementById("add-delete-url").addEventListener("click", () => {
  addField("delete-file-url-list", "delete-url-input");
});

// Handle remove buttons
document.body.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-field")) {
    const group = e.target.closest(".input-group");
    const list = group.parentElement;
    if (list.children.length > 1) {
      group.remove();
    }
  }
});

// Handle remove buttons
document.body.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-field")) {
    const group = e.target.closest(".input-group");
    const list = group.parentElement;
    if (list.children.length > 1) {
      group.remove();
    }
  }
});

// 1. Bulk tag update
manageElements.submitTagsBtn.addEventListener("click", async () => {
  try {
    const urls = [...document.querySelectorAll(".tag-url-input")]
  .map(input => input.value.trim())
  .filter(Boolean);

    const tags = [...document.querySelectorAll(".tag-value-input")]
  .map(input => input.value.trim())
  .filter(Boolean);

    const operation = parseInt(manageElements.tagOperation.value);

    if (urls.length === 0 || tags.length === 0) throw new Error("Please provide both URLs and tags.");

    const requestBody = {
      url: urls,
      operation: operation,
      tags: tags,
    };

    manageElements.tagUpdateStatus.innerText = "Updating tags...";

    const response = await fetch(`${API_CONFIG.baseUrl}/edit-tags`, {
      method: "POST",
      headers: API_CONFIG.headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) throw new Error("Failed to update tags");
    manageElements.tagUpdateStatus.innerText = "✅ Tags updated successfully!";
  } catch (err) {
    console.error(err);
    manageElements.tagUpdateStatus.innerText = `❌ ${err.message}`;
  }
});

// 2. Delete files
manageElements.deleteFilesBtn.addEventListener("click", async () => {
  try {
    const deleteUrls = [...document.querySelectorAll(".delete-url-input")]
  .map(input => input.value.trim())
  .filter(Boolean);

if (deleteUrls.length === 0) throw new Error("Please enter file URLs to delete.");

    manageElements.deleteStatus.innerText = "Deleting files...";

    const response = await fetch(`${API_CONFIG.baseUrl}/delete-files`, {
      method: "POST",
      headers: API_CONFIG.headers,
      body: JSON.stringify({ url: deleteUrls  }),
    });

    if (!response.ok) throw new Error("Failed to delete files");
    manageElements.deleteStatus.innerText = "✅ Files deleted successfully!";
  } catch (err) {
    console.error(err);
    manageElements.deleteStatus.innerText = `❌ ${err.message}`;
  }
});
