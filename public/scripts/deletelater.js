// Tab switching functionality
function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and content
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      const target = tab.getAttribute('data-target');
      document.getElementById(target).classList.add('active');
    });
  });
}

// Dynamic Tag Field Handling
function setupDynamicTags() {
    const tagContainer = document.querySelector("#tag-fields .dynamic-fields-container");
    const tagAddBtn = document.getElementById("add-tags");
    
    tagAddBtn.addEventListener("click", () => {
        const newGroup = document.createElement("div");
        newGroup.className = "input-group";
        newGroup.innerHTML = `
            <input type="text" placeholder="Species (e.g., crow)" />
            <input type="number" placeholder="Count (e.g., 2)" min="1" value="1" />
            <button class="remove-field">Remove</button>
        `;
        tagContainer.appendChild(newGroup);
        });

        // Handle removal of dynamic fields
    tagContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-field")) {
            const groups = tagContainer.querySelectorAll(".input-group");
            if (groups.length > 1) {
                e.target.parentElement.remove();
            } else {
                alert("At least one field is required!");
            }
        }
    });
}

// Dynamic Bird Species Field Handling
function setupDynamicBirdSpecies() {
    const speciesContainer = document.querySelector("#species-fields .dynamic-fields-container");
    const speciesAddBtn = document.getElementById("add-species");

    speciesAddBtn.addEventListener("click", () => {
        const newGroup = document.createElement("div");
        newGroup.className = "input-group";
        newGroup.innerHTML = `
            <input type="text" placeholder="Bird species (e.g., magpie)" />
            <button class="remove-field">Remove</button>
        `;
        speciesContainer.appendChild(newGroup);
        });

        speciesContainer.addEventListener("click", e => {
        if (e.target.classList.contains("remove-field")) {
            const groups = speciesContainer.querySelectorAll(".input-group");
            if (groups.length > 1) {
                e.target.parentElement.remove();
            } else {
                alert("At least one field is required!");
            }
        }
    });
}

// Tag Query Submission
function setupTagQuerySubmission() {
    const tagContainer = document.querySelector("#tag-fields .dynamic-fields-container");
    
    document.getElementById("search-btn").addEventListener("click", () => {
  const groups = tagContainer.querySelectorAll(".input-group");
  const query = {};

  groups.forEach(group => {
    const species = group.querySelector("input[type='text']").value.trim();
    const count = parseInt(group.querySelector("input[type='number']").value);
    if (species) {
      query[species] = count || 1;
    }
  });

  console.log("Query by tags:", query);
  fetchResults("tags", query);
});
}

// Bird Species Query Submission
function setupSpeciesQuerySubmission() {

    const speciesContainer = document.querySelector("#species-fields .dynamic-fields-container");

    document.getElementById("species-search-btn").addEventListener("click", () => {
    const groups = speciesContainer.querySelectorAll(".input-group");
    const species = [];

    groups.forEach(group => {
        const value = group.querySelector("input[type='text']").value.trim();
        if (value) species.push(value);
    });

    console.log("Query by species:", species);
    fetchResults("species", species);
    });

}


function fetchResults(type, query) {
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = `<p>🔎 Searching for results...</p>`;

    // Example API setup — you need to replace this with your real endpoint
    const apiUrl = "https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/search"; // Replace with your actual API Gateway URL

    // Send query via POST
    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(query)
    })
    .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
    })
    .then(data => {
        resultsContainer.innerHTML = "<h3>Results:</h3>";

        if (!data.links || data.links.length === 0) {
            resultsContainer.innerHTML += `<p>❌ No results found.</p>`;
            return;
        }

        data.links.forEach(link => {
            const resultItem = document.createElement("div");
            resultItem.style.marginBottom = "1rem";
            resultItem.innerHTML = `
                <img src="${link}" alt="Bird media" style="max-width: 120px; border-radius: 8px;" />
                <br/>
                <a href="${link}" target="_blank">🔗 View Full</a>
                <hr/>
            `;
            resultsContainer.appendChild(resultItem);
        });
    })
    .catch(err => {
        console.error(err);
        resultsContainer.innerHTML = `<p style="color:red;">⚠️ Error fetching results. Please try again.</p>`;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupTabs();
    setupDynamicTags();
    setupDynamicBirdSpecies();
    setupTagQuerySubmission();
    setupSpeciesQuerySubmission();
    console.log("Search script initialized.");
});