// Dashboard functionality - COMPLETE VERSION
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (localStorage.getItem('portfolioLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize dashboard
    initDashboard();
});

// ✅ ADD initModals FUNCTION RIGHT HERE
function initModals() {
    // Close modals when clicking X
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
    
    // Resume upload modal functionality
    const uploadResumeBtn = document.getElementById('upload-resume-btn');
    const browseResumeBtn = document.getElementById('browse-resume-btn');
    const resumeFileInput = document.getElementById('resume-file');
    const cancelUploadBtn = document.getElementById('cancel-upload-btn');
    const confirmUploadBtn = document.getElementById('confirm-upload-btn');
    
    if (uploadResumeBtn) {
        uploadResumeBtn.addEventListener('click', function() {
            document.getElementById('upload-resume-modal').style.display = 'flex';
        });
    }
    
    if (browseResumeBtn) {
        browseResumeBtn.addEventListener('click', function() {
            resumeFileInput.click();
        });
    }
    
    if (resumeFileInput) {
        resumeFileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                document.getElementById('file-name').textContent = file.name;
                document.getElementById('file-size').textContent = formatFileSize(file.size);
                document.getElementById('file-info').style.display = 'block';
                confirmUploadBtn.disabled = false;
            }
        });
    }
    
    if (cancelUploadBtn) {
        cancelUploadBtn.addEventListener('click', function() {
            document.getElementById('upload-resume-modal').style.display = 'none';
            resetResumeUploadForm();
        });
    }
    
    if (confirmUploadBtn) {
        confirmUploadBtn.addEventListener('click', handleResumeUpload);
    }
}

// ✅ CONTINUE WITH THE EXISTING initDashboard FUNCTION
async function initDashboard() {
    console.log('Initializing dashboard...');
    
    try {
        // Wait for data to be fully loaded
        await portfolioData.ensureDataLoaded();
        console.log('Dashboard data loaded:', portfolioData.data);
        
        // DOM Elements
        const menuItems = document.querySelectorAll('.menu-item');
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        const logoutBtn = document.getElementById('logout-btn');
        
        // Set user info - ADD NULL CHECKS
        if (userAvatar && portfolioData.data?.profile?.name) {
            userAvatar.textContent = portfolioData.data.profile.name.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        
        if (userName && portfolioData.data?.profile?.name) {
            userName.textContent = portfolioData.data.profile.name;
        }
        initModals();
        
        // Initialize upload functionality
        initUploadFunctionality();
        
        // Menu navigation
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                
                // Update active menu item
                menuItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                // Show corresponding section
                showSection(section);
            });
        });
        
        // Logout functionality
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('portfolioLoggedIn');
                localStorage.removeItem('portfolioUser');
                window.location.href = 'login.html';
            });
        }
        
        // Load initial section
        showSection('overview');
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected section
    const sectionElement = document.getElementById(`${section}-section`);
    if (sectionElement) {
        sectionElement.style.display = 'block';
    }
    
    // Update section title
    const titles = {
    overview: 'Dashboard Overview',
    profile: 'Profile Information',
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
    certificates: 'Certificates',
    resume: 'Resume Management',
    settings: 'Account Settings',
    projects: 'Projects',
    about: 'About Me & Bio',
    'recruiter-settings': 'Recruiter Panel Settings'
};

document.getElementById('current-section-title').textContent = titles[section] || 'Dashboard';

// Load section content
loadSectionContent(section);
}

function loadSectionContent(section) {
    const sectionElement = document.getElementById(`${section}-section`);
    if (!sectionElement) {
        console.error(`Section element not found: ${section}-section`);
        return;
    }
    
    try {
        switch(section) {
            case 'overview':
                loadOverviewSection(sectionElement);
                break;
            case 'profile':
                loadProfileSection(sectionElement);
                break;
            case 'experience':
                loadExperienceSection(sectionElement);
                break;
            case 'education':
                loadEducationSection(sectionElement);
                break;
            case 'skills':
                loadSkillsSection(sectionElement);
                break;
            case 'certificates':
                loadCertificatesSection(sectionElement);
                break;
            case 'resume':
                loadResumeSection(sectionElement);
                break;
            case 'settings':
                loadSettingsSection(sectionElement);
                break;
            case 'projects':
                loadProjectsSection(sectionElement);
                break;
            case 'about':
                loadAboutSection(sectionElement);
                break;
            // ✅ ADD THIS NEW CASE RIGHT HERE
            case 'recruiter-settings':
                loadRecruiterSettingsSection(sectionElement);
                break;
            default:
                console.warn(`Unknown section: ${section}`);
        }
    } catch (error) {
        console.error(`Error loading section ${section}:`, error);
        sectionElement.innerHTML = `
            <div class="error-message">
                <h3>Error Loading Content</h3>
                <p>Failed to load ${section} section. Please refresh the page.</p>
                <button class="btn" onclick="location.reload()">Refresh Page</button>
            </div>
        `;
    }
}

function loadOverviewSection(container) {
    const stats = portfolioData.data.stats;
    
    container.innerHTML = `
        <div class="dashboard-cards">
            <div class="dashboard-card">
                <div class="card-icon primary">
                    <i class="fas fa-file-alt"></i>
                </div>
                <div class="card-content">
                    <div class="card-title">Resumes</div>
                    <div class="card-value">${stats.resumes}</div>
                    <div class="card-change positive">+1 from last month</div>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-icon success">
                    <i class="fas fa-image"></i>
                </div>
                <div class="card-content">
                    <div class="card-title">Portfolio Images</div>
                    <div class="card-value">${stats.images}</div>
                    <div class="card-change positive">+3 from last month</div>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-icon warning">
                    <i class="fas fa-award"></i>
                </div>
                <div class="card-content">
                    <div class="card-title">Certificates</div>
                    <div class="card-value">${stats.certificates}</div>
                    <div class="card-change positive">+2 from last month</div>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-icon danger">
                    <i class="fas fa-eye"></i>
                </div>
                <div class="card-content">
                    <div class="card-title">Profile Views</div>
                    <div class="card-value">${stats.profileViews.toLocaleString()}</div>
                    <div class="card-change positive">+124 this week</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Recent Activity</h2>
                <div class="section-actions">
                    <button class="btn btn-secondary">View All</button>
                </div>
            </div>
            
            <div class="item-list">
                <div class="item-card">
                    <div class="item-header">
                        <div>
                            <div class="item-title">Updated Profile Information</div>
                            <div class="item-date">2 hours ago</div>
                        </div>
                    </div>
                    <p>Updated bio and contact information to reflect current role and skills.</p>
                </div>
                
                <div class="item-card">
                    <div class="item-header">
                        <div>
                            <div class="item-title">Added New Certificate</div>
                            <div class="item-date">1 day ago</div>
                        </div>
                    </div>
                    <p>Added AWS Certified Solutions Architect certificate to portfolio.</p>
                </div>
                
                <div class="item-card">
                    <div class="item-header">
                        <div>
                            <div class="item-title">Uploaded Project Images</div>
                            <div class="item-date">3 days ago</div>
                        </div>
                    </div>
                    <p>Added screenshots and documentation for the E-commerce Redesign project.</p>
                </div>
            </div>
        </div>
    `;
}

