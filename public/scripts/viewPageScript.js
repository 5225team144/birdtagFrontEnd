// viewPageScript.js

const API_CONFIG = {
  baseUrl: "https://d32mqshkvl.execute-api.ap-southeast-2.amazonaws.com/queries01",
  headers: { "Content-Type": "application/json" },
};

const elements = {
  results: document.getElementById("view-results"),
  filterButtons: document.querySelectorAll(".filter-btn"),
};

function showLoading() {
  elements.results.innerHTML = "<p>Loading files...</p>";
}

function showError(msg) {
  elements.results.innerHTML = `<p style='color:red;'>${msg}</p>`;
}

function renderFiles(files, filter) {
  if (!files || files.length === 0) {
    elements.results.innerHTML = "<p>No files found.</p>";
    return;
  }

  let filtered = files;
  if (filter !== "all") {
    filtered = files.filter((f) => f.media_type && f.media_type.includes(filter));
  }

  if (filtered.length === 0) {
    elements.results.innerHTML = `<p>No ${filter} files found.</p>`;
    return;
  }

  elements.results.innerHTML = filtered
    .map((file) => {
      // Common fallback thumbnail 
      const fallbackThumbnail = "../images/placeholder.png";
      
      if (file.media_type.includes("image")) {
        return `<div class="file-item">
          <img src="${file.thumbnail_url || file.image_url}" alt="${file.file_id}" class="preview-img" />
          <a href="${file.image_url}" target="_blank">View Full Image</a>
        </div>`;
      } else if (file.media_type.includes("video")) {
        return `<div class="file-item">
          ${file.thumbnail_url 
            ? `<img src="${file.thumbnail_url}" alt="Video thumbnail" class="preview-img" />` 
            : `<img src="${fallbackThumbnail}" alt="No thumbnail available" class="preview-img" />`}
          <video controls class="preview-media">
            <source src="${file.image_url}" type="${file.media_type}">
            Your browser does not support the video tag.
          </video>
          <a href="${file.image_url}" target="_blank">View Full Video</a>
        </div>`;
      } else if (file.media_type.includes("audio")) {
        return `<div class="file-item">
          <img src="${fallbackThumbnail}" alt="Audio file" class="preview-img" />
          <audio controls class="preview-media">
            <source src="${file.image_url}" type="${file.media_type}">
            Your browser does not support the audio tag.
          </audio>
          <a href="${file.image_url}" target="_blank">Download Audio</a>
        </div>`;
      } else {
        return `<div class="file-item">
          <img src="${fallbackThumbnail}" alt="Unknown file type" class="preview-img" />
          <a href="${file.image_url}" target="_blank">${file.file_id}</a>
        </div>`;
      }
    })
    .join("");
}

async function fetchAllFiles() {
  try {
    showLoading();
    const res = await fetch(`${API_CONFIG.baseUrl}/view-all-files`, {
      method: "GET",
      headers: API_CONFIG.headers,
    });

    if (!res.ok) throw new Error("Failed to fetch files");

    const result = await res.json();
    window._allFiles = result.files || [];
    renderFiles(window._allFiles, "all");
  } catch (err) {
    console.error(err);
    showError(err.message);
  }
}

// Setup filters
elements.filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const type = btn.getAttribute("data-type");
    renderFiles(window._allFiles, type);
  });
});

// Initial load
fetchAllFiles();
