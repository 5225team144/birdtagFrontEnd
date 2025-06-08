// searchPageScript.js - Complete implementation for your search page
console.log("hello")
// Configuration - Replace with your actual API details
const API_CONFIG = {
    baseUrl: 'https://d32mqshkvl.execute-api.ap-southeast-2.amazonaws.com/queries01',
    headers: {
        'Content-Type': 'application/json'// Replace with actual API key
    }
};

// DOM Elements
let elements = {};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupTabSwitching();
    setupDynamicFields();
    setupSearchHandlers();
    setupFileUpload();
});

function initializeElements() {
    elements = {
        // Tabs
        tabs: document.querySelectorAll('.tab'),
        tabContents: document.querySelectorAll('.tab-content'),
        
        // Tags search
        addTagsBtn: document.getElementById('add-tags'),
        tagSearchBtn: document.getElementById('search-btn'),
        tagFieldsContainer: document.querySelector('#tag-fields .dynamic-fields-container'),
        tagResults: document.getElementById('results'),
        
        // Species search
        addSpeciesBtn: document.getElementById('add-species'),
        speciesSearchBtn: document.getElementById('species-search-btn'),
        speciesFieldsContainer: document.querySelector('#species-fields .dynamic-fields-container'),
        speciesResults: document.getElementById('species-results'),
        
        // URL search
        urlInput: document.getElementById('url-input'),
        urlSearchBtn: document.getElementById('url-search-btn'),
        urlResults: document.getElementById('url-results'),
        
        // File search
        fileDropZone: document.getElementById('file-drop-zone'),
        fileUploadInput: document.getElementById('file-upload-input'),
        fileSearchBtn: document.getElementById('file-search-btn'),
        fileResults: document.getElementById('file-results')
    };
}

// Tab Switching Functionality
function setupTabSwitching() {
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            elements.tabs.forEach(t => t.classList.remove('active'));
            elements.tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// Dynamic Fields Management
function setupDynamicFields() {
    // Add tags functionality
    elements.addTagsBtn.addEventListener('click', () => {
        addTagField();
    });
    
    // Add species functionality
    elements.addSpeciesBtn.addEventListener('click', () => {
        addSpeciesField();
    });
    
    // Setup remove buttons for existing fields
    setupRemoveButtons();
}

function addTagField() {
    const newField = document.createElement('div');
    newField.className = 'input-group';
    newField.innerHTML = `
        <input type="text" placeholder="Species (e.g., crow)" required />
        <input type="number" placeholder="Count (e.g., 2)" min="1" value="1" required />
        <button class="remove-field" type="button">Remove</button>
    `;
    
    elements.tagFieldsContainer.appendChild(newField);
    
    // Add event listener to new remove button
    newField.querySelector('.remove-field').addEventListener('click', function() {
        newField.remove();
    });
}

function addSpeciesField() {
    const newField = document.createElement('div');
    newField.className = 'input-group';
    newField.innerHTML = `
        <input type="text" placeholder="Enter bird species name" />
        <button class="remove-field" type="button">Remove</button>
    `;
    
    elements.speciesFieldsContainer.appendChild(newField);
    
    // Add event listener to new remove button
    newField.querySelector('.remove-field').addEventListener('click', function() {
        newField.remove();
    });
}

function setupRemoveButtons() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-field')) {
            const inputGroup = e.target.closest('.input-group');
            const container = inputGroup.parentElement;
            
            // Only remove if there's more than one field
            if (container.children.length > 1) {
                inputGroup.remove();
            } else {
                alert('At least one field is required!');
            }
        }
    });
}

// Search Handlers
function setupSearchHandlers() {
    // Tags search
    elements.tagSearchBtn.addEventListener('click', handleTagSearch);
    
    // Species search
    elements.speciesSearchBtn.addEventListener('click', handleSpeciesSearch);
    
    // URL search
    elements.urlSearchBtn.addEventListener('click', handleUrlSearch);
    
    // File search
    elements.fileSearchBtn.addEventListener('click', handleFileSearch);
}