function loadProfileSection(container) {
    const profile = portfolioData.data.profile;
    
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Profile Information</h2>
                <div class="section-actions">
                    <button class="btn btn-secondary" id="preview-profile-btn">Preview</button>
                    <button class="btn" id="save-profile-btn">Save Changes</button>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Profile Picture</label>
                <div class="upload-area" id="profile-pic-upload">
                    <div class="upload-icon">
                        <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <p class="upload-text">Drag & drop your profile picture here or click to browse</p>
                    <button class="btn" id="browse-profile-pic">Browse Files</button>
                    <input type="file" class="file-input" id="profile-pic-input" accept="image/*">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Full Name</label>
                    <input type="text" class="form-control" id="personal-name" value="${profile.name}">
                </div>
                <div class="form-group">
                    <label class="form-label">Professional Title</label>
                    <input type="text" class="form-control" id="personal-title" value="${profile.title}">
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Bio/Summary</label>
                <textarea class="form-control" id="personal-bio">${profile.bio}</textarea>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" id="personal-email" value="${profile.email}">
                </div>
                <div class="form-group">
                    <label class="form-label">Phone</label>
                    <input type="tel" class="form-control" id="personal-phone" value="${profile.phone}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">LinkedIn</label>
                    <input type="url" class="form-control" id="personal-linkedin" value="${profile.linkedin}">
                </div>
                <div class="form-group">
                    <label class="form-label">GitHub</label>
                    <input type="url" class="form-control" id="personal-github" value="${profile.github}">
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Portfolio Website</label>
                <input type="url" class="form-control" id="personal-website" value="${profile.website}">
            </div>
        </div>
    `;
    
    // Add event listeners for profile section
    document.getElementById('save-profile-btn').addEventListener('click', saveProfile);
    document.getElementById('preview-profile-btn').addEventListener('click', previewProfile);
    document.getElementById('browse-profile-pic').addEventListener('click', () => {
    document.getElementById('profile-pic-input').click();
    });
    
    document.getElementById('profile-pic-input').addEventListener('change', handleProfilePicUpload);
}

function loadExperienceSection(container) {
    const experiences = portfolioData.data.experience;
    
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Work Experience</h2>
                <div class="section-actions">
                    <button class="btn" id="add-experience-btn">Add Experience</button>
                </div>
            </div>
            
            <div id="experience-list" class="item-list">
                ${experiences.length > 0 ? experiences.map(exp => `
                    <div class="item-card" data-id="${exp.id}">
                        <div class="item-header">
                            <div>
                                <div class="item-title">${exp.title}</div>
                                <div class="item-subtitle">${exp.company}</div>
                                <div class="item-date">${formatDateRange(exp.startDate, exp.endDate, exp.current)}</div>
                            </div>
                            <div class="item-actions">
                                <button class="btn btn-secondary edit-experience" data-id="${exp.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-danger delete-experience" data-id="${exp.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <p>${exp.description}</p>
                    </div>
                `).join('') : '<p>No experience added yet. Click "Add Experience" to get started.</p>'}
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('add-experience-btn').addEventListener('click', () => showExperienceModal());
    
    // Delegated event listeners for dynamic content
    container.addEventListener('click', (e) => {
        if (e.target.closest('.edit-experience')) {
            const id = parseInt(e.target.closest('.edit-experience').getAttribute('data-id'));
            editExperience(id);
        }
        if (e.target.closest('.delete-experience')) {
            const id = parseInt(e.target.closest('.delete-experience').getAttribute('data-id'));
            deleteExperience(id);
        }
    });
}

function loadEducationSection(container) {
    const education = portfolioData.data.education;
    
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Education</h2>
                <div class="section-actions">
                    <button class="btn" id="add-education-btn">Add Education</button>
                </div>
            </div>
            
            <div id="education-list" class="item-list">
                ${education.length > 0 ? education.map(edu => `
                    <div class="item-card" data-id="${edu.id}">
                        <div class="item-header">
                            <div>
                                <div class="item-title">${edu.degree}</div>
                                <div class="item-subtitle">${edu.institution}</div>
                                <div class="item-date">${formatDateRange(edu.startDate, edu.endDate, edu.current)}</div>
                            </div>
                            <div class="item-actions">
                                <button class="btn btn-secondary edit-education" data-id="${edu.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-danger delete-education" data-id="${edu.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <p>${edu.description}</p>
                    </div>
                `).join('') : '<p>No education added yet. Click "Add Education" to get started.</p>'}
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('add-education-btn').addEventListener('click', () => showEducationModal());
    
    // Delegated event listeners for dynamic content
    container.addEventListener('click', (e) => {
        if (e.target.closest('.edit-education')) {
            const id = parseInt(e.target.closest('.edit-education').getAttribute('data-id'));
            editEducation(id);
        }
        if (e.target.closest('.delete-education')) {
            const id = parseInt(e.target.closest('.delete-education').getAttribute('data-id'));
            deleteEducation(id);
        }
    });
}

function loadSkillsSection(container) {
    const skills = portfolioData.data.skills;
    
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Skills</h2>
                <div class="section-actions">
                    <button class="btn" id="add-skill-btn">Add Skill</button>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Add New Skill</label>
                <div class="form-row">
                    <input type="text" class="form-control" id="new-skill-input" placeholder="Enter a skill">
                    <button class="btn" id="save-skill-btn">Add</button>
                </div>
            </div>
            
            <div class="skills-container" id="skills-list">
                ${skills.length > 0 ? skills.map(skill => `
                    <div class="skill-tag">
                        ${skill}
                        <i class="fas fa-times delete-skill" data-skill="${skill}"></i>
                    </div>
                `).join('') : '<p>No skills added yet. Add your first skill above.</p>'}
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('save-skill-btn').addEventListener('click', addSkill);
    document.getElementById('add-skill-btn').addEventListener('click', () => {
        document.getElementById('new-skill-input').focus();
    });
    
    document.getElementById('new-skill-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addSkill();
        }
    });
    
    // Delegated event listener for delete buttons
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-skill')) {
            const skill = e.target.getAttribute('data-skill');
            removeSkill(skill);
        }
    });
}

function loadCertificatesSection(container) {
    const certificates = portfolioData.data.certificates || [];
    
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Certificates</h2>
                <div class="section-actions">
                    <button class="btn" id="add-certificate-btn">Add Certificate</button>
                </div>
            </div>
            
            <div class="upload-area" id="certificate-upload-area">
                <div class="upload-icon">
                    <i class="fas fa-file-upload"></i>
                </div>
                <p class="upload-text">Drag & drop your certificates here or click to browse</p>
                <p class="upload-hint">Supported formats: JPG, PNG, PDF (Max: 10MB)</p>
                <button class="btn" id="browse-certificates">Browse Files</button>
                <input type="file" class="file-input" id="certificate-input" accept="image/*,.pdf" multiple>
            </div>
            
            <div class="certificates-grid" id="certificates-list">
                ${certificates.length > 0 ? certificates.map(cert => `
                    <div class="certificate-card" data-id="${cert.id}">
                        <div class="certificate-image-container">
                            ${cert.image && cert.image.includes('/assets/') ? 
                                `<img src="${cert.image}" alt="${cert.name}" class="certificate-img" onerror="this.src='https://via.placeholder.com/300x200?text=Certificate+Image'">` :
                                cert.image && cert.image.startsWith('data:') ?
                                `<img src="${cert.image}" alt="${cert.name}" class="certificate-img">` :
                                `<div class="certificate-placeholder">
                                    <i class="fas fa-file-certificate"></i>
                                    <span>${cert.name}</span>
                                </div>`
                            }
                        </div>
                        <div class="certificate-info">
                            <div class="certificate-name">${cert.name}</div>
                            <div class="certificate-org">${cert.organization}</div>
                            <div class="certificate-actions">
                                <button class="btn btn-secondary edit-certificate" data-id="${cert.id}">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn btn-danger delete-certificate" data-id="${cert.id}">
                                    <i class="fas fa-trash"></i> Remove
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('') : 
                '<div class="empty-state">' +
                    '<i class="fas fa-award empty-icon"></i>' +
                    '<h3>No Certificates Added</h3>' +
                    '<p>Upload your certificates to showcase your achievements.</p>' +
                '</div>'}
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('browse-certificates').addEventListener('click', () => {
        document.getElementById('certificate-input').click();
    });
    
    // Enhanced file upload with drag & drop
    const uploadArea = document.getElementById('certificate-upload-area');
    const fileInput = document.getElementById('certificate-input');
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleCertificateFileUpload({ target: { files } });
        }
    });
    
    fileInput.addEventListener('change', handleCertificateFileUpload);
    
    // Delegated event listeners for dynamic content
    container.addEventListener('click', (e) => {
        if (e.target.closest('.delete-certificate')) {
            const id = parseInt(e.target.closest('.delete-certificate').getAttribute('data-id'));
            deleteCertificate(id);
        }
        if (e.target.closest('.edit-certificate')) {
            const id = parseInt(e.target.closest('.edit-certificate').getAttribute('data-id'));
            editCertificate(id);
        }
    });
}

