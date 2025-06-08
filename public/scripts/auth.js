// auth.js - Complete AWS Cognito Authentication System

// STEP 1: Replace these with your actual Cognito details
const COGNITO_CONFIG = {
    userPoolId: 'us-east-1_XXXXXXXXX',     // GET THIS FROM YOUR BACKEND TEAM
    clientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxx', // GET THIS FROM YOUR BACKEND TEAM  
    region: 'us-east-1'                     // GET THIS FROM YOUR BACKEND TEAM
};

// Global variables
let userPool;
let currentUser = null;
let userToken = null;

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeCognito();
    checkAuthenticationStatus();
    setupAuthEventListeners();
});

// Initialize Cognito User Pool
function initializeCognito() {
    try {
        const poolData = {
            UserPoolId: COGNITO_CONFIG.userPoolId,
            ClientId: COGNITO_CONFIG.clientId
        };
        
        userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        console.log('Cognito initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Cognito:', error);
        showError('Failed to initialize authentication system');
    }
}

// Check if user is already authenticated
function checkAuthenticationStatus() {
    try {
        currentUser = userPool.getCurrentUser();
        
        if (currentUser) {
            console.log('User found:', currentUser.getUsername());
            
            // Get user session
            currentUser.getSession((err, session) => {
                if (err) {
                    console.error('Session error:', err);
                    handleUnauthenticatedUser();
                    return;
                }
                
                if (session.isValid()) {
                    console.log('Valid session found');
                    userToken = session.getIdToken().getJwtToken();
                    handleAuthenticatedUser(currentUser.getUsername());
                } else {
                    console.log('Invalid session');
                    handleUnauthenticatedUser();
                }
            });
        } else {
            console.log('No user found');
            handleUnauthenticatedUser();
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
        handleUnauthenticatedUser();
    }
}

// Handle authenticated user
function handleAuthenticatedUser(username) {
    console.log('User authenticated:', username);
    
    // Update UI
    updateAuthUI(true, username);
    
    // Show main content
    showMainContent();
    
    // Update API config with token
    if (window.API_CONFIG) {
        window.API_CONFIG.headers['Authorization'] = `Bearer ${userToken}`;
    }
}

// Handle unauthenticated user
function handleUnauthenticatedUser() {
    console.log('User not authenticated');
    
    // Update UI
    updateAuthUI(false);
    
    // Show login form
    showLoginForm();
}

// Update authentication UI
function updateAuthUI(isAuthenticated, username = '') {
    const welcomeMessage = document.querySelector('.welcome-message');
    const loginBtn = document.querySelector('.auth-btn.login');
    const logoutBtn = document.querySelector('.auth-btn.logout');
    
    if (isAuthenticated) {
        welcomeMessage.textContent = `Welcome, ${username}!`;
        welcomeMessage.style.display = 'inline';
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
    } else {
        welcomeMessage.style.display = 'none';
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
    }
}

// Setup event listeners
function setupAuthEventListeners() {
    // Login button
    const loginBtn = document.querySelector('.auth-btn.login');
    if (loginBtn) {
        loginBtn.addEventListener('click', showLoginForm);
    }
    
    // Logout button
    const logoutBtn = document.querySelector('.auth-btn.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Show login form
function showLoginForm() {
    const mainContent = document.querySelector('.container');
    
    mainContent.innerHTML = `
        <div class="auth-container">
            <div class="auth-form">
                <h2>Sign In to BirdTag</h2>
                
                <div id="auth-error" class="error-message" style="display: none;"></div>
                
                <form id="login-form">
                    <div class="form-group">
                        <label for="username">Email:</label>
                        <input type="email" id="username" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" required>
                    </div>
                    
                    <button type="submit" class="auth-submit-btn">Sign In</button>
                </form>
                
                <div class="auth-links">
                    <p>Don't have an account? <a href="#" id="show-signup">Sign Up</a></p>
                    <p><a href="#" id="forgot-password">Forgot Password?</a></p>
                </div>
            </div>
        </div>
    `;
    
    // Setup form event listeners
    setupLoginFormListeners();
}

// Show signup form
function showSignupForm() {
    const mainContent = document.querySelector('.container');
    
    mainContent.innerHTML = `
        <div class="auth-container">
            <div class="auth-form">
                <h2>Sign Up for BirdTag</h2>
                
                <div id="auth-error" class="error-message" style="display: none;"></div>
                <div id="auth-success" class="success-message" style="display: none;"></div>
                
                <form id="signup-form">
                    <div class="form-group">
                        <label for="signup-email">Email:</label>
                        <input type="email" id="signup-email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="signup-firstname">First Name:</label>
                        <input type="text" id="signup-firstname" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="signup-lastname">Last Name:</label>
                        <input type="text" id="signup-lastname" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="signup-password">Password:</label>
                        <input type="password" id="signup-password" required>
                        <small>Password must be at least 8 characters with uppercase, lowercase, number, and special character</small>
                    </div>
                    
                    <button type="submit" class="auth-submit-btn">Sign Up</button>
                </form>
                
                <div class="auth-links">
                    <p>Already have an account? <a href="#" id="show-login">Sign In</a></p>
                </div>
            </div>
        </div>
    `;
    
    // Setup form event listeners
    setupSignupFormListeners();
}

// Setup login form listeners
function setupLoginFormListeners() {
    const loginForm = document.getElementById('login-form');
    const showSignupLink = document.getElementById('show-signup');
    const forgotPasswordLink = document.getElementById('forgot-password');
    
    loginForm.addEventListener('submit', handleLogin);
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        showSignupForm();
    });
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        handleForgotPassword();
    });
}

