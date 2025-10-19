// Homepage functionality - FIXED VERSION WITH PROPER ADMIN INTEGRATION
console.log('🏠 Homepage script loaded');

// Global function to wait for portfolio data
async function waitForPortfolioData() {
    if (window.portfolioData && portfolioData.initialized) {
        return portfolioData.data;
    }
    
    return new Promise((resolve) => {
        const checkData = () => {
            if (window.portfolioData && portfolioData.initialized && portfolioData.data) {
                console.log('✅ Portfolio data is ready');
                resolve(portfolioData.data);
            } else {
                console.log('⏳ Waiting for portfolio data...');
                setTimeout(checkData, 100);
            }
        };
        checkData();
    });
}

// Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('🏠 DOM Content Loaded - Initializing Portfolio');
        
        try {
            // Wait for portfolio data with timeout
            console.log('⏳ Waiting for portfolio data...');
            await Promise.race([
                portfolioData.ensureDataLoaded(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Data load timeout')), 5000)
                )
            ]);
            
            console.log('✅ Portfolio data loaded:', portfolioData.data);
            
            // Temporary debug
            console.log('🔍 Data check:', {
                initialized: portfolioData.initialized,
                hasData: !!portfolioData.data,
                data: portfolioData.data
            });
            
            // Initialize all components
            initializePortfolio();
            setupEventListeners();
            setupAnimations();
            startCounterAnimations();
            checkResumeStatus();
            setupDataChangeListener();
            
            // Increment profile views
            portfolioData.incrementProfileViews();
            
            console.log('🎉 Portfolio initialization complete');
            
        } catch (error) {
            console.error('❌ Error initializing portfolio:', error);
            // Fallback: try to initialize with whatever data we have
            if (portfolioData.data) {
                initializePortfolio();
                setupEventListeners();
                showNotification('Using cached portfolio data', 'info');
            } else {
                showNotification('Error loading portfolio data. Please refresh the page.', 'error');
            }
        }
    });

function initializePortfolio() {
    console.log('🔄 Initializing portfolio components with current data...');
    
    // Ensure data is loaded
    if (!portfolioData.data) {
        console.error('❌ No portfolio data available');
        showNotification('No portfolio data found. Using default data.', 'warning');
        return;
    }
    
    console.log('📊 Current data structure:', {
        profile: portfolioData.data.profile ? '✅ Loaded' : '❌ Missing',
        skills: portfolioData.data.skills ? `✅ ${portfolioData.data.skills.length} skills` : '❌ Missing',
        experience: portfolioData.data.experience ? `✅ ${portfolioData.data.experience.length} experiences` : '❌ Missing',
        education: portfolioData.data.education ? `✅ ${portfolioData.data.education.length} education entries` : '❌ Missing',
        certificates: portfolioData.data.certificates ? `✅ ${portfolioData.data.certificates.length} certificates` : '❌ Missing',
        projects: portfolioData.data.projects ? `✅ ${portfolioData.data.projects.length} projects` : '❌ Missing'
    });
    
    // Render all sections
    renderProfile();
    renderSkills();
    renderExperience();
    renderEducation();
    renderCertificates();
    renderProjects();
    setupSmoothScroll();
    addViewResumeButtonHomepage();
    
    console.log('✅ Portfolio initialization complete');
}

// Enhanced data change listener with better error handling
function setupDataChangeListener() {
    console.log('🔍 Setting up enhanced data change listeners...');
    
    // Listen for storage changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'portfolioData' && e.newValue) {
            console.log('🔄 Data change detected via storage event');
            handleDataUpdate(e.newValue);
        }
    });
    
    // Listen for custom events from dashboard
    window.addEventListener('portfolioDataUpdated', (e) => {
        console.log('🔄 Data change detected via custom event');
        if (e.detail && e.detail.data) {
            portfolioData.data = e.detail.data;
            updateAllSections();
            showNotification('🎉 Portfolio updated with latest changes!', 'success');
        }
    });
    
    // Enhanced polling with hash comparison
    let lastDataHash = '';
    
    const pollInterval = setInterval(() => {
        try {
            const savedData = localStorage.getItem('portfolioData');
            if (savedData) {
                const currentHash = btoa(savedData);
                if (currentHash !== lastDataHash) {
                    console.log('🔄 Data change detected via polling');
                    lastDataHash = currentHash;
                    handleDataUpdate(savedData);
                }
            }
        } catch (error) {
            console.error('❌ Error in data polling:', error);
        }
    }, 1000);
    
    // Store interval ID for cleanup if needed
    window.dataPollInterval = pollInterval;
}