function loadSettingsSection(container) {
    const settings = portfolioData.data.settings || {};
    const security = portfolioData.data.security || {};
    
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Account Settings</h2>
            </div>
            
            <div class="form-group">
                <label class="form-label">Username</label>
                <input type="text" class="form-control" value="admin" disabled>
            </div>
            
            <div class="form-group">
                <label class="form-label">Change Password</label>
                <input type="password" class="form-control" id="new-password" placeholder="Enter new password">
                <small style="color: #666; font-size: 0.8rem;">Minimum 6 characters</small>
            </div>
            
            <div class="form-group">
                <label class="form-label">Confirm Password</label>
                <input type="password" class="form-control" id="confirm-password" placeholder="Confirm new password">
            </div>

            <!-- SECURITY QUESTION SETTINGS -->
            <div class="security-settings" style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #eee;">
                <h3 style="margin-bottom: 1rem;">Security Questions</h3>
                <p style="color: #666; margin-bottom: 1.5rem; font-size: 0.9rem;">
                    Set up security questions for password recovery
                </p>
                
                <div class="form-group">
                    <label class="form-label">Security Question</label>
                    <select class="form-control" id="security-question-select">
                        <option value="pet" ${security.question === 'pet' ? 'selected' : ''}>What was the name of your first pet?</option>
                        <option value="city" ${security.question === 'city' ? 'selected' : ''}>What city were you born in?</option>
                        <option value="school" ${security.question === 'school' ? 'selected' : ''}>What was the name of your elementary school?</option>
                        <option value="custom" ${security.question === 'custom' ? 'selected' : ''}>Custom question...</option>
                    </select>
                </div>
                
                <div class="form-group" id="custom-question-group" style="${security.question === 'custom' ? '' : 'display: none;'}">
                    <label class="form-label">Custom Security Question</label>
                    <input type="text" class="form-control" id="custom-security-question" 
                           value="${security.customQuestion || ''}" 
                           placeholder="Enter your custom security question">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Security Answer</label>
                    <input type="text" class="form-control" id="security-answer" 
                           value="${security.answer || ''}" 
                           placeholder="Enter your security answer">
                    <small style="color: #666; font-size: 0.8rem;">This answer will be used for password recovery</small>
                </div>
                
                <div class="form-group">
                    <button type="button" class="btn btn-secondary" id="test-security-btn">
                        <i class="fas fa-check"></i> Test Security Question
                    </button>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">WhatsApp Number (for quick chat)</label>
                <input type="tel" class="form-control" id="whatsapp-number" 
                       value="${settings.whatsappNumber || ''}" 
                       placeholder="Enter your WhatsApp number with country code">
                <small style="color: #666; font-size: 0.8rem;">Format: +1234567890</small>
            </div>
            
            <div class="form-group">
                <label class="form-label">Features</label>
                <div>
                    <input type="checkbox" id="chatbot-enabled" ${settings.chatbotEnabled !== false ? 'checked' : ''}>
                    <label for="chatbot-enabled" style="margin-left: 5px;">Enable AI Chatbot</label>
                </div>
                <div>
                    <input type="checkbox" id="whatsapp-enabled" ${settings.whatsappEnabled !== false ? 'checked' : ''}>
                    <label for="whatsapp-enabled" style="margin-left: 5px;">Enable WhatsApp Quick Chat</label>
                </div>
            </div>
            
            <button class="btn" id="save-settings-btn">Save Settings</button>
        </div>
    `;
    
    // Add event listeners for security question settings
    const questionSelect = document.getElementById('security-question-select');
    const customQuestionGroup = document.getElementById('custom-question-group');
    
    questionSelect.addEventListener('change', function() {
        customQuestionGroup.style.display = this.value === 'custom' ? 'block' : 'none';
    });
    
    document.getElementById('test-security-btn').addEventListener('click', testSecurityQuestion);
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
}

// ✅ ADD THIS FUNCTION WITH OTHER LOAD FUNCTIONS
function loadRecruiterSettingsSection(container) {
    const settings = portfolioData.data.recruiterSettings || {};
    
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Recruiter Panel Settings</h2>
                <div class="section-actions">
                    <button class="btn" id="save-recruiter-settings-btn">Save Settings</button>
                </div>
            </div>
            
            <!-- Visibility Toggles -->
            <div class="form-group">
                <h3>Element Visibility</h3>
                <div class="toggle-grid">
                    <div class="toggle-item">
                        <input type="checkbox" id="show-skill-match" ${settings.showSkillMatch !== false ? 'checked' : ''}>
                        <label for="show-skill-match">Show Skill Match Analysis</label>
                    </div>
                    <div class="toggle-item">
                        <input type="checkbox" id="show-ats" ${settings.showATS !== false ? 'checked' : ''}>
                        <label for="show-ats">Show ATS Compatibility</label>
                    </div>
                    <div class="toggle-item">
                        <input type="checkbox" id="show-tags" ${settings.showTags !== false ? 'checked' : ''}>
                        <label for="show-tags">Show Candidate Tags</label>
                    </div>
                    <div class="toggle-item">
                        <input type="checkbox" id="show-assessments" ${settings.showAssessments !== false ? 'checked' : ''}>
                        <label for="show-assessments">Show Quick Assessment</label>
                    </div>
                    <div class="toggle-item">
                        <input type="checkbox" id="show-progress" ${settings.showProgressBars !== false ? 'checked' : ''}>
                        <label for="show-progress">Show Progress Bars</label>
                    </div>
                    <div class="toggle-item">
                        <input type="checkbox" id="show-timeline" ${settings.showTimeline !== false ? 'checked' : ''}>
                        <label for="show-timeline">Show Experience Timeline</label>
                    </div>
                </div>
            </div>
            
            <!-- Skill Match Customization -->
            <div class="form-group">
                <h3>Skill Match Percentages</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>Backend Development (%)</label>
                        <input type="number" class="form-control" id="backend-percent" 
                               value="${settings.customSkillPercentages?.backend || 90}" min="0" max="100">
                    </div>
                    <div class="form-group">
                        <label>Frontend Development (%)</label>
                        <input type="number" class="form-control" id="frontend-percent" 
                               value="${settings.customSkillPercentages?.frontend || 88}" min="0" max="100">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Database Management (%)</label>
                        <input type="number" class="form-control" id="database-percent" 
                               value="${settings.customSkillPercentages?.database || 85}" min="0" max="100">
                    </div>
                    <div class="form-group">
                        <label>DevOps & Cloud (%)</label>
                        <input type="number" class="form-control" id="devops-percent" 
                               value="${settings.customSkillPercentages?.devops || 75}" min="0" max="100">
                    </div>
                </div>
            </div>
            
            <!-- ATS Scores Customization -->
            <div class="form-group">
                <h3>ATS Compatibility Scores</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>Overall ATS Score (%)</label>
                        <input type="number" class="form-control" id="overall-ats" 
                               value="${settings.atsScores?.overall || 94}" min="0" max="100">
                    </div>
                    <div class="form-group">
                        <label>Keyword Score (%)</label>
                        <input type="number" class="form-control" id="keyword-ats" 
                               value="${settings.atsScores?.keywords || 92}" min="0" max="100">
                    </div>
                </div>
            </div>
            
            <!-- Candidate Tags Customization -->
            <div class="form-group">
                <h3>Candidate Tags</h3>
                <textarea class="form-control" id="custom-tags" rows="4" 
                          placeholder="Enter tags separated by commas">${settings.customTags ? settings.customTags.join(', ') : ''}</textarea>
                <small>Separate tags with commas</small>
            </div>
            
            <!-- Assessment Customization -->
            <div class="form-group">
                <h3>Quick Assessment Items</h3>
                <div class="form-group">
                    <label>Experience Level</label>
                    <input type="text" class="form-control" id="assessment-exp" 
                           value="${settings.assessments?.experience || 'Senior ✓ Meets Requirements'}">
                </div>
                <div class="form-group">
                    <label>Availability</label>
                    <input type="text" class="form-control" id="assessment-avail" 
                           value="${settings.assessments?.availability || 'Immediate ✓ Available Now'}">
                </div>
                <div class="form-group">
                    <label>Location Preference</label>
                    <input type="text" class="form-control" id="assessment-location" 
                           value="${settings.assessments?.location || 'Remote/Hybrid ✓ Flexible'}">
                </div>
                <div class="form-group">
                    <label>Communication</label>
                    <input type="text" class="form-control" id="assessment-comm" 
                           value="${settings.assessments?.communication || 'Excellent ✓ Professional'}">
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('save-recruiter-settings-btn').addEventListener('click', saveRecruiterSettings);
}

// ===== PROJECTS SECTION =====
function loadProjectsSection(container) {
    // Ensure projects array exists in data
    if (!portfolioData.data.projects) {
        portfolioData.data.projects = [];
    }
    
    const projects = portfolioData.data.projects;
    
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">Projects Management</h2>
                <div class="section-actions">
                    <button class="btn" id="add-project-btn">Add Project</button>
                </div>
            </div>
            
            <div class="projects-grid" id="projects-list">
                ${projects.length > 0 ? projects.map(project => `
                    <div class="project-card" data-id="${project.id}">
                        <div class="project-image">
                            <img src="${project.image || 'https://via.placeholder.com/300x200?text=Project+Image'}" alt="${project.title}">
                            <div class="project-overlay">
                                <button class="btn btn-secondary edit-project" data-id="${project.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-danger delete-project" data-id="${project.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="project-info">
                            <h3 class="project-title">${project.title}</h3>
                            <p class="project-description">${project.description || 'No description provided.'}</p>
                            <div class="project-technologies">
                                ${project.technologies ? project.technologies.map(tech => 
                                    `<span class="tech-tag">${tech}</span>`
                                ).join('') : ''}
                            </div>
                            <div class="project-links">
                                ${project.github ? `<a href="${project.github}" target="_blank" class="project-link"><i class="fab fa-github"></i> Code</a>` : ''}
                                ${project.live ? `<a href="${project.live}" target="_blank" class="project-link"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('') : '<p class="no-projects">No projects added yet. Click "Add Project" to get started.</p>'}
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('add-project-btn').addEventListener('click', () => showProjectModal());
    
    // Delegated event listeners for dynamic content
    container.addEventListener('click', (e) => {
        if (e.target.closest('.edit-project')) {
            const id = parseInt(e.target.closest('.edit-project').getAttribute('data-id'));
            editProject(id);
        }
        if (e.target.closest('.delete-project')) {
            const id = parseInt(e.target.closest('.delete-project').getAttribute('data-id'));
            deleteProject(id);
        }
    });
}

// ===== ABOUT SECTION =====
function loadAboutSection(container) {
    const profile = portfolioData.data.profile;
    
    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h2 class="section-title">About Me & Bio</h2>
                <div class="section-actions">
                    <button class="btn" id="save-about-btn">Save Changes</button>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Detailed Bio/About Me</label>
                <textarea class="form-control" id="about-bio" rows="8" placeholder="Write a detailed description about yourself, your passion, values, and what drives you...">${profile.bio || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Personal Mission Statement</label>
                <input type="text" class="form-control" id="about-mission" value="${profile.mission || ''}" placeholder="Your personal mission or tagline">
            </div>
            
            <div class="form-group">
                <label class="form-label">Interests & Hobbies</label>
                <textarea class="form-control" id="about-interests" rows="3" placeholder="Your interests, hobbies, and activities outside of work...">${profile.interests || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Career Goals</label>
                <textarea class="form-control" id="about-goals" rows="3" placeholder="Your short-term and long-term career goals...">${profile.goals || ''}</textarea>
            </div>
        </div>
    `;
    
    // Add event listener
    document.getElementById('save-about-btn').addEventListener('click', saveAbout);
}

// Profile Functions
async function saveProfile() {
    const profileData = {
        name: document.getElementById('personal-name').value,
        title: document.getElementById('personal-title').value,
        bio: document.getElementById('personal-bio').value,
        email: document.getElementById('personal-email').value,
        phone: document.getElementById('personal-phone').value,
        linkedin: document.getElementById('personal-linkedin').value,
        github: document.getElementById('personal-github').value,
        website: document.getElementById('personal-website').value
    };
    
    const success = await portfolioData.updateProfile(profileData);
    triggerHomepageUpdate(); 
    if (success) {
        // Update user info in header
        document.getElementById('user-avatar').textContent = profileData.name.split(' ').map(n => n[0]).join('').toUpperCase();
        document.getElementById('user-name').textContent = profileData.name;
        
        // Trigger homepage update - ADD THIS LINE
        triggerHomepageUpdate();
        showNotification('Profile updated successfully!', 'success');
    } else {
        showNotification('Error updating profile!', 'error');
    }
}

function previewProfile() {
    alert('This would open a preview of your portfolio in a new tab. In a real application, this would generate a public view of your portfolio.');
}

function handleProfilePicUpload(e) {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            portfolioData.updateProfile({ profileImage: event.target.result });
            alert('Profile picture updated!');
        };
        
        reader.readAsDataURL(file);
    }
}

