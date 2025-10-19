// recruiter-panel.js - Recruiter-specific functionality
// recruiter-panel.js - Recruiter-specific functionality

// ✅ ADD THIS DATA BRIDGE AT THE VERY TOP OF THE FILE
window.portfolioBridge = {
    getCandidateData: function() {
        // First try: Use portfolioData if available
        if (typeof portfolioData !== 'undefined' && portfolioData.data) {
            return portfolioData.data;
        }
        
        // Second try: Load from localStorage
        try {
            const savedData = localStorage.getItem('portfolioData');
            if (savedData) {
                return JSON.parse(savedData);
            }
        } catch (error) {
            console.warn('Could not load saved data:', error);
        }
        
        // Final fallback: Use built-in fallback data
        return null;
    },
    
    refreshData: function() {
        if (typeof portfolioData !== 'undefined' && portfolioData.ensureDataLoaded) {
            return portfolioData.ensureDataLoaded();
        }
        return Promise.resolve();
    }
};

// Then continue with the existing RecruiterPanel class...

class RecruiterPanel {
    constructor() {
        this.candidateData = null;
        this.commonTechStack = this.getCommonTechStack();
        this.init();
    }

    async init() {
    console.log('Initializing recruiter panel...');
    
    try {
        // Wait for portfolio data to load
         this.candidateData = window.portfolioBridge.getCandidateData();
        
        if (!this.candidateData) {
            console.log('No portfolio data found, loading fallback data...');
            await this.loadFallbackData();
        } else {
            console.log('Portfolio data loaded successfully');
        }
        
        // ✅ ADD THIS LINE: Validate data after loading
        this.validateCandidateData();
        
        this.initializeRecruiterFeatures();
        this.loadRecruiterData();
        this.setupEventListeners();
        this.setupRealTimeSync();
        console.log('Recruiter panel initialized successfully');
    } catch (error) {
        console.error('Error initializing recruiter panel:', error);
        if (error.name === 'TypeError') {
            this.showNotification('Data loading failed. Using offline mode.', 'warning');
        }
        await this.loadFallbackData();
        this.initializeRecruiterFeatures();
        this.loadRecruiterData();
        this.setupEventListeners();
        this.setupRealTimeSync();
    }
}

// ✅ ADD THIS NEW METHOD: Data validation
validateCandidateData() {
    if (!this.candidateData) {
        console.warn('Candidate data is null, using fallback');
        this.loadFallbackData();
        return false;
    }
    
    // Validate required fields
    const requiredFields = ['profile', 'skills', 'experience'];
    const missingFields = requiredFields.filter(field => !this.candidateData[field]);
    
    if (missingFields.length > 0) {
        console.warn(`Missing required fields: ${missingFields.join(', ')}`);
        // Attempt to fix missing fields
        missingFields.forEach(field => {
            if (!this.candidateData[field]) {
                this.candidateData[field] = this.getFallbackData()[field] || [];
            }
        });
    }
    
    // Ensure profile has basic structure
    if (!this.candidateData.profile.name) {
        this.candidateData.profile.name = "Ankit Kumar Singh";
    }
    if (!this.candidateData.profile.title) {
        this.candidateData.profile.title = "Full Stack Developer";
    }
    
    return true;
}

// ✅ ADD THIS HELPER METHOD: Get fallback data structure
getFallbackData() {
    return {
        profile: {
            name: "Ankit Kumar Singh",
            title: "Full Stack Developer and Data Scientist",
            email: "singhkumar50866@gmail.com",
            phone: "+91 9155892986"
        },
        skills: [],
        experience: [],
        projects: [],
        certificates: [],
        stats: {}
    };
}
    async loadFallbackData() {
        console.log('Loading fallback candidate data...');
        this.candidateData = {
            profile: {
                name: "Ankit Kumar Singh",
                title: "Full Stack Developer and Data Scientist",
                email: "singhkumar50866@gmail.com",
                phone: "+91 9155892986",
                linkedin: "https://www.linkedin.com/in/ankit-kumar-54658b34b/"
            },
            skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB', 'AWS', 'Docker', 'Express.js', 'MySQL', 'Git'],
            experience: [
                {
                    id: 1,
                    title: 'Senior Full Stack Developer',
                    company: 'Tech Innovations Inc.',
                    startDate: '2022-01',
                    endDate: null,
                    current: true,
                    description: 'Led development teams and built scalable applications'
                },
                {
                    id: 2,
                    title: 'Full Stack Developer',
                    company: 'Digital Solutions LLC',
                    startDate: '2020-03',
                    endDate: '2021-12',
                    current: false,
                    description: 'Developed web applications and APIs'
                },
                {
                    id: 3,
                    title: 'Frontend Developer',
                    company: 'Web Creators Co.',
                    startDate: '2018-06',
                    endDate: '2020-02',
                    current: false,
                    description: 'Built responsive user interfaces'
                }
            ],
            projects: [
                {
                    id: 1,
                    title: "E-Commerce Platform",
                    description: "Full-stack e-commerce solution",
                    technologies: ["React", "Node.js", "MongoDB"]
                },
                {
                    id: 2,
                    title: "Task Management App",
                    description: "Collaborative project management tool",
                    technologies: ["Vue.js", "Express", "PostgreSQL"]
                }
            ],
            certificates: [
                {
                    id: 1,
                    name: "AWS Certified Developer",
                    organization: "Amazon Web Services"
                },
                {
                    id: 2,
                    name: "React Professional Certificate",
                    organization: "Meta"
                }
            ],
            stats: {
                resumes: 3,
                images: 12,
                certificates: 7,
                profileViews: 1243
            },
            recruiter: {
                shortlisted: false,
                contactHistory: [],
                notes: '',
                rating: 0,
                status: 'new',
                lastViewed: new Date().toISOString()
            }
        };
    }