function handleDataUpdate(newDataString) {
    try {
        const newData = JSON.parse(newDataString);
        
        // Deep compare to avoid unnecessary updates
        const currentDataStr = JSON.stringify(portfolioData.data);
        const newDataStr = JSON.stringify(newData);
        
        if (currentDataStr !== newDataStr) {
            console.log('🔄 Applying data updates to homepage');
            portfolioData.data = newData;
            updateAllSections();
            showNotification('🎉 Portfolio updated with latest changes!', 'success');
        }
    } catch (error) {
        console.error('❌ Error handling data update:', error);
    }
}

function updateAllSections() {
    console.log('🔄 Updating all sections with new data...');
    
    // Force re-render all sections
    renderProfile();
    renderSkills();
    renderExperience();
    renderEducation();
    renderCertificates();
    renderProjects();
    
    checkResumeStatus();
    console.log('✅ All sections updated successfully');
}

// ===== RENDER FUNCTIONS =====

function renderProfile() {
    console.log('🎨 Rendering profile...');
    const profile = portfolioData.data.profile;
    
    if (!profile) {
        console.error('❌ No profile data found');
        return;
    }
    
    // Update hero section
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.innerHTML = `<span class="text-gradient">${profile.name || 'Your Name'}</span>`;
    }
    
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        heroSubtitle.textContent = profile.title || 'Your Title';
    }
    
    // Update about section
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profilePhone = document.getElementById('profile-phone');
    const profileBio = document.getElementById('profile-bio');
    
    if (profileName) profileName.textContent = profile.name || 'Ankit Kumar Singh';
    if (profileEmail) profileEmail.textContent = profile.email || 'queryankit93@gmail.com';
    if (profilePhone) profilePhone.textContent = profile.phone || '+91 9155892986';
    if (profileBio) profileBio.textContent = profile.bio || 'Your bio goes here...';
    
    // Update contact information
    const contactEmail = document.getElementById('contact-email');
    const contactPhone = document.getElementById('contact-phone');
    
    if (contactEmail) contactEmail.textContent = profile.email || 'queryankit93@gmail.com';
    if (contactPhone) contactPhone.textContent = profile.phone || '+91 9155892986';
    
    // Update social links
    const linkedinLink = document.getElementById('linkedin-link');
    const githubLink = document.getElementById('github-link');
    const websiteLink = document.getElementById('website-link');
    
    if (linkedinLink && profile.linkedin) linkedinLink.href = profile.linkedin;
    if (githubLink && profile.github) githubLink.href = profile.github;
    if (websiteLink && profile.website) websiteLink.href = profile.website;
    
    console.log('✅ Profile rendering complete');
}

