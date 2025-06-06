// navigation.js - Shared navigation functions
// Include this in all your HTML pages

// Navigation functions
function goToLogin() {
    window.location.href = 'loginPage.html';
}

function goToHome() {
    window.location.href = 'homePage.html';
}

function goToSearch() {
    window.location.href = 'searchPage.html';
}

function goToUpload() {
    window.location.href = 'uploadPage.html';
}

function goToManage() {
    window.location.href = 'managePage.html';
}

function handleLogout() {
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Show confirmation
    alert('You have been logged out successfully');
    
    // Redirect to home or login page
    window.location.href = 'index.html';
}

// Add active class to current page navigation
function setActiveNavigation() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        // Check if link href matches current page
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || 
            (currentPage === 'index.html' && linkHref === 'index.html') ||
            (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Initialize navigation when page loads
document.addEventListener('DOMContentLoaded', function() {
    setActiveNavigation();
    
    // Check authentication status for all pages
    checkAuthenticationStatus();
});

// Check if user should be redirected based on authentication
function checkAuthenticationStatus() {
    const currentPage = window.location.pathname.split('/').pop();
    const token = localStorage.getItem('authToken');
    
    // Pages that require authentication
    const protectedPages = ['search.html', 'upload.html', 'manage.html'];
    
    // If user is not authenticated and trying to access protected page
    if (!token && protectedPages.includes(currentPage)) {
        alert('Please log in to access this page');
        window.location.href = 'login.html';
        return;
    }
    
    // If user is authenticated, update UI accordingly
    if (token) {
        updateAuthenticationUI(true);
    } else {
        updateAuthenticationUI(false);
    }
}

function updateAuthenticationUI(isAuthenticated) {
    const welcomeMsg = document.querySelector('.welcome-message');
    const loginBtn = document.querySelector('.auth-btn.login');
    const logoutBtn = document.querySelector('.auth-btn.logout');
    
    if (isAuthenticated) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (welcomeMsg) welcomeMsg.textContent = `Welcome, ${userData.firstName || 'User'}!`;
        if (welcomeMsg) welcomeMsg.style.display = 'inline';
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        if (welcomeMsg) welcomeMsg.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}