    getCommonTechStack() {
        // Allow recruiters to customize tech stack, fallback to default
        try {
            return JSON.parse(localStorage.getItem('recruiterTechStack')) || 
                   ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'MongoDB', 'Express.js', 'MySQL', 'Git'];
        } catch (error) {
            return ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'MongoDB', 'Express.js', 'MySQL', 'Git'];
        }
    }

    safeQuerySelector(selector) {
        try {
            return document.querySelector(selector);
        } catch (error) {
            console.warn(`Element not found: ${selector}`);
            return null;
        }
    }

    initializeRecruiterFeatures() {
        // Add recruiter-specific data to portfolio data
        if (!this.candidateData.recruiter) {
            this.candidateData.recruiter = {
                shortlisted: false,
                contactHistory: [],
                notes: '',
                rating: 0,
                status: 'new', // new, contacted, interviewed, offered, rejected
                lastViewed: new Date().toISOString()
            };
        }
              this.addViewResumeButton();
    }

    loadRecruiterData() {
        // Update candidate information
        this.updateCandidateProfile();
        this.updateStats();
        this.updateQuickAssessment();
        this.loadRecruiterNotes();
        this.updateExperienceTimeline(); // NEW: Ensure timeline matches data
        this.updateRecruiterSpecificElements();
         this.checkResumeStatus();
    }

     // ... existing code ...

// ✅ ADD THIS METHOD: Schema validation for imported data
    validatePortfolioSchema(data) {
        const requiredFields = ['profile', 'skills', 'experience'];
        const validProfileFields = ['name', 'title', 'email'];
        
        // Check required top-level fields
        const missingRequired = requiredFields.filter(field => !data[field]);
        if (missingRequired.length > 0) {
            console.error(`Missing required fields: ${missingRequired.join(', ')}`);
            return false;
        }
        
        // Check profile structure
        if (!data.profile.name || typeof data.profile.name !== 'string') {
            console.error('Invalid profile: name is required and must be string');
            return false;
        }
        
        // Validate arrays
        const arrayFields = ['skills', 'experience', 'projects', 'certificates'];
        for (const field of arrayFields) {
            if (data[field] && !Array.isArray(data[field])) {
                console.error(`Invalid ${field}: must be an array`);
                return false;
            }
        }
        
        return true;
    }

