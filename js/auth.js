// Authentication functionality with dynamic password storage - SECURE VERSION
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    // Initialize default password if not set
    if (!localStorage.getItem('adminPassword')) {
        localStorage.setItem('adminPassword', 'password123'); // Default password
    }
    
    // Check for account lock on page load
    checkAccountLock();
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me').checked;
            
            // Check if account is locked
            if (isAccountLocked()) {
                showLockoutMessage();
                return;
            }
            
            // Get current password from localStorage
            const currentPassword = localStorage.getItem('adminPassword');
            
            // Validate credentials - SECURITY FIXED
            if (username === 'admin' && password === currentPassword) {
                // Reset login attempts on successful login
                resetLoginAttempts();
                
                // Store login state
                localStorage.setItem('portfolioLoggedIn', 'true');
                localStorage.setItem('portfolioUser', username);
                
                if (rememberMe) {
                    localStorage.setItem('portfolioRememberMe', 'true');
                }
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                // SECURITY FIX: Never reveal the password!
                incrementLoginAttempts();
            }
        });
    }
    
    // Check if user is already logged in
    if (localStorage.getItem('portfolioLoggedIn') === 'true' && window.location.pathname.includes('login.html')) {
        window.location.href = 'dashboard.html';
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('portfolioLoggedIn');
            localStorage.removeItem('portfolioUser');
            localStorage.removeItem('portfolioRememberMe');
            window.location.href = 'login.html';
        });
    }
    
    // Forgot password functionality
    const forgotPasswordLink = document.getElementById('forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            showForgotPasswordModal();
        });
    }
});

// Enhanced security with login attempts tracking
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

function getLoginAttempts() {
    return parseInt(localStorage.getItem('loginAttempts')) || 0;
}

function incrementLoginAttempts() {
    const loginAttempts = getLoginAttempts() + 1;
    localStorage.setItem('loginAttempts', loginAttempts.toString());
    const currentTime = new Date().getTime();
    localStorage.setItem('lastLoginAttempt', currentTime.toString());
    
    if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        lockAccount();
        return;
    }
    
    // Show remaining attempts (without revealing password)
    const remaining = MAX_LOGIN_ATTEMPTS - loginAttempts;
    if (remaining <= 3) {
        showAlert(`Invalid credentials. ${remaining} attempt(s) remaining.`, 'warning');
    } else {
        showAlert('Invalid credentials. Please try again.', 'error');
    }
}

function resetLoginAttempts() {
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lastLoginAttempt');
    localStorage.removeItem('accountLockedUntil');
}

function isAccountLocked() {
    const lockUntil = localStorage.getItem('accountLockedUntil');
    return lockUntil && new Date().getTime() < parseInt(lockUntil);
}

function lockAccount() {
    const lockUntil = new Date().getTime() + LOCKOUT_TIME;
    localStorage.setItem('accountLockedUntil', lockUntil.toString());
    
    showLockoutMessage();
}

function showLockoutMessage() {
    const lockUntil = localStorage.getItem('accountLockedUntil');
    if (!lockUntil) return;
    
    const lockTime = new Date(parseInt(lockUntil));
    const timeLeft = lockTime - new Date().getTime();
    
    if (timeLeft <= 0) {
        resetLoginAttempts();
        return;
    }
    
    // Disable login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.style.opacity = '0.5';
        loginForm.style.pointerEvents = 'none';
        
        // Remove existing countdown if any
        const existingCountdown = document.getElementById('lockout-countdown');
        if (existingCountdown) {
            existingCountdown.remove();
        }
        
        // Show countdown
        const countdownElement = document.createElement('div');
        countdownElement.id = 'lockout-countdown';
        countdownElement.style.cssText = `
            text-align: center;
            color: #e74c3c;
            font-weight: bold;
            margin: 10px 0;
            padding: 15px;
            background: #fdf2f2;
            border-radius: 8px;
            border: 1px solid #e74c3c;
        `;
        
        const submitButton = loginForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.parentNode.insertBefore(countdownElement, submitButton);
        }
        
        // Update countdown every second
        const countdownInterval = setInterval(() => {
            const timeLeft = lockTime - new Date().getTime();
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                loginForm.style.opacity = '1';
                loginForm.style.pointerEvents = 'auto';
                resetLoginAttempts();
                if (countdownElement) countdownElement.remove();
                showAlert('Account unlocked. You can try logging in again.', 'success');
            } else {
                const minutes = Math.floor(timeLeft / 60000);
                const seconds = Math.floor((timeLeft % 60000) / 1000);
                countdownElement.innerHTML = `
                    <i class="fas fa-lock"></i> 
                    Account temporarily locked due to too many failed attempts.
                    <br>
                    <strong>Time remaining: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</strong>
                `;
            }
        }, 1000);
    }
}

function checkAccountLock() {
    if (isAccountLocked()) {
        showLockoutMessage();
    }
}

// Alert system
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `custom-alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    const colors = {
        error: '#e74c3c',
        warning: '#f39c12',
        success: '#2ecc71',
        info: '#3498db'
    };
    
    alert.style.background = colors[type] || colors.info;
    
    const icons = {
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        success: 'fa-check-circle',
        info: 'fa-info-circle'
    };
    
    alert.innerHTML = `
        <i class="fas ${icons[type]}"></i> ${message}
        <button onclick="this.parentElement.remove()" style="background:none; border:none; color:white; margin-left:10px; cursor:pointer;">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// Forgot Password functionality
