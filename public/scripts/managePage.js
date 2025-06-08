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

// 2. Bulk tag update
manageElements.submitTagsBtn.addEventListener("click", async () => {
  try {
    const urls = manageElements.tagFileUrls.value.trim().split("\n").filter(Boolean);
    const tags = manageElements.tagValues.value.trim().split("\n").filter(Boolean);
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

// 3. Delete files
manageElements.deleteFilesBtn.addEventListener("click", async () => {
  try {
    const urls = manageElements.deleteFileUrls.value.trim().split("\n").filter(Boolean);
    if (urls.length === 0) throw new Error("Please enter file URLs to delete.");

    manageElements.deleteStatus.innerText = "Deleting files...";

    const response = await fetch(`${API_CONFIG.baseUrl}/delete-files`, {
      method: "POST",
      headers: API_CONFIG.headers,
      body: JSON.stringify({ url: urls }),
    });

    if (!response.ok) throw new Error("Failed to delete files");
    manageElements.deleteStatus.innerText = "✅ Files deleted successfully!";
  } catch (err) {
    console.error(err);
    manageElements.deleteStatus.innerText = `❌ ${err.message}`;
  }
});