// Setup signup form listeners
function setupSignupFormListeners() {
    const signupForm = document.getElementById('signup-form');
    const showLoginLink = document.getElementById('show-login');
    
    signupForm.addEventListener('submit', handleSignup);
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        showLoading('Signing in...');
        
        const authenticationData = {
            Username: username,
            Password: password
        };
        
        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
        
        const userData = {
            Username: username,
            Pool: userPool
        };
        
        const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function(result) {
                console.log('Login successful');
                userToken = result.getIdToken().getJwtToken();
                currentUser = cognitoUser;
                handleAuthenticatedUser(username);
            },
            
            onFailure: function(err) {
                console.error('Login failed:', err);
                showAuthError(err.message || 'Login failed');
            },
            
            newPasswordRequired: function(userAttributes, requiredAttributes) {
                // Handle new password requirement
                showNewPasswordForm(cognitoUser, userAttributes);
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        showAuthError('Login failed: ' + error.message);
    }
}

// Handle signup
async function handleSignup(e) {
    e.preventDefault();
    
    const email = document.getElementById('signup-email').value;
    const firstName = document.getElementById('signup-firstname').value;
    const lastName = document.getElementById('signup-lastname').value;
    const password = document.getElementById('signup-password').value;
    
    try {
        showLoading('Creating account...');
        
        const attributeList = [
            new AmazonCognitoIdentity.CognitoUserAttribute({
                Name: 'email',
                Value: email
            }),
            new AmazonCognitoIdentity.CognitoUserAttribute({
                Name: 'given_name',
                Value: firstName
            }),
            new AmazonCognitoIdentity.CognitoUserAttribute({
                Name: 'family_name',
                Value: lastName
            })
        ];
        
        userPool.signUp(email, password, attributeList, null, function(err, result) {
            if (err) {
                console.error('Signup failed:', err);
                showAuthError(err.message);
                return;
            }
            
            console.log('Signup successful');
            showAuthSuccess('Account created successfully! Please check your email to verify your account, then sign in.');
            
            // Show verification form
            setTimeout(() => {
                showVerificationForm(email);
            }, 3000);
        });
        
    } catch (error) {
        console.error('Signup error:', error);
        showAuthError('Signup failed: ' + error.message);
    }
}

// Show verification form
function showVerificationForm(email) {
    const mainContent = document.querySelector('.container');
    
    mainContent.innerHTML = `
        <div class="auth-container">
            <div class="auth-form">
                <h2>Verify Your Email</h2>
                
                <div id="auth-error" class="error-message" style="display: none;"></div>
                <div id="auth-success" class="success-message" style="display: none;"></div>
                
                <p>Please enter the verification code sent to ${email}</p>
                
                <form id="verify-form">
                    <div class="form-group">
                        <label for="verification-code">Verification Code:</label>
                        <input type="text" id="verification-code" required>
                    </div>
                    
                    <button type="submit" class="auth-submit-btn">Verify Email</button>
                </form>
                
                <div class="auth-links">
                    <p><a href="#" id="resend-code">Resend Code</a></p>
                    <p><a href="#" id="back-to-login">Back to Sign In</a></p>
                </div>
            </div>
        </div>
    `;
    
    // Setup verification listeners
    setupVerificationListeners(email);
}

// Setup verification listeners
function setupVerificationListeners(email) {
    const verifyForm = document.getElementById('verify-form');
    const resendLink = document.getElementById('resend-code');
    const backToLoginLink = document.getElementById('back-to-login');
    
    verifyForm.addEventListener('submit', (e) => handleVerification(e, email));
    resendLink.addEventListener('click', (e) => {
        e.preventDefault();
        resendVerificationCode(email);
    });
    backToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });
}

// Handle email verification
function handleVerification(e, email) {
    e.preventDefault();
    
    const verificationCode = document.getElementById('verification-code').value;
    
    const userData = {
        Username: email,
        Pool: userPool
    };
    
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    
    cognitoUser.confirmRegistration(verificationCode, true, function(err, result) {
        if (err) {
            console.error('Verification failed:', err);
            showAuthError(err.message);
            return;
        }
        
        console.log('Verification successful');
        showAuthSuccess('Email verified successfully! You can now sign in.');
        
        setTimeout(() => {
            showLoginForm();
        }, 2000);
    });
}

// Handle logout
function handleLogout() {
    if (currentUser) {
        currentUser.signOut();
        currentUser = null;
        userToken = null;
        
        // Clear API token
        if (window.API_CONFIG) {
            delete window.API_CONFIG.headers['Authorization'];
        }
        
        console.log('User logged out');
        handleUnauthenticatedUser();
    }
}

// Show main content (your search page)
function showMainContent() {
    // This will load your original search page content
    window.location.reload(); // Simple approach - reload the page to show search interface
}

// Utility functions
function showLoading(message) {
    const errorDiv = document.getElementById('auth-error');
    const successDiv = document.getElementById('auth-success');
    
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
    }
}

function showAuthError(message) {
    const errorDiv = document.getElementById('auth-error');
    const successDiv = document.getElementById('auth-success');
    
    if (successDiv) successDiv.style.display = 'none';
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function showAuthSuccess(message) {
    const errorDiv = document.getElementById('auth-error');
    const successDiv = document.getElementById('auth-success');
    
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
    }
}

// Make authentication functions available globally
window.authManager = {
    getCurrentUser: () => currentUser,
    getUserToken: () => userToken,
    isAuthenticated: () => currentUser !== null && userToken !== null,
    logout: handleLogout
};