// Configuration for AWS SDK and API Gateway
const AWS_CONFIG = {
    region: 'us-east-1', // Replace with your actual region
    userPoolId: 'us-east-1_EQP5dNG5Z', // Get from backend team
    clientId: '67p3js7sbqrd7bph74lqf4r224', // Get from backend team
    apiGatewayUrl: 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/dev' // Get from backend team
};

// Initialize AWS SDK (you'll need this in your HTML)
// <script src="https://cdnjs.cloudflare.com/ajax/libs/aws-sdk/2.1490.0/aws-sdk.min.js"></script>

// Authentication state management
let currentUser = null;
let authToken = null;

// Initialize AWS configuration
function initializeAWS() {
    // Configure AWS SDK
    AWS.config.region = AWS_CONFIG.region;
    
    // Check if user is already logged in
    checkAuthStatus();
}

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
        authToken = token;
        currentUser = JSON.parse(userData);
        updateAuthUI(true);
    } else {
        updateAuthUI(false);
    }
}

// Update authentication UI
function updateAuthUI(isAuthenticated) {
    const welcomeMsg = document.querySelector('.welcome-message');
    const loginBtn = document.querySelector('.auth-btn.login');
    const logoutBtn = document.querySelector('.auth-btn.logout');
    
    if (isAuthenticated && currentUser) {
        welcomeMsg.textContent = `Welcome, ${currentUser.firstName || 'User'}!`;
        welcomeMsg.style.display = 'inline';
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
    } else {
        welcomeMsg.style.display = 'none';
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
    }
}

// API call helper function
async function makeAPICall(endpoint, method = 'GET', body = null) {
    const url = `${AWS_CONFIG.apiGatewayUrl}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // Add authorization header if user is authenticated
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const options = {
        method: method,
        headers: headers
    };
    
    if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired, redirect to login
                handleAuthExpired();
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Handle expired authentication
function handleAuthExpired() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    authToken = null;
    currentUser = null;
    updateAuthUI(false);
    alert('Your session has expired. Please log in again.');
    // Redirect to login page
    window.location.href = 'login.html';
}

// Search API functions
async function searchByTags(tags) {
    try {
        showLoading('results');
        
        // Convert tags object to query parameters
        const queryParams = new URLSearchParams();
        let paramIndex = 1;
        
        for (const [species, count] of Object.entries(tags)) {
            queryParams.append(`tag${paramIndex}`, species);
            queryParams.append(`count${paramIndex}`, count);
            paramIndex++;
        }
        
        const endpoint = `/search?${queryParams.toString()}`;
        const result = await makeAPICall(endpoint);
        
        if (result) {
            displayImageResults('results', result.links || []);
        }
    } catch (error) {
        displayError('results', 'Failed to search by tags: ' + error.message);
    }
}

async function searchBySpecies(species) {
    try {
        showLoading('species-results');
        
        // For species search, we can use POST with JSON body
        const body = { species: species };
        const result = await makeAPICall('/search/species', 'POST', body);
        
        if (result) {
            displayImageResults('species-results', result.links || []);
        }
    } catch (error) {
        displayError('species-results', 'Failed to search by species: ' + error.message);
    }
}

async function searchByUrl(thumbnailUrl) {
    try {
        showLoading('url-results');
        
        const body = { thumbnailUrl: thumbnailUrl };
        const result = await makeAPICall('/search/url', 'POST', body);
        
        if (result) {
            displayUrlResult('url-results', result.originalUrl);
        }
    } catch (error) {
        displayError('url-results', 'Failed to search by URL: ' + error.message);
    }
}

async function searchByFile(file) {
    try {
        showLoading('file-results');
        
        // For file upload, we need to use FormData
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${AWS_CONFIG.apiGatewayUrl}/search/file`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        displayImageResults('file-results', result.links || []);
    } catch (error) {
        displayError('file-results', 'Failed to search by file: ' + error.message);
    }
}

// UI helper functions
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="search-results">
            <div class="loading">🔄 Searching...</div>
        </div>
    `;
}

function displayImageResults(containerId, imageLinks) {
    const container = document.getElementById(containerId);
    
    if (!imageLinks || imageLinks.length === 0) {
        container.innerHTML = `
            <div class="search-results">
                <h3>No Results Found</h3>
                <p>No images found matching your search criteria.</p>
            </div>
        `;
        return;
    }
    
    const imagesHtml = imageLinks.map(link => `
        <div class="result-item">
            <img src="${link}" alt="Bird image" class="result-thumbnail" onclick="openFullImage('${link}')" />
        </div>
    `).join('');
    
    container.innerHTML = `
        <div class="search-results">
            <h3>Search Results (${imageLinks.length} found)</h3>
            <div class="results-grid">
                ${imagesHtml}
            </div>
        </div>
    `;
}

function displayUrlResult(containerId, originalUrl) {
    const container = document.getElementById(containerId);
    
    if (!originalUrl) {
        container.innerHTML = `
            <div class="search-results">
                <h3>No Results Found</h3>
                <p>No original file found for this thumbnail URL.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="search-results">
            <h3>Original File Found</h3>
            <p><strong>Original URL:</strong></p>
            <p><a href="${originalUrl}" target="_blank">${originalUrl}</a></p>
            <button onclick="window.open('${originalUrl}', '_blank')" class="upload-btn">
                View Full Size Image
            </button>
        </div>
    `;
}

function displayError(containerId, errorMessage) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="search-results error">
            <h3>Error</h3>
            <p>${errorMessage}</p>
        </div>
    `;
}

function openFullImage(imageUrl) {
    // Convert thumbnail URL to full image URL if needed
    const fullImageUrl = imageUrl.replace('-thumb.png', '.jpg'); // Adjust based on your naming convention
    window.open(fullImageUrl, '_blank');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeAWS();
});