// Tags Search Handler
async function handleTagSearch() {
    try {
        showLoading(elements.tagResults);
        
        // Collect data from tag fields
        const tagData = {};
        const inputGroups = elements.tagFieldsContainer.querySelectorAll('.input-group');
        
        inputGroups.forEach(group => {
            const speciesInput = group.querySelector('input[type="text"]');
            const countInput = group.querySelector('input[type="number"]');
            
            if (speciesInput.value.trim() && countInput.value) {
                tagData[speciesInput.value.trim().toLowerCase()] = parseInt(countInput.value);
            }
        });
        
        if (Object.keys(tagData).length === 0) {
            throw new Error('Please enter at least one species and count');
        }
        
        console.log('Sending tag search request:', tagData);
        
        const response = await fetch(`${API_CONFIG.baseUrl}/search-by-tags`, {
            method: 'POST',
            headers: API_CONFIG.headers,
            body: JSON.stringify(tagData)
        });
        
        if (!response.ok) {
            console.log('Raw response headers:', [...response.headers.entries()]); // Log headers for debugging
            console.log('Raw response status:', response.status); // Log status for debugging
            console.log('Raw response status text:', response.statusText); // Log status text for debugging
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("API result:", result); // Log the result for debugging
        displaySearchResults(result, elements.tagResults);
        
    } catch (error) {
        console.error('Tag search error:', error);
        showError(elements.tagResults, error.message);
    }
}

// Species Search Handler
async function handleSpeciesSearch() {
    try {
        showLoading(elements.speciesResults);
        
        // Collect species names
        const speciesData = {};
        const inputGroups = elements.speciesFieldsContainer.querySelectorAll('.input-group');
        
        inputGroups.forEach(group => {
            const speciesInput = group.querySelector('input[type="text"]');
            if (speciesInput.value.trim()) {
                speciesData[speciesInput.value.trim().toLowerCase()] = 1; // Default count of 1 for species search
            }
        });
        
        if (Object.keys(speciesData).length === 0) {
            throw new Error('Please enter at least one bird species');
        }
        
        console.log('Sending species search request:', speciesData);
        
        // Use the same endpoint as tags but with count = 1
        const response = await fetch(`${API_CONFIG.baseUrl}/search-by-tags`, {
            method: 'POST',
            headers: API_CONFIG.headers,
            body: JSON.stringify(speciesData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        displaySearchResults(result, elements.speciesResults);
        
    } catch (error) {
        console.error('Species search error:', error);
        showError(elements.speciesResults, error.message);
    }
}

// URL Search Handler
async function handleUrlSearch() {
    console.log("hello")
    try {
        const url = elements.urlInput.value.trim();
        
        if (!url) {
            throw new Error('Please enter a thumbnail URL');
        }
        
        if (!isValidUrl(url)) {
            throw new Error('Please enter a valid URL');
        }
        
        showLoading(elements.urlResults);
        
        console.log('Sending URL search request:', { url: url });
        
        // You'll need to create this endpoint or modify existing one
        const response = await fetch(`${API_CONFIG.baseUrl}/search-by-url`, {
            method: 'POST',
            headers: API_CONFIG.headers,
            body: JSON.stringify({ thumbnail_url: url })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        displayUrlResult(result, elements.urlResults);
        
    } catch (error) {
        console.error('URL search error:', error);
        showError(elements.urlResults, error.message);
    }
}

// File Search Handler
async function handleFileSearch() {
    console.log("hello");
    try {
        const fileInput = elements.fileUploadInput;

        if (!fileInput.files || fileInput.files.length === 0) {
            throw new Error('Please select a file first');
        }

        const file = fileInput.files[0];
        showLoading(elements.fileResults);

        const reader = new FileReader();
        reader.onload = async function () {
            const base64Data = reader.result; // 包含 data:image/jpeg;base64,...

            // console.log(base64Data)

            const response = await fetch(`${API_CONFIG.baseUrl}/search-by-upload-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image: base64Data })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            displaySearchResults(result, elements.fileResults);
        };

        reader.readAsDataURL(file); // file 是上传的 Blob
    } catch (error) {
        console.error('File search error:', error);
        showError(elements.fileResults, error.message);
    }
}

// File Upload Setup
function setupFileUpload() {
    // Click to upload
    elements.fileDropZone.addEventListener('click', () => {
        elements.fileUploadInput.click();
    });
    
    // File selection handler
    elements.fileUploadInput.addEventListener('change', (e) => {
        handleFileSelection(e.target.files);
    });
    
    // Drag and drop handlers
    elements.fileDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.fileDropZone.style.backgroundColor = '#f0f8ff';
    });
    
    elements.fileDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        elements.fileDropZone.style.backgroundColor = '';
    });
    
    elements.fileDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.fileDropZone.style.backgroundColor = '';
        handleFileSelection(e.dataTransfer.files);
    });
}

function handleFileSelection(files) {
    if (files && files.length > 0) {
        const file = files[0];
        
        // Validate file type
        const allowedTypes = ['image/', 'audio/', 'video/'];
        const isValidType = allowedTypes.some(type => file.type.startsWith(type));
        
        if (!isValidType) {
            alert('Please select an image, audio, or video file');
            return;
        }
        
        // Update UI to show selected file
        const uploadIcon = elements.fileDropZone.querySelector('.upload-icon');
        const uploadText = elements.fileDropZone.querySelector('p');
        
        uploadIcon.textContent = '✓';
        uploadText.innerHTML = `<strong>File selected:</strong> ${file.name}`;
        
        // Enable search button
        elements.fileSearchBtn.disabled = false;
        
        // Store file reference
        elements.fileUploadInput.files = files;
    }
}

// Display Functions
function displaySearchResults(result, container) {
    if (!result.links || result.links.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <p>No files found matching your search criteria.</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="search-results">
            <h3>Found ${result.count} file(s)</h3>
            <div class="results-grid">
    `;
    
    result.links.forEach(item => {
        if (item.media_type && item.media_type.startsWith('image/')) {
            // Display image thumbnail
            html += `
                <div class="result-item image-item">
                    <img src="${item.thumbnail_url}" alt="Bird image" 
                         onclick="openFullImage('${item.image_url}')" />
                    <div class="item-info">
                        <p><strong>Type:</strong> ${item.media_type}</p>
                        <p><strong>Upload:</strong> ${formatDate(item.upload_time)}</p>
                        <button onclick="copyToClipboard('${item.image_url}')">Copy URL</button>
                    </div>
                </div>
            `;
        } else {
            // Display video/audio as download link
            html += `
                <div class="result-item media-item">
                    <div class="media-icon">🎵</div>
                    <div class="item-info">
                        <p><strong>Type:</strong> ${item.media_type || 'Media file'}</p>
                        <p><strong>Upload:</strong> ${formatDate(item.upload_time)}</p>
                        <a href="${item.image_url}" download class="download-btn">Download File</a>
                        <button onclick="copyToClipboard('${item.image_url}')">Copy URL</button>
                    </div>
                </div>
            `;
        }
    });
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

function displayUrlResult(result, container) {
    if (!result.original_url) {
        container.innerHTML = `
            <div class="no-results">
                <p>No original file found for this thumbnail URL.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="url-result">
            <h3>Original File Found</h3>
            <div class="result-item">
                <p><strong>Original URL:</strong></p>
                <a href="${result.original_url}" target="_blank" class="url-link">${result.original_url}</a>
                <button onclick="copyToClipboard('${result.original_url}')">Copy URL</button>
            </div>
        </div>
    `;
}

// Utility Functions
function showLoading(container) {
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Searching...</p>
        </div>
    `;
}

function showError(container, message) {
    container.innerHTML = `
        <div class="error">
            <p><strong>Error:</strong> ${message}</p>
        </div>
    `;
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
}

function openFullImage(url) {
    window.open(url, '_blank');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('URL copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('URL copied to clipboard!');
    });
}