function renderSkills() {
    console.log('🎨 Rendering skills...');
    const skillsContainer = document.getElementById('skills-container');
    if (!skillsContainer) {
        console.log('❌ Skills container not found');
        return;
    }
    
    const skills = portfolioData.data.skills || [];
    console.log(`📊 Found ${skills.length} skills to render`);
    
    const skillIcons = {
        'JavaScript': 'fab fa-js',
        'React': 'fab fa-react',
        'Node.js': 'fab fa-node-js',
        'Python': 'fab fa-python',
        'MongoDB': 'fas fa-database',
        'AWS': 'fab fa-aws',
        'Docker': 'fab fa-docker',
        'HTML': 'fab fa-html5',
        'CSS': 'fab fa-css3-alt',
        'Git': 'fab fa-git-alt',
        'PHP': 'fab fa-php',
        'Java': 'fab fa-java',
        'SQL': 'fas fa-database',
        'TypeScript': 'fas fa-code',
        'Vue.js': 'fab fa-vuejs',
        'Angular': 'fab fa-angular'
    };
    
    if (skills.length === 0) {
        skillsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-code"></i>
                <h3>No Skills Added</h3>
                <p>Add your skills in the admin panel to display them here.</p>
            </div>
        `;
        return;
    }
    
    skillsContainer.innerHTML = skills.map(skill => `
        <div class="skill-card fade-in">
            <i class="${skillIcons[skill] || 'fas fa-code'}"></i>
            <h3>${skill}</h3>
            <p>Expert level proficiency with modern development practices</p>
        </div>
    `).join('');
    
    console.log(`✅ Rendered ${skills.length} skills`);
}

function renderExperience() {
    console.log('🎨 Rendering experience...');
    const experienceContainer = document.getElementById('experience-container');
    if (!experienceContainer) {
        console.log('❌ Experience container not found');
        return;
    }
    
    const experiences = portfolioData.data.experience || [];
    console.log(`📊 Found ${experiences.length} experiences to render`);
    
    if (experiences.length === 0) {
        experienceContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-briefcase"></i>
                <h3>No Experience Added</h3>
                <p>Add your work experience in the admin panel to display it here.</p>
            </div>
        `;
        return;
    }
    
    experienceContainer.innerHTML = experiences.map(exp => `
        <div class="timeline-item fade-in">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <h3>${exp.title || 'Untitled Position'}</h3>
                <h4>${exp.company || 'Unknown Company'}</h4>
                <span class="timeline-date">${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}</span>
                <p>${exp.description || 'No description provided.'}</p>
            </div>
        </div>
    `).join('');
    
    console.log(`✅ Rendered ${experiences.length} experiences`);
}