// Experience Functions
function showExperienceModal(experience = null) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${experience ? 'Edit' : 'Add'} Experience</h3>
                <button class="modal-close">&times;</button>
            </div>
            
            <form id="experience-form">
                <div class="form-group">
                    <label class="form-label">Job Title</label>
                    <input type="text" class="form-control" id="exp-title" value="${experience ? experience.title : ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Company</label>
                    <input type="text" class="form-control" id="exp-company" value="${experience ? experience.company : ''}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Start Date</label>
                        <input type="month" class="form-control" id="exp-start-date" value="${experience ? experience.startDate : ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">End Date</label>
                        <input type="month" class="form-control" id="exp-end-date" value="${experience ? experience.endDate : ''}" ${experience && experience.current ? 'disabled' : ''}>
                    </div>
                </div>
                
                <div class="form-group">
                    <input type="checkbox" id="exp-current" ${experience && experience.current ? 'checked' : ''}>
                    <label for="exp-current" style="margin-left: 5px;">I currently work here</label>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" id="exp-description" rows="4">${experience ? experience.description : ''}</textarea>
                </div>
                
                <div class="form-group" style="text-align: right;">
                    <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                    <button type="submit" class="btn">${experience ? 'Update' : 'Save'} Experience</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Current job checkbox handler
    const currentCheckbox = document.getElementById('exp-current');
    currentCheckbox.addEventListener('change', function() {
        document.getElementById('exp-end-date').disabled = this.checked;
        if (this.checked) {
            document.getElementById('exp-end-date').value = '';
        }
    });
    
    // Form submission
    document.getElementById('experience-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const experienceData = {
            title: document.getElementById('exp-title').value,
            company: document.getElementById('exp-company').value,
            startDate: document.getElementById('exp-start-date').value,
            endDate: currentCheckbox.checked ? null : document.getElementById('exp-end-date').value,
            current: currentCheckbox.checked,
            description: document.getElementById('exp-description').value
        };
        
        if (experience) {
            portfolioData.updateExperience(experience.id, experienceData);
        } else {
            portfolioData.addExperience(experienceData);
        }
        triggerHomepageUpdate();
        
        modal.remove();
        loadExperienceSection(document.getElementById('experience-section'));
    });
    
    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function editExperience(id) {
    const experience = portfolioData.data.experience.find(exp => exp.id === id);
    if (experience) {
        showExperienceModal(experience);
    }
}