// ✅ ADD THIS METHOD: Enhanced data loading with validation
    async loadAndValidateData() {
        await portfolioData.ensureDataLoaded();
        this.candidateData = portfolioData.data;
        
        if (!this.validatePortfolioSchema(this.candidateData)) {
            console.warn('Data validation failed, using fallback data');
            await this.loadFallbackData();
        }
    }

    // ... existing updateCandidateProfile() method continues here ...
    updateCandidateProfile() {
        // ... existing code ...
    }



    updateCandidateProfile() {
    const profile = this.candidateData.profile;
    
    // Use safe selector
    const nameElement = this.safeQuerySelector('#candidate-name');
    const titleElement = this.safeQuerySelector('#candidate-title');
    const statusElement = this.safeQuerySelector('#candidate-status');
    
    if (nameElement) nameElement.textContent = profile.name;
    if (titleElement) titleElement.textContent = profile.title;
    if (statusElement) {
        statusElement.textContent = this.getAvailabilityStatus();
        statusElement.className = `candidate-status ${this.getStatusClass()}`;
    }
    
    // ✅ ADD THIS CODE: Update profile image
    const profileImg = this.safeQuerySelector('.profile-img img');
    if (profileImg && profile.profileImage) {
        profileImg.src = profile.profileImage;
        profileImg.style.display = 'block';
        // Hide the fallback icon if image loads successfully
        const fallbackIcon = profileImg.parentElement.querySelector('.fa-user');
        if (fallbackIcon) {
            fallbackIcon.style.display = 'none';
        }
    }
}

    updateStats() {
        const stats = this.candidateData.stats;
        const experience = this.candidateData.experience;
        const skills = this.candidateData.skills;
        const certificates = this.candidateData.certificates;

        // Calculate years of experience
        const yearsExp = this.calculateYearsOfExperience();
        
        // Update stat cards
        this.setStatValue('total-experience', `${yearsExp}+`);
        this.setStatValue('projects-completed', `${this.candidateData.projects?.length || 0}+`);
        this.setStatValue('certifications', certificates?.length || 0);
        this.setStatValue('skills-count', `${skills?.length || 0}+`);
    }

    updateQuickAssessment() {
        this.updateSkillMatch();
        this.updateExperienceLevel();
        this.updateAvailability();
        this.updateLocationPreference();
    }

    updateSkillMatch() {
        // Calculate skill match percentage based on common tech stack
        const candidateSkills = this.candidateData.skills || [];
        
        const matches = this.commonTechStack.filter(skill => 
            candidateSkills.some(candidateSkill => 
                candidateSkill.toLowerCase().includes(skill.toLowerCase())
            )
        );
        
        const matchPercentage = Math.round((matches.length / this.commonTechStack.length) * 100);
        
        const skillMatchElement = this.safeQuerySelector('#skill-match');
        const progressBar = this.safeQuerySelector('.progress-fill');
        
        if (skillMatchElement) skillMatchElement.textContent = `${matchPercentage}%`;
        if (progressBar) {
            progressBar.style.width = `${matchPercentage}%`;
            progressBar.className = `progress-fill ${
                matchPercentage >= 80 ? 'progress-high' : 
                matchPercentage >= 60 ? 'progress-medium' : 'progress-low'
            }`;
        }
    }

    updateExperienceLevel() {
        const yearsExp = this.calculateYearsOfExperience();
        let level = 'Junior';
        
        if (yearsExp >= 5) level = 'Senior';
        else if (yearsExp >= 3) level = 'Mid-Level';
        
        const expElement = this.safeQuerySelector('[data-assessment="experience"]');
        if (expElement) {
            expElement.innerHTML = `
                <strong>Experience Level:</strong> ${level} 
                <span style="color: #28a745; margin-left: 10px;">
                    ${yearsExp >= 3 ? '✓ Meets Requirements' : '⚠️ Review Required'}
                </span>
            `;
        }
    }

    updateAvailability() {
        const availability = this.getAvailabilityStatus();
        const availElement = this.safeQuerySelector('[data-assessment="availability"]');
        if (availElement) {
            availElement.innerHTML = `
                <strong>Availability:</strong> ${availability} 
                <span style="color: #28a745; margin-left: 10px;">
                    ${availability === 'Immediate' ? '✓ Available Now' : '⏳ Notice Period'}
                </span>
            `;
        }
    }

    updateLocationPreference() {
        // This would typically come from profile data
        const location = 'Remote/Hybrid';
        const locationElement = this.safeQuerySelector('[data-assessment="location"]');
        if (locationElement) {
            locationElement.innerHTML = `
                <strong>Location:</strong> ${location} 
                <span style="color: #28a745; margin-left: 10px;">✓ Flexible</span>
            `;
        }
    }

    // NEW: Update experience timeline from data
        // ... existing code ...

    // NEW: Update experience timeline from data
    updateExperienceTimeline() {
        const timelineContainer = this.safeQuerySelector('.timeline');
        if (!timelineContainer) return;

        const experiences = this.candidateData.experience || [];
        
        let timelineHTML = '';
        experiences.forEach(exp => {
            const startYear = new Date(exp.startDate).getFullYear();
            const endYear = exp.current ? 'Present' : new Date(exp.endDate).getFullYear();
            
            timelineHTML += `
                <div class="timeline-item">
                    <div class="timeline-date">${startYear} - ${endYear}</div>
                    <div class="timeline-content">
                        <strong>${exp.title}</strong> at ${exp.company}
                    </div>
                </div>
            `;
        });

        timelineContainer.innerHTML = timelineHTML;
    }

    // 🎯 ADD THE NEW METHODS RIGHT HERE - AFTER updateExperienceTimeline AND BEFORE RECRUITER ACTIONS
    updateRecruiterSpecificElements() {
        const settings = this.candidateData.recruiterSettings || {};
        
        // Toggle visibility based on admin settings
        this.toggleElementVisibility('#skill-match-card', settings.showSkillMatch);
        this.toggleElementVisibility('#ats-card', settings.showATS);
        this.toggleElementVisibility('#tags-card', settings.showTags);
        this.toggleElementVisibility('#assessment-card', settings.showAssessments);
        this.toggleElementVisibility('#timeline-card', settings.showTimeline);
        
        // Update skill percentages
        if (settings.showSkillMatch && settings.customSkillPercentages) {
            this.updateCustomSkillProgress(settings.customSkillPercentages);
        }
        
        // Update ATS scores
        if (settings.showATS && settings.atsScores) {
            this.updateCustomATSScores(settings.atsScores);
        }
        
        // Update tags
        if (settings.showTags && settings.customTags) {
            this.updateCustomTags(settings.customTags);
        }
        
        // Update assessments
        if (settings.showAssessments && settings.assessments) {
            this.updateCustomAssessments(settings.assessments);
        }
    }

    toggleElementVisibility(selector, shouldShow) {
        const element = this.safeQuerySelector(selector);
        if (element) {
            element.style.display = shouldShow ? 'block' : 'none';
        }
    }

    updateCustomSkillProgress(percentages) {
        this.setProgressBarWidth('#backend-progress', percentages.backend);
        this.setProgressBarWidth('#frontend-progress', percentages.frontend);
        this.setProgressBarWidth('#database-progress', percentages.database);
        this.setProgressBarWidth('#devops-progress', percentages.devops);
    }

    updateCustomATSScores(scores) {
        this.setElementText('#overall-ats-score', scores.overall + '%');
        this.setElementText('#keyword-ats-score', scores.keywords + '%');
    }

    updateCustomTags(tags) {
        const container = this.safeQuerySelector('.tags-container');
        if (container) {
            container.innerHTML = tags.map(tag => 
                `<div class="tag ${tag.includes('Senior') || tag.includes('Full Stack') || tag.includes('Tech Lead') ? 'highlight' : ''}">${tag}</div>`
            ).join('');
        }
    }

    updateCustomAssessments(assessments) {
        this.setAssessmentContent('[data-assessment="experience"]', assessments.experience);
        this.setAssessmentContent('[data-assessment="availability"]', assessments.availability);
        this.setAssessmentContent('[data-assessment="location"]', assessments.location);
        this.setAssessmentContent('[data-assessment="communication"]', assessments.communication);
    }

    setProgressBarWidth(selector, percentage) {
        const element = this.safeQuerySelector(selector);
        if (element) {
            element.style.width = percentage + '%';
            element.className = `progress-fill ${
                percentage >= 80 ? 'progress-high' : 
                percentage >= 60 ? 'progress-medium' : 'progress-low'
            }`;
        }
    }

    setElementText(selector, text) {
        const element = this.safeQuerySelector(selector);
        if (element) element.textContent = text;
    }

    setAssessmentContent(selector, content) {
        const element = this.safeQuerySelector(selector);
        if (element) element.innerHTML = content;
    }

    // 🎯 RECRUITER ACTION METHODS
    // 🎯 ENHANCED RESUME DOWNLOAD METHOD
    downloadResume() {
        console.log('Downloading resume...');
        
        const btn = this.safeQuerySelector('.recruiter-btn.download');
        if (!btn) return;
        
        this.showLoadingState(btn, '<i class="fas fa-spinner fa-spin"></i> Downloading...');

        setTimeout(() => {
            // ✅ FIRST: Check for uploaded resume from dashboard
            const uploadedResume = localStorage.getItem('portfolioResume');
            
            if (uploadedResume) {
                try {
                    const resumeData = JSON.parse(uploadedResume);
                    console.log('Found uploaded resume:', resumeData.name);
                    
                    // Create download link for uploaded resume
                    const link = document.createElement('a');
                    link.href = resumeData.data;
                    link.download = resumeData.name || `${this.candidateData.profile.name.replace(' ', '_')}_Resume.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // Track download in analytics
                    this.trackRecruiterAction('resume_download', { 
                        source: 'uploaded',
                        filename: resumeData.name 
                    });
                    
                    this.hideLoadingState(btn, '<i class="fas fa-download"></i> Download Resume');
                    this.showNotification('Resume downloaded successfully!', 'success');
                    return;
                    
                } catch (error) {
                    console.error('Error downloading uploaded resume:', error);
                    this.showNotification('Error with uploaded resume, using default', 'warning');
                }
            }
            
            // ✅ SECOND: Check portfolio data for resume
            if (this.candidateData.resumes && this.candidateData.resumes.length > 0) {
                const latestResume = this.candidateData.resumes[0];
                const link = document.createElement('a');
                link.href = latestResume.url;
                link.download = latestResume.filename || `${this.candidateData.profile.name.replace(' ', '_')}_Resume.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                this.trackRecruiterAction('resume_download', { 
                    source: 'portfolio_data',
                    filename: latestResume.filename 
                });
                
                this.hideLoadingState(btn, '<i class="fas fa-download"></i> Download Resume');
                this.showNotification('Resume downloaded successfully!', 'success');
                return;
            }
            
            // ✅ FALLBACK: Use default resume
            console.log('No uploaded resume found, using default');
            const link = document.createElement('a');
            link.href = '/assets/resume.pdf'; // Default fallback path
            link.download = `${this.candidateData.profile.name.replace(' ', '_')}_Resume.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.trackRecruiterAction('resume_download', { source: 'default_fallback' });
            this.hideLoadingState(btn, '<i class="fas fa-download"></i> Download Resume');
            this.showNotification('Resume downloaded successfully!', 'success');
            
        }, 1000);
    }
       


// ✅ ADD VIEW RESUME FUNCTIONALITY - PLACE RIGHT AFTER downloadResume() method

// View Resume Functionality
    viewResume() {
        console.log('Opening resume viewer...');
        
        // Check for uploaded resume first
        const uploadedResume = localStorage.getItem('portfolioResume');
        
        if (uploadedResume) {
            try {
                const resumeData = JSON.parse(uploadedResume);
                this.openResumeViewer(resumeData.data, resumeData.name);
            } catch (error) {
                console.error('Error viewing uploaded resume:', error);
                this.showNotification('Error viewing resume', 'error');
            }
        } else if (this.candidateData.resumes && this.candidateData.resumes.length > 0) {
            // Use portfolio data resume
            const latestResume = this.candidateData.resumes[0];
            this.openResumeViewer(latestResume.url, latestResume.filename);
        } else {
            // Show default resume or message
            this.openResumeViewer('/assets/resume.pdf', 'Default_Resume.pdf');
        }
    }

    // Open Resume Viewer Modal
    openResumeViewer(resumeUrl, resumeName) {
        // Create or get resume viewer modal
        let resumeModal = this.safeQuerySelector('#resumeViewerModal');
        
        if (!resumeModal) {
            resumeModal = document.createElement('div');
            resumeModal.id = 'resumeViewerModal';
            resumeModal.className = 'modal';
            resumeModal.innerHTML = `
                <div class="modal-content large-modal">
                    <div class="modal-header">
                        <h3>Resume: ${resumeName}</h3>
                        <button class="modal-close" onclick="recruiterPanel.closeResumeViewer()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="resume-viewer-container">
                            <iframe id="resume-iframe" style="width: 100%; height: 70vh; border: none;"></iframe>
                            <div id="resume-fallback" style="display: none; text-align: center; padding: 40px;">
                                <i class="fas fa-file-alt" style="font-size: 48px; color: #6c757d; margin-bottom: 20px;"></i>
                                <h3>Resume Not Available</h3>
                                <p>The resume file cannot be displayed. Please download it instead.</p>
                                <button class="recruiter-btn download" onclick="recruiterPanel.downloadResume()">
                                    <i class="fas fa-download"></i> Download Resume
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="recruiter-btn" onclick="recruiterPanel.downloadResume()">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <button class="recruiter-btn print" onclick="recruiterPanel.printResume()">
                            <i class="fas fa-print"></i> Print
                        </button>
                        <button class="recruiter-btn" onclick="recruiterPanel.closeResumeViewer()">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(resumeModal);
        }

        // Set the resume in iframe
        const iframe = document.getElementById('resume-iframe');
        const fallback = document.getElementById('resume-fallback');
        
        iframe.src = resumeUrl;
        iframe.style.display = 'block';
        fallback.style.display = 'none';
        
        // Handle iframe load errors
        iframe.onload = () => {
            console.log('Resume loaded successfully');
        };
        
        iframe.onerror = () => {
            console.error('Failed to load resume in iframe');
            iframe.style.display = 'none';
            fallback.style.display = 'block';
        };

        resumeModal.style.display = 'flex';
        this.trackRecruiterAction('resume_viewed', { filename: resumeName });
    }

    // Close Resume Viewer
    closeResumeViewer() {
        const resumeModal = this.safeQuerySelector('#resumeViewerModal');
        if (resumeModal) {
            resumeModal.style.display = 'none';
        }
    }

    // Print Resume
    printResume() {
        const iframe = document.getElementById('resume-iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.print();
        }
    }

    // ✅ ADD THIS: Add View Resume button to recruiter actions
    addViewResumeButton() {
        const actionButtons = this.safeQuerySelector('.recruiter-actions');
        if (actionButtons) {
            // Check if view button already exists
            const existingViewBtn = actionButtons.querySelector('.view-resume-btn');
            if (!existingViewBtn) {
                const viewResumeBtn = document.createElement('button');
                viewResumeBtn.className = 'recruiter-btn view-resume-btn';
                viewResumeBtn.innerHTML = '<i class="fas fa-eye"></i> View Resume';
                viewResumeBtn.onclick = () => this.viewResume();
                
                // Insert after download button or at the beginning
                const downloadBtn = actionButtons.querySelector('.download');
                if (downloadBtn) {
                    downloadBtn.parentNode.insertBefore(viewResumeBtn, downloadBtn.nextSibling);
                } else {
                    actionButtons.prepend(viewResumeBtn);
                }
            }
        }
    }

    contactCandidate() {
        console.log('Opening contact modal...');
        const modal = this.safeQuerySelector('#contactModal');
        if (modal) modal.style.display = 'flex';
        
        // Track contact attempt
        this.trackRecruiterAction('contact_attempt');
    }

    scheduleInterview() {
        console.log('Scheduling interview...');
        
        const btn = this.safeQuerySelector('.recruiter-btn:nth-child(3)'); // Schedule interview button
        if (btn) this.showLoadingState(btn, '<i class="fas fa-spinner fa-spin"></i> Scheduling...');

        setTimeout(() => {
            const profile = this.candidateData.profile;
            const title = encodeURIComponent(`Interview with ${profile.name}`);
            const details = encodeURIComponent(
                `Interview discussion for ${profile.title} position.\n\n` +
                `Candidate: ${profile.name}\n` +
                `Phone: ${profile.phone}\n` +
                `Email: ${profile.email}`
            );
            
            // Create calendar event (Google Calendar)
            const startTime = new Date();
            startTime.setDate(startTime.getDate() + 2); // 2 days from now
            startTime.setHours(10, 0, 0); // 10:00 AM
            
            const endTime = new Date(startTime);
            endTime.setHours(11, 0, 0); // 11:00 AM
            
            const dates = `${this.formatCalendarDate(startTime)}/${this.formatCalendarDate(endTime)}`;
            const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
            
            window.open(calendarUrl, '_blank');
            this.trackRecruiterAction('interview_scheduled');
            
            if (btn) this.hideLoadingState(btn, '<i class="fas fa-calendar-alt"></i> Schedule Interview');
            this.showNotification('Calendar event created!', 'success');
        }, 1000);
    }

    // ✅ NEW METHOD: Check resume status and update UI
    checkResumeStatus() {
        const uploadedResume = localStorage.getItem('portfolioResume');
        const downloadBtn = this.safeQuerySelector('.recruiter-btn.download');
        
        if (downloadBtn) {
            if (uploadedResume) {
                try {
                    const resumeData = JSON.parse(uploadedResume);
                    // Update button to show it's the latest uploaded resume
                    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Latest Resume';
                    
                    // Add visual indicator
                    const existingIndicator = downloadBtn.parentNode.querySelector('.resume-indicator');
                    if (!existingIndicator) {
                        const indicator = document.createElement('div');
                        indicator.className = 'resume-indicator';
                        indicator.innerHTML = '✓ Latest Version Uploaded';
                        indicator.style.cssText = 'font-size: 12px; color: #28a745; margin-top: 5px; font-weight: 500;';
                        downloadBtn.parentNode.appendChild(indicator);
                    }
                    
                    console.log('Resume status: Latest version available');
                } catch (error) {
                    console.error('Error parsing resume data:', error);
                }
            } else {
                console.log('Resume status: Using default resume');
            }
        }
    }

    toggleShortlist() {
        const isShortlisted = !this.candidateData.recruiter.shortlisted;
        this.candidateData.recruiter.shortlisted = isShortlisted;
        
        // Update UI
        const btn = this.safeQuerySelector('.recruiter-btn.shortlist');
        const text = this.safeQuerySelector('#shortlist-text');
        
        if (btn && text) {
            if (isShortlisted) {
                btn.innerHTML = '<i class="fas fa-star"></i> <span id="shortlist-text">Shortlisted</span>';
                btn.style.background = 'var(--danger)';
                this.showNotification('Candidate added to shortlist!', 'success');
            } else {
                btn.innerHTML = '<i class="fas fa-star"></i> <span id="shortlist-text">Add to Shortlist</span>';
                btn.style.background = 'var(--warning)';
                this.showNotification('Candidate removed from shortlist.', 'info');
            }
        }
        
        // Save to localStorage
        this.saveRecruiterData();
        this.trackRecruiterAction(isShortlisted ? 'shortlisted' : 'unshortlisted');
    }

    compareCandidate() {
        const btn = this.safeQuerySelector('.recruiter-btn:nth-child(5)'); // Compare button
        if (btn) this.showLoadingState(btn, '<i class="fas fa-spinner fa-spin"></i> Adding...');

        setTimeout(() => {
            // Add to comparison list
            const comparisonList = JSON.parse(localStorage.getItem('candidateComparisons')) || [];
            const candidateInfo = {
                id: this.candidateData.profile.email,
                name: this.candidateData.profile.name,
                title: this.candidateData.profile.title,
                skills: this.candidateData.skills?.length || 0,
                experience: this.calculateYearsOfExperience(),
                match: this.safeQuerySelector('#skill-match')?.textContent || '0%',
                added: new Date().toISOString()
            };
            
            if (!comparisonList.find(item => item.id === candidateInfo.id)) {
                comparisonList.push(candidateInfo);
                localStorage.setItem('candidateComparisons', JSON.stringify(comparisonList));
                this.showNotification('Added to comparison list!', 'success');
            } else {
                this.showNotification('Already in comparison list', 'info');
            }
            
            this.trackRecruiterAction('added_to_comparison');
            if (btn) this.hideLoadingState(btn, '<i class="fas fa-balance-scale"></i> Compare');
        }, 500);
    }

    printPortfolio() {
        console.log('Printing portfolio...');
        window.print();
        this.trackRecruiterAction('portfolio_printed');
    }

    // 🎯 CONTACT METHODS
    sendEmail() {
        const profile = this.candidateData.profile;
        const subject = encodeURIComponent(`Interview Opportunity - ${profile.title}`);
        const body = encodeURIComponent(
            `Hello ${profile.name},\n\n` +
            `I came across your portfolio and was impressed by your experience in ${this.candidateData.skills?.slice(0, 3).join(', ')}.\n\n` +
            `I'd like to discuss potential opportunities with you. Please let me know your availability for a quick call.\n\n` +
            `Best regards,\n` +
            `[Your Name]\n` +
            `[Your Company]`
        );
        
        window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
        this.closeModal();
        this.trackRecruiterAction('email_sent');
    }

    makeCall() {
        const profile = this.candidateData.profile;
        window.location.href = `tel:${profile.phone}`;
        this.closeModal();
        this.trackRecruiterAction('phone_call');
    }

    sendWhatsApp() {
        const profile = this.candidateData.profile;
        const message = encodeURIComponent(
            `Hello ${profile.name}! I saw your portfolio and would like to discuss opportunities. Are you available for a quick chat?`
        );
        
        // Clean phone number (remove non-numeric characters except +)
        const cleanPhone = profile.phone.replace(/[^\d+]/g, '');
        console.log('WhatsApp phone:', cleanPhone);
        
        window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
        this.closeModal();
        this.trackRecruiterAction('whatsapp_sent');
    }

    sendLinkedIn() {
        const profile = this.candidateData.profile;
        if (profile.linkedin) {
            window.open(profile.linkedin, '_blank');
            this.trackRecruiterAction('linkedin_visited');
        } else {
            this.showNotification('LinkedIn URL not available', 'error');
        }
        this.closeModal();
    }

    closeModal() {
        const modal = this.safeQuerySelector('#contactModal');
        if (modal) modal.style.display = 'none';
    }

    // 🎯 NOTES FUNCTIONALITY
    loadRecruiterNotes() {
        const notesKey = `recruiter_notes_${this.candidateData.profile.email}`;
        const savedNotes = localStorage.getItem(notesKey);
        const notesTextarea = this.safeQuerySelector('#recruiterNotes');
        
        if (notesTextarea && savedNotes) {
            notesTextarea.value = savedNotes;
        }
    }

    saveNotes() {
        const notesTextarea = this.safeQuerySelector('#recruiterNotes');
        if (notesTextarea) {
            const notesKey = `recruiter_notes_${this.candidateData.profile.email}`;
            localStorage.setItem(notesKey, notesTextarea.value);
            this.showNotification('Notes saved successfully!', 'success');
            this.trackRecruiterAction('notes_saved');
        }
    }

    clearNotes() {
        if (confirm('Are you sure you want to clear your notes?')) {
            const notesTextarea = this.safeQuerySelector('#recruiterNotes');
            if (notesTextarea) {
                notesTextarea.value = '';
                const notesKey = `recruiter_notes_${this.candidateData.profile.email}`;
                localStorage.removeItem(notesKey);
                this.showNotification('Notes cleared!', 'info');
                this.trackRecruiterAction('notes_cleared');
            }
        }
    }

    // 🎯 UTILITY METHODS
    calculateYearsOfExperience() {
        const experiences = this.candidateData.experience || [];
        if (experiences.length === 0) return 0;
        
        let totalMonths = 0;
        
        experiences.forEach(exp => {
            const start = new Date(exp.startDate);
            const end = exp.current ? new Date() : new Date(exp.endDate);
            const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
            totalMonths += Math.max(0, months);
        });
        
        return Math.floor(totalMonths / 12);
    }

    getAvailabilityStatus() {
        // This would typically come from profile data
        // For now, we'll determine based on current employment status
        const currentJob = this.candidateData.experience?.find(exp => exp.current);
        return currentJob ? '2 weeks notice' : 'Immediate';
    }

    getStatusClass() {
        const status = this.getAvailabilityStatus();
        return status === 'Immediate' ? 'status-available' : 'status-notice';
    }

    setStatValue(elementId, value) {
        const element = this.safeQuerySelector(`#${elementId}`);
        if (element) element.textContent = value;
    }

    formatCalendarDate(date) {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
    }

    // NEW: Loading state management
    showLoadingState(element, loadingHTML) {
        element.setAttribute('data-original-html', element.innerHTML);
        element.innerHTML = loadingHTML;
        element.disabled = true;
    }

    hideLoadingState(element, defaultHTML = null) {
        const originalHTML = element.getAttribute('data-original-html') || defaultHTML;
        if (originalHTML) {
            element.innerHTML = originalHTML;
        }
        element.disabled = false;
        element.removeAttribute('data-original-html');
    }

    // ENHANCED: Analytics tracking
    trackRecruiterAction(action, metadata = {}) {
        // Track recruiter actions for analytics
        const analytics = JSON.parse(localStorage.getItem('recruiterAnalytics')) || [];
        analytics.push({
            action,
            candidate: this.candidateData.profile.email,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId(),
            recruiterId: localStorage.getItem('recruiterId') || 'anonymous',
            ...metadata
        });
        
        localStorage.setItem('recruiterAnalytics', JSON.stringify(analytics));
        
        // Update candidate's recruiter stats
        if (!this.candidateData.recruiter.contactHistory) {
            this.candidateData.recruiter.contactHistory = [];
        }
        
        this.candidateData.recruiter.contactHistory.push({
            action,
            timestamp: new Date().toISOString(),
            ...metadata
        });
        
        this.candidateData.recruiter.lastViewed = new Date().toISOString();
        this.saveRecruiterData();
    }

    getSessionId() {
        let sessionId = localStorage.getItem('recruiterSessionId');
        if (!sessionId) {
            sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('recruiterSessionId', sessionId);
        }
        return sessionId;
    }

    saveRecruiterData() {
        // Save recruiter-specific data separately from main portfolio data
        const recruiterData = {
            [this.candidateData.profile.email]: this.candidateData.recruiter
        };
        
        localStorage.setItem('recruiterData', JSON.stringify(recruiterData));
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
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

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    setupEventListeners() {
        // Modal close handlers
        const modal = this.safeQuerySelector('#contactModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    
    
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Custom tech stack configuration
        this.setupTechStackConfig();
        // ✅ ADD THIS: Data synchronization listener
         this.setupDataSyncListener();
    }
    // ✅ ADD THIS METHOD INSIDE THE RecruiterPanel CLASS - after setupEventListeners()
    setupRealTimeSync() {
        // Listen for data updates from dashboard
        window.addEventListener('portfolioDataUpdated', (e) => {
            if (e.detail && e.detail.data) {
                this.candidateData = e.detail.data;
                this.loadRecruiterData();
                this.showNotification('Data updated from dashboard', 'success');
            }
        });
        
        // Also listen for storage events (cross-tab)
        window.addEventListener('storage', (e) => {
            if (e.key === 'portfolioData' && e.newValue) {
                this.candidateData = JSON.parse(e.newValue);
                this.loadRecruiterData();
            }
        });
    }

    // NEW: Data synchronization across tabs
    // ✅ ENHANCE THIS EXISTING METHOD:
    setupDataSyncListener() {
        // Listen for storage events (cross-tab updates)
        window.addEventListener('storage', (e) => {
            if (e.key === 'portfolioData' && e.newValue) {
                console.log('Portfolio data updated from another tab, refreshing...');
                try {
                    const newData = JSON.parse(e.newValue);
                    this.candidateData = newData;
                    this.loadRecruiterData();
                    this.showNotification('Portfolio data updated', 'info');
                } catch (error) {
                    console.error('Error parsing portfolio data:', error);
                }
            }
        });
    
    // ✅ ADD THIS: Custom event listener for same-tab updates
    document.addEventListener('portfolioDataUpdated', (e) => {
        if (e.detail && e.detail.data) {
            this.candidateData = e.detail.data;
            this.loadRecruiterData();
            this.showNotification('Data refreshed from dashboard', 'success');
        }
    });
    
    // ✅ ADD THIS: Periodic data refresh
    setInterval(() => {
        window.portfolioBridge.refreshData().then(() => {
            const freshData = window.portfolioBridge.getCandidateData();
            if (freshData && JSON.stringify(freshData) !== JSON.stringify(this.candidateData)) {
                this.candidateData = freshData;
                this.loadRecruiterData();
            }
        });
    }, 30000); // Check every 30 seconds


    }


    // NEW: Tech stack configuration
    setupTechStackConfig() {
        // Add a hidden config option for recruiters to customize tech stack
        const configButton = document.createElement('button');
        configButton.innerHTML = '<i class="fas fa-cog"></i>';
        configButton.style.position = 'fixed';
        configButton.style.bottom = '20px';
        configButton.style.right = '20px';
        configButton.style.zIndex = '1000';
        configButton.className = 'recruiter-btn';
        configButton.onclick = () => this.showTechStackConfig();
        
        document.body.appendChild(configButton);
    }

    showTechStackConfig() {
        const techStack = this.commonTechStack.join(', ');
        const newTechStack = prompt('Configure required tech stack (comma-separated):', techStack);
        
        if (newTechStack !== null) {
            const techArray = newTechStack.split(',').map(item => item.trim()).filter(item => item);
            if (techArray.length > 0) {
                this.commonTechStack = techArray;
                localStorage.setItem('recruiterTechStack', JSON.stringify(techArray));
                this.updateSkillMatch();
                this.showNotification('Tech stack updated!', 'success');
            }
        }
    }
}

// Initialize recruiter panel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.recruiterPanel = new RecruiterPanel();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecruiterPanel;
}