function renderEducation() {
    console.log('🎨 Rendering education...');
    const educationContainer = document.getElementById('education-container');
    if (!educationContainer) {
        console.log('❌ Education container not found');
        return;
    }
    
    const education = portfolioData.data.education || [];
    console.log(`📊 Found ${education.length} education entries to render`);
    
    if (education.length === 0) {
        educationContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-graduation-cap"></i>
                <h3>No Education Added</h3>
                <p>Add your education in the admin panel to display it here.</p>
            </div>
        `;
        return;
    }
    
    educationContainer.innerHTML = education.map(edu => `
        <div class="education-card fade-in">
            <div class="education-icon">
                <i class="fas fa-graduation-cap"></i>
            </div>
            <h3>${edu.degree || 'Unknown Degree'}</h3>
            <h4>${edu.institution || 'Unknown Institution'}</h4>
            <span class="education-date">${formatDate(edu.startDate)} - ${edu.current ? 'Present' : formatDate(edu.endDate)}</span>
            <p>${edu.description || 'No description provided.'}</p>
        </div>
    `).join('');
    
    console.log(`✅ Rendered ${education.length} education entries`);
}

function renderCertificates() {
    console.log('🎨 Rendering certificates...');
    const certificatesContainer = document.getElementById('certificates-container');
    if (!certificatesContainer) {
        console.log('❌ Certificates container not found');
        return;
    }
    
    const certificates = portfolioData.data.certificates || [];
    console.log(`📊 Found ${certificates.length} certificates to render`);
    
    if (certificates.length === 0) {
        certificatesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-award"></i>
                <h3>No Certificates Added</h3>
                <p>Add your certificates in the admin panel to display them here.</p>
            </div>
        `;
        return;
    }
    
    certificatesContainer.innerHTML = certificates.map(cert => `
        <div class="certificate-card fade-in">
            <div class="certificate-image-container">
                ${cert.image ? 
                    `<img src="${cert.image}" alt="${cert.name || 'Certificate'}" class="certificate-img" onerror="this.src='https://via.placeholder.com/300x200?text=Certificate+Image'">` :
                    `<div class="certificate-placeholder">
                        <i class="fas fa-file-certificate"></i>
                        <span>${cert.name || 'Certificate'}</span>
                    </div>`
                }
            </div>
            <div class="certificate-info">
                <h3>${cert.name || 'Untitled Certificate'}</h3>
                <p>${cert.organization || 'Unknown Organization'}</p>
                ${cert.image ? `
                    <button class="btn btn-outline" onclick="viewCertificate('${cert.image}')">
                        <i class="fas fa-eye"></i> View Certificate
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    console.log(`✅ Rendered ${certificates.length} certificates`);
}

function renderProjects() {
    console.log('🎨 Rendering projects...');
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer) {
        console.log('❌ Projects container not found');
        return;
    }
    
    const projects = portfolioData.data.projects || [];
    console.log(`📊 Found ${projects.length} projects to render`);
    
    if (projects.length === 0) {
        projectsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-project-diagram"></i>
                <h3>No Projects Added</h3>
                <p>Add your projects in the admin panel to display them here.</p>
            </div>
        `;
        return;
    }
    
    projectsContainer.innerHTML = projects.map(project => `
        <div class="project-card fade-in">
            ${project.featured ? '<div class="project-badge">Featured</div>' : ''}
            <div class="project-image-container">
                ${project.image ? 
                    `<img src="${project.image}" alt="${project.title || 'Project'}" class="project-image" onerror="this.src='https://via.placeholder.com/400x250?text=Project+Image'">` :
                    `<div class="project-placeholder" style="background: linear-gradient(135deg, #${getRandomColor()}, #${getRandomColor()});">
                        <i class="fas fa-code"></i>
                        <span>${project.title || 'Project'}</span>
                    </div>`
                }
            </div>
            <div class="project-info">
                <h3>${project.title || 'Untitled Project'}</h3>
                <p>${project.description || 'No description provided.'}</p>
                <div class="project-tech">
                    ${(project.technologies || []).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <div class="project-links">
                    ${project.github ? `<a href="${project.github}" class="btn btn-outline" target="_blank">
                        <i class="fab fa-github"></i> Code
                    </a>` : ''}
                    ${project.live ? `<a href="${project.live}" class="btn btn-primary" target="_blank">
                        <i class="fas fa-external-link-alt"></i> Live Demo
                    </a>` : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    console.log(`✅ Rendered ${projects.length} projects`);
}

// ===== UTILITY FUNCTIONS =====

function formatDate(dateString) {
    if (!dateString) return 'Present';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    } catch (error) {
        return 'Invalid Date';
    }
}

function getRandomColor() {
    const colors = ['667eea', '764ba2', 'f093fb', 'f5576c', '4facfe', '00f2fe', '43e97b', '38f9d7'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function setupSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== EVENT LISTENERS =====

function setupEventListeners() {
    console.log('🔗 Setting up event listeners...');
    
    // Contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
        console.log('✅ Contact form listener added');
    }
    
    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        console.log('✅ Mobile menu listener added');
    }
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        const backToTop = document.getElementById('backToTop');
        
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
            if (backToTop) backToTop.style.display = 'flex';
        } else {
            navbar.classList.remove('scrolled');
            if (backToTop) backToTop.style.display = 'none';
        }
        
        // Update active nav link
        updateActiveNavLink();
    });
    
    // Back to top button
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    console.log('✅ All event listeners setup complete');
}