function deleteExperience(id) {
    if (confirm('Are you sure you want to delete this experience?')) {
        portfolioData.removeExperience(id);
        triggerHomepageUpdate();
        loadExperienceSection(document.getElementById('experience-section'));
    }
}

// Education Functions
function showEducationModal(education = null) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${education ? 'Edit' : 'Add'} Education</h3>
                <button class="modal-close">&times;</button>
            </div>
            
            <form id="education-form">
                <div class="form-group">
                    <label class="form-label">Degree</label>
                    <input type="text" class="form-control" id="edu-degree" value="${education ? education.degree : ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Institution</label>
                    <input type="text" class="form-control" id="edu-institution" value="${education ? education.institution : ''}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Start Date</label>
                        <input type="month" class="form-control" id="edu-start-date" value="${education ? education.startDate : ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">End Date</label>
                        <input type="month" class="form-control" id="edu-end-date" value="${education ? education.endDate : ''}" ${education && education.current ? 'disabled' : ''}>
                    </div>
                </div>
                
                <div class="form-group">
                    <input type="checkbox" id="edu-current" ${education && education.current ? 'checked' : ''}>
                    <label for="edu-current" style="margin-left: 5px;">I currently study here</label>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" id="edu-description" rows="4">${education ? education.description : ''}</textarea>
                </div>
                
                <div class="form-group" style="text-align: right;">
                    <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                    <button type="submit" class="btn">${education ? 'Update' : 'Save'} Education</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Current study checkbox handler
    const currentCheckbox = document.getElementById('edu-current');
    currentCheckbox.addEventListener('change', function() {
        document.getElementById('edu-end-date').disabled = this.checked;
        if (this.checked) {
            document.getElementById('edu-end-date').value = '';
        }
    });
    
    // Form submission
    document.getElementById('education-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const educationData = {
            degree: document.getElementById('edu-degree').value,
            institution: document.getElementById('edu-institution').value,
            startDate: document.getElementById('edu-start-date').value,
            endDate: currentCheckbox.checked ? null : document.getElementById('edu-end-date').value,
            current: currentCheckbox.checked,
            description: document.getElementById('edu-description').value
        };
        
        if (education) {
            portfolioData.updateEducation(education.id, educationData);
        } else {
            portfolioData.addEducation(educationData);
        }
        triggerHomepageUpdate();
        
        modal.remove();
        loadEducationSection(document.getElementById('education-section'));
    });
    
    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function editEducation(id) {
    const education = portfolioData.data.education.find(edu => edu.id === id);
    if (education) {
        showEducationModal(education);
    }
}

function deleteEducation(id) {
    if (confirm('Are you sure you want to delete this education?')) {
        portfolioData.removeEducation(id);
         triggerHomepageUpdate();
        loadEducationSection(document.getElementById('education-section'));
    }
}

// Skills Functions
async function addSkill() {
    const skillInput = document.getElementById('new-skill-input');
    const skill = skillInput.value.trim();
    
    if (skill) {
        const success = await portfolioData.addSkill(skill);
        if (success) {
            skillInput.value = '';
            loadSkillsSection(document.getElementById('skills-section'));
            // Trigger homepage update - ADD THIS LINE
            triggerHomepageUpdate();
            showNotification('Skill added successfully!', 'success');
        } else {
            showNotification('Error adding skill!', 'error');
        }
    } else {
        showNotification('Please enter a skill name', 'error');
    }
}