function showForgotPasswordModal() {
    // Get security settings from portfolio data
    const security = portfolioData.data.security || {};
    
    // If no security question is set, use default
    const hasSecuritySetup = security.question && security.answer;
    
    const modal = document.createElement('div');
    modal.id = 'forgot-password-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 400px; width: 90%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="color: #2c3e50; margin: 0;">
                    <i class="fas fa-key"></i> Reset Password
                </h3>
                <button onclick="closeForgotPasswordModal()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #7f8c8d;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            ${!hasSecuritySetup ? `
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong> Security not configured</strong>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">
                        Please set up security questions in the dashboard settings first.
                    </p>
                </div>
            ` : ''}
            
            <p style="margin-bottom: 1.5rem; color: #7f8c8d;">
                To reset your password, you'll need to answer your security question.
            </p>
            
            <div class="form-group">
                <label class="form-label">Security Question</label>
                <div style="padding: 1rem; background: #f8f9fa; border-radius: 8px; margin-bottom: 1rem;">
                    <strong>${getSecurityQuestionText(security)}</strong>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Security Answer</label>
                <input type="text" id="security-answer" class="form-control" placeholder="Enter your answer" 
                       ${!hasSecuritySetup ? 'disabled' : ''}>
            </div>
            
            <div class="form-group">
                <label class="form-label">New Password</label>
                <input type="password" id="new-password" class="form-control" placeholder="Enter new password"
                       ${!hasSecuritySetup ? 'disabled' : ''}>
            </div>
            
            <div class="form-group">
                <label class="form-label">Confirm New Password</label>
                <input type="password" id="confirm-password" class="form-control" placeholder="Confirm new password"
                       ${!hasSecuritySetup ? 'disabled' : ''}>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 1.5rem;">
                <button type="button" onclick="closeForgotPasswordModal()" class="btn" style="background: #95a5a6; flex: 1;">
                    Cancel
                </button>
                <button type="button" onclick="resetPassword()" class="btn btn-primary" style="flex: 1;" 
                        ${!hasSecuritySetup ? 'disabled' : ''}>
                    Reset Password
                </button>
            </div>
            
            ${!hasSecuritySetup ? `
                <div style="margin-top: 1rem; padding: 1rem; background: #e8f4fd; border-radius: 8px; font-size: 0.9rem;">
                    <p style="margin: 0; color: #2c3e50;">
                        <i class="fas fa-info-circle"></i> 
                        <strong>Setup Required:</strong> Go to Dashboard → Settings to configure security questions.
                    </p>
                </div>
            ` : ''}
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Helper function to get security question text
function getSecurityQuestionText(security) {
    if (!security.question) return 'Security question not set';
    
    const questions = {
        'pet': 'What was the name of your first pet?',
        'city': 'What city were you born in?',
        'school': 'What was the name of your elementary school?',
        'custom': security.customQuestion || 'Custom security question'
    };
    
    return questions[security.question] || 'Security question not set';
}

function closeForgotPasswordModal() {
    const modal = document.getElementById('forgot-password-modal');
    if (modal) {
        modal.remove();
    }
}

function resetPassword() {
    const securityAnswer = document.getElementById('security-answer').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Get security settings
    const security = portfolioData.data.security || {};
    
    if (!security.question || !security.answer) {
        showAlert('Security questions are not configured. Please set them up in the dashboard settings.', 'error');
        return;
    }
    
    if (!securityAnswer || !newPassword || !confirmPassword) {
        showAlert('Please fill in all fields.', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showAlert('New passwords do not match.', 'error');
        return;
    }
    
    // Use the stored security answer
    if (securityAnswer !== security.answer) {
        showAlert('Security answer is incorrect.', 'error');
        return;
    }
    
    // Update password
    const result = updateAdminPassword(newPassword);
    if (result.success) {
        showAlert('Password reset successfully! You can now login with your new password.', 'success');
        closeForgotPasswordModal();
        resetLoginAttempts();
    } else {
        showAlert(result.message, 'error');
    }
}

// Password update function - Call this from admin panel
function updateAdminPassword(newPassword) {
    if (newPassword && newPassword.length >= 6) {
        // Enhanced password validation
        const validation = validatePasswordStrength(newPassword);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }
        
        localStorage.setItem('adminPassword', newPassword);
        // Reset login attempts on password change
        resetLoginAttempts();
        return { success: true, message: 'Password updated successfully!' };
    }
    return { success: false, message: 'Password must be at least 6 characters long' };
}

// Get current password (for display purposes) - SECURE VERSION
function getCurrentPassword() {
    // Never return the actual password!
    return localStorage.getItem('adminPassword') ? '••••••••' : 'Not set';
}

// Password strength validation
function validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!hasUpperCase) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!hasLowerCase) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!hasNumbers) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    if (!hasSpecialChar) {
        return { valid: false, message: 'Password must contain at least one special character' };
    }
    
    return { valid: true, message: 'Password is strong' };
}

// Session timeout for security
function initializeSessionTimeout() {
    let timeout;
    const timeoutDuration = 30 * 60 * 1000; // 30 minutes
    
    function resetTimer() {
        clearTimeout(timeout);
        timeout = setTimeout(logout, timeoutDuration);
    }
    
    function logout() {
        if (localStorage.getItem('portfolioLoggedIn') === 'true') {
            localStorage.removeItem('portfolioLoggedIn');
            localStorage.removeItem('portfolioUser');
            alert('Session expired due to inactivity.');
            window.location.href = 'login.html';
        }
    }
    
    // Reset timer on user activity
    window.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;
    document.onclick = resetTimer;
    document.onscroll = resetTimer;
}

// Initialize session timeout if logged in
if (localStorage.getItem('portfolioLoggedIn') === 'true') {
    initializeSessionTimeout();
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);