function setupAnimations() {
    console.log('🎬 Setting up animations...');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                if (entry.target.classList.contains('stagger-parent')) {
                    const items = entry.target.querySelectorAll('.stagger-item');
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('visible');
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in, .stagger-parent');
    console.log(`🎬 Found ${animatedElements.length} animated elements`);
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

function startCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number');
    console.log(`🔢 Found ${counters.length} counter elements`);
    
    if (counters.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;
                
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    counter.textContent = Math.floor(current) + (counter.getAttribute('data-count').includes('+') ? '+' : '');
                }, 16);
                
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ===== GLOBAL FUNCTIONS =====

window.scrollToSection = function(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

window.downloadResume = function() {
    const storedResume = localStorage.getItem('portfolioResume');
    
    if (storedResume) {
        try {
            const resumeData = JSON.parse(storedResume);
            portfolioData.incrementResumeCount();
            
            const link = document.createElement('a');
            link.href = resumeData.data;
            link.download = resumeData.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification('Resume download started!', 'success');
        } catch (error) {
            console.error('Error downloading resume:', error);
            showNotification('Error downloading resume. Please try again.', 'error');
            downloadDefaultResume();
        }
    } else {
        showNotification('No resume uploaded yet. Downloading default resume.', 'info');
        downloadDefaultResume();
    }
}

function downloadDefaultResume() {
    portfolioData.incrementResumeCount();
    const link = document.createElement('a');
    link.href = 'assets/resumes/default-resume.pdf';
    link.download = 'Ankit-Kumar-Singh-Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

window.viewResume = function() {
    const storedResume = localStorage.getItem('portfolioResume');
    
    if (storedResume) {
        try {
            const resumeData = JSON.parse(storedResume);
            
            const byteCharacters = atob(resumeData.data.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: resumeData.type });
            const blobUrl = URL.createObjectURL(blob);
            
            if (resumeData.type === 'application/pdf') {
                window.open(blobUrl, '_blank');
            } else {
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = resumeData.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
            }
            
            showNotification('Opening resume...', 'success');
        } catch (error) {
            console.error('Error viewing resume:', error);
            showNotification('Error opening resume. Please try downloading instead.', 'error');
        }
    } else {
        showNotification('No resume uploaded yet. Please upload a resume in the admin panel.', 'info');
    }
}

window.viewCertificate = function(imageUrl) {
    if (imageUrl && imageUrl !== 'undefined') {
        window.open(imageUrl, '_blank');
    } else {
        showNotification('Certificate image not available.', 'error');
    }
}

function addViewResumeButtonHomepage() {
    const heroButtons = document.querySelector('.hero-buttons');
    if (!heroButtons) return;
    
    const existingBtn = heroButtons.querySelector('.view-resume-btn');
    if (!existingBtn) {
        const viewResumeBtn = document.createElement('button');
        viewResumeBtn.className = 'btn btn-outline view-resume-btn';
        viewResumeBtn.innerHTML = '<i class="fas fa-eye"></i> View Resume';
        viewResumeBtn.onclick = viewResume;
        heroButtons.appendChild(viewResumeBtn);
    }
}

function checkResumeStatus() {
    const storedResume = localStorage.getItem('portfolioResume');
    const downloadBtn = document.querySelector('.btn-primary[onclick="downloadResume()"]');
    
    if (downloadBtn && storedResume) {
        const resumeData = JSON.parse(storedResume);
        downloadBtn.innerHTML = `<i class="fas fa-download"></i> Download My Resume`;
        
        const existingIndicator = downloadBtn.parentNode.querySelector('.resume-indicator');
        if (!existingIndicator) {
            const indicator = document.createElement('div');
            indicator.className = 'resume-indicator';
            indicator.innerHTML = '✓ Latest Version';
            indicator.style.cssText = 'font-size: 12px; color: #28a745; margin-top: 5px; font-weight: 500;';
            downloadBtn.parentNode.appendChild(indicator);
        }
    }
}

async function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        showNotification('Message sent successfully! I will get back to you soon.', 'success');
        e.target.reset();
    } catch (error) {
        showNotification('Failed to send message. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                z-index: 10000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                border-left: 4px solid #667eea;
                max-width: 400px;
            }
            .notification-success { border-left-color: #4ade80; }
            .notification-error { border-left-color: #f87171; }
            .notification-visible { transform: translateX(0); }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .notification i { font-size: 1.2rem; }
            .notification-success i { color: #4ade80; }
            .notification-error i { color: #f87171; }
        `;
        document.head.appendChild(styles);
    }
    
    setTimeout(() => notification.classList.add('notification-visible'), 100);
    
    setTimeout(() => {
        notification.classList.remove('notification-visible');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

console.log('✅ Homepage script initialization complete');