// ADD THIS NEW FUNCTION near other skill functions
async function removeSkill(skill) {
    if (confirm(`Are you sure you want to remove "${skill}"?`)) {
        const success = await portfolioData.removeSkill(skill);
        if (success) {
            loadSkillsSection(document.getElementById('skills-section'));
            showNotification('Skill removed successfully! Homepage updated.', 'success');
            triggerHomepageUpdate(); // ADD THIS LINE
        } else {
            showNotification('Error removing skill!', 'error');
        }
    }
}

// Certificates Functions
// Enhanced certificate file upload handler
function handleCertificateFileUpload(e) {
    if (e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        let processedCount = 0;
        
        files.forEach(file => {
            // Validate file type and size
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            const maxSize = 10 * 1024 * 1024; // 10MB
            
            if (!validTypes.includes(file.type)) {
                showNotification(`Invalid file type: ${file.name}. Please upload JPG, PNG, or PDF files.`, 'error');
                return;
            }
            
            if (file.size > maxSize) {
                showNotification(`File too large: ${file.name}. Maximum size is 10MB.`, 'error');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(event) {
                const newCert = {
                    name: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' '), // Remove extension and replace underscores/dashes with spaces
                    organization: 'Uploaded Certificate',
                    image: event.target.result,
                    fileType: file.type,
                    fileName: file.name,
                    uploadedAt: new Date().toISOString()
                };
                
                portfolioData.addCertificate(newCert).then(() => {
                    processedCount++;
                    if (processedCount === files.length) {
                        loadCertificatesSection(document.getElementById('certificates-section'));
                        showNotification(`Successfully uploaded ${files.length} certificate(s)`, 'success');
                    }
                });
            };
            
            reader.onerror = function() {
                showNotification(`Error reading file: ${file.name}`, 'error');
            };
            
            reader.readAsDataURL(file);
        });
        
        // Reset file input
        e.target.value = '';
    }
}

// Edit certificate function
function editCertificate(id) {
    const certificate = portfolioData.data.certificates.find(cert => cert.id === id);
    if (!certificate) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Edit Certificate</h3>
                <button class="modal-close">&times;</button>
            </div>
            
            <form id="certificate-edit-form">
                <div class="form-group">
                    <label class="form-label">Certificate Name</label>
                    <input type="text" class="form-control" id="cert-name" value="${certificate.name}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Issuing Organization</label>
                    <input type="text" class="form-control" id="cert-organization" value="${certificate.organization}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Certificate Image</label>
                    <div class="current-image-preview">
                        ${certificate.image ? 
                            `<img src="${certificate.image}" alt="Current certificate" style="max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px;">` :
                            '<p>No image available</p>'
                        }
                    </div>
                    <input type="file" class="form-control" id="cert-image-input" accept="image/*">
                    <small>Upload a new image to replace the current one</small>
                </div>
                
                <div class="form-group" style="text-align: right;">
                    <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                    <button type="submit" class="btn">Update Certificate</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    let newImageData = certificate.image;
    
    document.getElementById('cert-image-input').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(event) {
                newImageData = event.target.result;
                const preview = modal.querySelector('.current-image-preview');
                preview.innerHTML = `<img src="${newImageData}" alt="New certificate image" style="max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px;">`;
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('certificate-edit-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const updatedCert = {
            name: document.getElementById('cert-name').value,
            organization: document.getElementById('cert-organization').value,
            image: newImageData
        };
        
        portfolioData.updateCertificate(id, updatedCert).then(success => {
            if (success) {
                triggerHomepageUpdate();
                modal.remove();
                loadCertificatesSection(document.getElementById('certificates-section'));
                showNotification('Certificate updated successfully!', 'success');
            }
        });
    });
    
    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Delete certificate function
function deleteCertificate(id) {
    if (confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
        portfolioData.removeCertificate(id).then(success => {
            if (success) {
                triggerHomepageUpdate();
                loadCertificatesSection(document.getElementById('certificates-section'));
                showNotification('Certificate deleted successfully!', 'success');
            }
        });
    }
}

// ===== PASSWORD AND SECURITY FUNCTIONS =====

// Password strength validation
function validatePasswordStrength(password) {
    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters' };
    }
    return { valid: true, message: 'Password is strong enough' };
}

// Password update function for dashboard
function updateAdminPassword(newPassword) {
    if (newPassword && newPassword.length >= 6) {
        // Enhanced password validation
        const validation = validatePasswordStrength(newPassword);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }
        
        // Store the new password in localStorage for authentication
        localStorage.setItem('adminPassword', newPassword);
        
        // Reset login attempts on password change
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lastLoginAttempt');
        localStorage.removeItem('accountLockedUntil');
        
        console.log('Password updated successfully in localStorage');
        return { success: true, message: 'Password updated successfully!' };
    }
    return { success: false, message: 'Password must be at least 6 characters long' };
}

// Settings Functions - FIXED PASSWORD UPDATE
function saveSettings() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const whatsappNumber = document.getElementById('whatsapp-number').value;
    const chatbotEnabled = document.getElementById('chatbot-enabled').checked;
    const whatsappEnabled = document.getElementById('whatsapp-enabled').checked;
    
    // Security settings
    const securityQuestion = document.getElementById('security-question-select').value;
    const customQuestion = document.getElementById('custom-security-question').value;
    const securityAnswer = document.getElementById('security-answer').value;
    
    // Validate passwords if provided
    if (newPassword) {
        const validation = validatePasswordStrength(newPassword);
        if (!validation.valid) {
            alert('Password error: ' + validation.message);
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        // Use the updateAdminPassword function
        const result = updateAdminPassword(newPassword);
        if (result.success) {
            alert(result.message);
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        } else {
            alert(result.message);
            return;
        }
    }
    
    // Save settings to portfolio data
    const settingsUpdate = {
        whatsappNumber,
        chatbotEnabled,
        whatsappEnabled
    };
    
    // Save security settings
    const securityUpdate = {
        question: securityQuestion,
        customQuestion: securityQuestion === 'custom' ? customQuestion : '',
        answer: securityAnswer
    };
    
    // Update both settings and security data
    portfolioData.updateSettings(settingsUpdate);
    portfolioData.data.security = { ...portfolioData.data.security, ...securityUpdate };
    
    // Save all changes
    portfolioData.saveData().then(success => {
        if (success) {
            alert('Settings saved successfully!');
        } else {
            alert('Error saving settings!');
        }
    });
}

// ===== SECURITY QUESTION TEST FUNCTION =====
function testSecurityQuestion() {
    const securityAnswer = document.getElementById('security-answer').value;
    
    if (!securityAnswer) {
        alert('Please set a security answer first.');
        return;
    }
    
    // Show a test modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Test Security Question</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>Please answer your security question to test it:</p>
                <div class="form-group">
                    <label class="form-label">Security Answer</label>
                    <input type="text" class="form-control" id="test-security-answer" placeholder="Enter your security answer">
                </div>
                <div id="test-result" style="display: none; margin-top: 1rem; padding: 10px; border-radius: 4px;"></div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary modal-close">Cancel</button>
                <button class="btn btn-primary" id="verify-security-answer">Verify Answer</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    document.getElementById('verify-security-answer').addEventListener('click', function() {
        const testAnswer = document.getElementById('test-security-answer').value;
        const resultDiv = document.getElementById('test-result');
        
        if (testAnswer === securityAnswer) {
            resultDiv.innerHTML = '<div style="color: #2ecc71; background: #f0f9f0; padding: 10px; border-radius: 4px;"><i class="fas fa-check"></i> Security answer is correct!</div>';
            resultDiv.style.display = 'block';
        } else {
            resultDiv.innerHTML = '<div style="color: #e74c3c; background: #fdf2f2; padding: 10px; border-radius: 4px;"><i class="fas fa-times"></i> Security answer is incorrect!</div>';
            resultDiv.style.display = 'block';
        }
    });
    
    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// ===== PROJECT MODAL =====
function showProjectModal(project = null) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${project ? 'Edit' : 'Add'} Project</h3>
                <button class="modal-close">&times;</button>
            </div>
            
            <form id="project-form">
                <div class="form-group">
                    <label class="form-label">Project Title</label>
                    <input type="text" class="form-control" id="project-title" value="${project ? project.title : ''}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Project Description</label>
                    <textarea class="form-control" id="project-description" rows="4" required>${project ? project.description : ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Project Image</label>
                    <div class="upload-area" id="project-image-upload">
                        <div class="upload-icon">
                            <i class="fas fa-cloud-upload-alt"></i>
                        </div>
                        <p class="upload-text">Drag & drop project image here or click to browse</p>
                        <button type="button" class="btn" id="browse-project-image">Browse Files</button>
                        <input type="file" class="file-input" id="project-image-input" accept="image/*">
                    </div>
                    ${project && project.image ? `<div class="current-image">
                        <img src="${project.image}" alt="Current project image" style="max-width: 200px; margin-top: 10px;">
                    </div>` : ''}
                </div>
                
                <div class="form-group">
                    <label class="form-label">Technologies Used (comma separated)</label>
                    <input type="text" class="form-control" id="project-technologies" value="${project ? (project.technologies ? project.technologies.join(', ') : '') : ''}" placeholder="React, Node.js, MongoDB, etc.">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">GitHub Repository URL</label>
                        <input type="url" class="form-control" id="project-github" value="${project ? project.github : ''}" placeholder="https://github.com/username/repo">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Live Demo URL</label>
                        <input type="url" class="form-control" id="project-live" value="${project ? project.live : ''}" placeholder="https://your-project.com">
                    </div>
                </div>
                
                <div class="form-group">
                    <input type="checkbox" id="project-featured" ${project && project.featured ? 'checked' : ''}>
                    <label for="project-featured" style="margin-left: 5px;">Feature this project</label>
                </div>
                
                <div class="form-group" style="text-align: right;">
                    <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                    <button type="submit" class="btn">${project ? 'Update' : 'Save'} Project</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // File upload handler
    document.getElementById('browse-project-image').addEventListener('click', () => {
        document.getElementById('project-image-input').click();
    });
    
    let projectImageData = project ? project.image : null;
    
    document.getElementById('project-image-input').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(event) {
                projectImageData = event.target.result;
                // Show preview
                const currentImageDiv = modal.querySelector('.current-image');
                if (currentImageDiv) {
                    currentImageDiv.innerHTML = `<img src="${projectImageData}" alt="Project image preview" style="max-width: 200px; margin-top: 10px;">`;
                } else {
                    const uploadArea = document.getElementById('project-image-upload');
                    uploadArea.insertAdjacentHTML('afterend', `<div class="current-image"><img src="${projectImageData}" alt="Project image preview" style="max-width: 200px; margin-top: 10px;"></div>`);
                }
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Form submission
    document.getElementById('project-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const projectData = {
            title: document.getElementById('project-title').value,
            description: document.getElementById('project-description').value,
            image: projectImageData,
            technologies: document.getElementById('project-technologies').value.split(',').map(tech => tech.trim()).filter(tech => tech),
            github: document.getElementById('project-github').value,
            live: document.getElementById('project-live').value,
            featured: document.getElementById('project-featured').checked
        };
        
        if (project) {
            portfolioData.updateProject(project.id, projectData);
        } else {
            portfolioData.addProject(projectData);
        }
        triggerHomepageUpdate();
        
        modal.remove();
        loadProjectsSection(document.getElementById('projects-section'));
    });
    
    // Close modal
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// ===== PROJECT CRUD FUNCTIONS =====
function editProject(id) {
    const project = portfolioData.data.projects.find(proj => proj.id === id);
    if (project) {
        showProjectModal(project);
    }
}

function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        portfolioData.removeProject(id);
        loadProjectsSection(document.getElementById('projects-section'));
    }
}

// ===== ABOUT FUNCTIONS =====
function saveAbout() {
    const aboutData = {
        bio: document.getElementById('about-bio').value,
        mission: document.getElementById('about-mission').value,
        interests: document.getElementById('about-interests').value,
        goals: document.getElementById('about-goals').value
    };
    
    // Update profile with about data
    portfolioData.updateProfile(aboutData);
    alert('About information saved successfully!');
}

// ✅ ADD THIS FUNCTION WITH OTHER SAVE FUNCTIONS
function saveRecruiterSettings() {
    const settings = {
        showSkillMatch: document.getElementById('show-skill-match').checked,
        showATS: document.getElementById('show-ats').checked,
        showTags: document.getElementById('show-tags').checked,
        showAssessments: document.getElementById('show-assessments').checked,
        showProgressBars: document.getElementById('show-progress').checked,
        showTimeline: document.getElementById('show-timeline').checked,
        
        customSkillPercentages: {
            backend: parseInt(document.getElementById('backend-percent').value) || 90,
            frontend: parseInt(document.getElementById('frontend-percent').value) || 88,
            database: parseInt(document.getElementById('database-percent').value) || 85,
            devops: parseInt(document.getElementById('devops-percent').value) || 75
        },
        
        atsScores: {
            overall: parseInt(document.getElementById('overall-ats').value) || 94,
            keywords: parseInt(document.getElementById('keyword-ats').value) || 92
        },
        
        customTags: document.getElementById('custom-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
        
        assessments: {
            experience: document.getElementById('assessment-exp').value,
            availability: document.getElementById('assessment-avail').value,
            location: document.getElementById('assessment-location').value,
            communication: document.getElementById('assessment-comm').value
        }
    };
    
    portfolioData.data.recruiterSettings = settings;
    portfolioData.saveData().then(success => {
        if (success) {
            showNotification('Recruiter settings saved successfully!', 'success');
            triggerHomepageUpdate();
        } else {
            showNotification('Error saving recruiter settings!', 'error');
        }
    });
}

// Utility Functions
function formatDateRange(startDate, endDate, current) {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    const startFormatted = start.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    
    if (current) {
        return `${startFormatted} - Present`;
    } else if (endDate) {
        const end = new Date(endDate);
        const endFormatted = end.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        return `${startFormatted} - ${endFormatted}`;
    } else {
        return startFormatted;
    }
}

// Enhanced file upload handler with progress indication
async function handleFileUpload(type, files) {
    const validTypes = {
        'certificate': ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
        'project': ['image/jpeg', 'image/png', 'image/jpg', 'application/zip'],
        'resume': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };
    
    const maxSizes = {
        'certificate': 10 * 1024 * 1024, // 10MB
        'project': 50 * 1024 * 1024,     // 50MB
        'resume': 5 * 1024 * 1024        // 5MB
    };

    for (let file of files) {
        // Validate file type
        if (validTypes[type] && !validTypes[type].includes(file.type)) {
            alert(`Invalid file type for ${type}. Supported: ${validTypes[type].join(', ')}`);
            continue;
        }
        
        // Validate file size
        if (maxSizes[type] && file.size > maxSizes[type]) {
            alert(`File too large for ${type}. Max size: ${maxSizes[type] / (1024 * 1024)}MB`);
            continue;
        }
        
        // Show upload progress
        showUploadProgress(file.name);
        
        try {
            // PERSONALIZE: Replace with your actual upload endpoint
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            
            const response = await fetch('/api/upload-file', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                switch(type) {
                    case 'certificate':
                        await handleCertificateServerUpload(result);
                        break;
                    case 'project':
                        await handleProjectServerUpload(result);
                        break;
                    case 'resume':
                        await handleResumeServerUpload(result);
                        break;
                    default:
                        console.log('File uploaded:', result);
                }
                
                hideUploadProgress();
                showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`, 'success');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            hideUploadProgress();
            showNotification(`Upload failed: ${error.message}`, 'error');
        }
    }
}

// Server-side certificate handling
async function handleCertificateServerUpload(uploadResult) {
    const newCert = {
        name: uploadResult.filename.replace(/_/g, ' ').split('.')[0],
        organization: 'Uploaded Certificate',
        image: uploadResult.filepath
    };
    
    await portfolioData.addCertificate(newCert);
    
    // Reload certificates section if open
    const certSection = document.getElementById('certificates-section');
    if (certSection && certSection.style.display !== 'none') {
        loadCertificatesSection(certSection);
    }
}

// Server-side project handling  
async function handleProjectServerUpload(uploadResult) {
    const newProject = {
        title: uploadResult.filename.replace(/_/g, ' ').split('.')[0],
        description: 'Uploaded project - customize this description',
        image: uploadResult.filepath,
        technologies: ['Customize', 'Technologies'],
        github: '#',
        live: '#',
        featured: false
    };
    
    await portfolioData.addProject(newProject);
    showNotification('Project file uploaded. Update project details in projects section.', 'info');
}

// Server-side resume handling
async function handleResumeServerUpload(uploadResult) {
    // Update resume stats
    portfolioData.data.stats.resumes += 1;
    await portfolioData.saveData();
    showNotification('Resume uploaded successfully!', 'success');
}

// UI Functions for upload progress
function showUploadProgress(filename) {
    const progressHTML = `
        <div class="upload-progress" id="upload-progress">
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-text">Uploading ${filename}...</div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', progressHTML);
}

function hideUploadProgress() {
    const progress = document.getElementById('upload-progress');
    if (progress) {
        progress.remove();
    }
}

// Notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// Initialize upload functionality when dashboard loads
function initUploadFunctionality() {
    const certificateInput = document.getElementById('certificate-input');
    if (certificateInput) {
        certificateInput.addEventListener('change', handleCertificateFileUpload);
    }
    
    // PERSONALIZE: Add other upload types as needed
    const resumeUpload = document.getElementById('resume-upload');
    if (resumeUpload) {
        resumeUpload.addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                await handleFileUpload('resume', e.target.files);
                e.target.value = '';
            }
        });
    }
}

function loadResumeSection(container) {
    // Let the resume manager handle the resume section completely
    if (window.resumeManager) {
        window.resumeManager.updateResumeSection();
    } else {
        // Initialize resume manager if not already done
        setTimeout(() => {
            if (!window.resumeManager) {
                window.resumeManager = new ResumeManager();
            }
            window.resumeManager.updateResumeSection();
        }, 100);
    }

    // Add event listeners for resume section
    const uploadBtn = document.getElementById('upload-resume-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            document.getElementById('upload-resume-modal').style.display = 'flex';
        });
    }

    // Add event listeners for resume section
    document.getElementById('upload-new-resume-btn').addEventListener('click', () => {
        document.getElementById('upload-resume-modal').style.display = 'flex';
    });
}

// ✅ ADD UTILITY FUNCTIONS HERE (at the bottom of the file)

// Utility function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Enhanced file validation
function validateFile(file, allowedTypes, maxSize) {
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, message: `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}` };
    }
    if (file.size > maxSize) {
        return { valid: false, message: `File too large: ${formatFileSize(file.size)}. Maximum: ${formatFileSize(maxSize)}` };
    }
    return { valid: true, message: 'File is valid' };
}

// Reset resume upload form
function resetResumeUploadForm() {
    const resumeFileInput = document.getElementById('resume-file');
    const fileInfo = document.getElementById('file-info');
    const confirmUploadBtn = document.getElementById('confirm-upload-btn');
    
    if (resumeFileInput) resumeFileInput.value = '';
    if (fileInfo) fileInfo.style.display = 'none';
    if (confirmUploadBtn) confirmUploadBtn.disabled = true;
}

// Handle resume upload
function handleResumeUpload() {
    const fileInput = document.getElementById('resume-file');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const uploadProgress = document.getElementById('upload-progress');
    
    if (!fileInput.files.length) {
        alert('Please select a file first.');
        return;
    }
    
    const file = fileInput.files[0];
    
    // Show progress
    uploadProgress.style.display = 'block';
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        progressFill.style.width = progress + '%';
        progressText.textContent = `Uploading... ${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            
            // Simulate successful upload
            setTimeout(() => {
                uploadProgress.style.display = 'none';
                document.getElementById('upload-resume-modal').style.display = 'none';
                resetResumeUploadForm();
                
                // Update resume stats
                portfolioData.incrementResumeCount();
                
                showNotification('Resume uploaded successfully!', 'success');
                
                // Update the resume section if it's currently visible
                const resumeSection = document.getElementById('resume-section');
                if (resumeSection && resumeSection.style.display !== 'none') {
                    loadResumeSection(resumeSection);
                }
            }, 500);
        }
    }, 100);
}

// ✅ ADD THIS FUNCTION AT THE VERY END OF dashboard.js
function triggerHomepageUpdate() {
    // Update localStorage to trigger storage event
    const currentData = JSON.stringify(portfolioData.data);
    localStorage.setItem('portfolioData', currentData);
    
    // Also trigger a custom event for real-time updates
    const event = new CustomEvent('portfolioDataUpdated', { 
        detail: { data: portfolioData.data } 
    });
    window.dispatchEvent(event);
    
    console.log('Homepage update triggered');
    
    // Show instruction for manual refresh if needed
    setTimeout(() => {
        showNotification('Changes saved! Homepage should update automatically. If not, refresh the homepage.', 'info');
    }, 1000);
}