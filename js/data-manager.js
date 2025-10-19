// Data management for portfolio - LOCALSTORAGE ONLY VERSION
class PortfolioData {
    constructor() {
        this.data = null;
        this.initialized = false;
        this.readyCallbacks = [];
        this.hasUnsavedChanges = false;
        this.init();
    }

    async init() {
    try {
        console.log('🏁 Starting portfolio data initialization...');
        await this.loadData();
        this.initialized = true;
        console.log('✅ Portfolio data initialized successfully');
        
        // Execute all waiting callbacks
        this.readyCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error in ready callback:', error);
            }
        });
        this.readyCallbacks = [];
    } catch (error) {
        console.error('❌ Failed to initialize portfolio data:', error);
        // Fallback to default data
        this.data = this.getDefaultData();
        this.initialized = true;
    }
}

    onReady(callback) {
        if (this.initialized) {
            callback();
        } else {
            this.readyCallbacks.push(callback);
        }
    }
    
    async ensureDataLoaded() {
    if (this.initialized) {
        return this.data;
    }
    
    return new Promise((resolve, reject) => {
        const checkData = () => {
            if (this.initialized && this.data) {
                console.log('✅ Portfolio data is ready');
                resolve(this.data);
            } else {
                console.log('⏳ Waiting for portfolio data...');
                setTimeout(checkData, 100);
            }
        };
        checkData();
        
        // Timeout after 10 seconds
        setTimeout(() => {
            if (!this.initialized) {
                reject(new Error('Portfolio data loading timeout'));
            }
        }, 10000);
    });
}
    
    async loadData() {
        try {
            console.log('Loading portfolio data from localStorage...');
            const savedData = localStorage.getItem('portfolioData');
            if (savedData) {
                this.data = JSON.parse(savedData);
                console.log('✅ Data loaded from localStorage');
            } else {
                this.data = this.getDefaultData();
                await this.saveData(); // Save default data
                console.log('✅ Default data created and saved');
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.data = this.getDefaultData();
        }
    }
    
    getDefaultData() {
        return {
            profile: {
                name: "Ankit Kumar Singh",
                title: "Full Stack Developer",
                bio: "Passionate developer with 1+ years of experience building web applications. Specialized in JavaScript, React, and Node.js. Always eager to learn new technologies and tackle challenging problems.",
                email: "singhkumar50866@gmail.com",
                phone: "+91 9155892986",
                linkedin: "https://www.linkedin.com/in/ankit-kumar-54658b34b/",
                github: "https://github.com/Dada09898",
                website: "https://ankitkumar.dev",
                profileImage: null
            },
            settings: {
                theme: 'light',
                language: 'en',
                whatsappNumber: '+919155892986',
                whatsappEnabled: true,
                chatbotEnabled: true
            },
            security: {
                question: 'pet',
                customQuestion: '',
                answer: 'admin123'
            },
            recruiterSettings: {
                showSkillMatch: true,
                customSkillPercentages: {
                    backend: 90,
                    frontend: 88,
                    database: 85,
                    devops: 75
                },
                showATS: true,
                atsScores: {
                    overall: 94,
                    keywords: 92
                },
                showTags: true,
                customTags: [
                    "Senior Level", "Full Stack", "Tech Lead", "Remote Available",
                    "Immediate Start", "Full-time", "JavaScript Expert", "React Specialist"
                ],
                showAssessments: true,
                assessments: {
                    experience: "Senior ✓ Meets Requirements",
                    availability: "Immediate ✓ Available Now", 
                    location: "Remote/Hybrid ✓ Flexible",
                    communication: "Excellent ✓ Professional"
                },
                showProgressBars: true,
                showTimeline: true
            },
            skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB', 'AWS', 'Docker'],
            experience: [
                {
                    id: 1,
                    title: 'Senior Developer',
                    company: 'Tech Solutions Inc.',
                    startDate: '2020-01',
                    endDate: null,
                    current: true,
                    description: 'Led a team of 5 developers in building scalable web applications. Implemented CI/CD pipelines reducing deployment time by 40%.'
                },
                {
                    id: 2,
                    title: 'Web Developer',
                    company: 'Digital Creations',
                    startDate: '2018-06',
                    endDate: '2020-01',
                    current: false,
                    description: 'Developed and maintained client websites using React and Node.js. Improved site performance by 30% through optimization techniques.'
                }
            ],
            education: [
                {
                    id: 1,
                    degree: 'Bachelor of Science in Computer Science',
                    institution: 'University of Technology',
                    startDate: '2014-09',
                    endDate: '2018-06',
                    current: false,
                    description: 'Graduated with honors. Focused on software engineering and web technologies.'
                }
            ],
            certificates: [
                {
                    id: 1,
                    name: 'AWS Certified Developer',
                    organization: 'Amazon Web Services',
                    //image: 'https://via.placeholder.com/300x200?text=AWS+Certificate'// Replace with the actual image URL
                },
                {
                    id: 2,
                    name: 'React Advanced Concepts',
                    organization: 'React Training',
                    //image: 'https://via.placeholder.com/300x200?text=React+Certificate'//
                }
            ],
            projects: [
                {
                    id: 1,
                    title: "E-Commerce Platform",
                    description: "Full-stack e-commerce solution with React, Node.js, and MongoDB",
                   // image: "https://via.placeholder.com/400x250?text=E-Commerce+Project",// Replace with actual image URL
                    technologies: ["React", "Node.js", "MongoDB", "Stripe"],
                    github: "https://github.com/Dada09898",
                    live: "https://ecommerce-demo.com",
                    featured: true
                }
            ],
            stats: {
                resumes: 3,
                images: 12,
                certificates: 7,
                profileViews: 1243
            }
        };
    }
    
    async saveData() {
        try {
            console.log('💾 Saving data to localStorage...');
            localStorage.setItem('portfolioData', JSON.stringify(this.data));
            console.log('✅ Data saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Error saving data:', error);
            return false;
        }
    }
    
    // Profile methods
    async updateProfile(profileData) {
        this.data.profile = { ...this.data.profile, ...profileData };
        return await this.saveData();
    }
    
    // Skills methods
    async addSkill(skill) {
        if (!this.data.skills.includes(skill)) {
            this.data.skills.push(skill);
            return await this.saveData();
        }
        return true;
    }
    
    async removeSkill(skill) {
        this.data.skills = this.data.skills.filter(s => s !== skill);
        return await this.saveData();
    }
    
    async updateSkills(skillsArray) {
        this.data.skills = [...skillsArray];
        return await this.saveData();
    }
    
    // Experience methods
    async addExperience(experience) {
        experience.id = Date.now();
        this.data.experience.push(experience);
        return await this.saveData();
    }
    
    async updateExperience(id, experience) {
        const index = this.data.experience.findIndex(exp => exp.id === id);
        if (index !== -1) {
            this.data.experience[index] = { ...this.data.experience[index], ...experience };
            return await this.saveData();
        }
        return false;
    }
    
    async removeExperience(id) {
        this.data.experience = this.data.experience.filter(exp => exp.id !== id);
        return await this.saveData();
    }
    
    // Education methods
    async addEducation(education) {
        education.id = Date.now();
        this.data.education.push(education);
        return await this.saveData();
    }
    
    async updateEducation(id, education) {
        const index = this.data.education.findIndex(edu => edu.id === id);
        if (index !== -1) {
            this.data.education[index] = { ...this.data.education[index], ...education };
            return await this.saveData();
        }
        return false;
    }
    
    async removeEducation(id) {
        this.data.education = this.data.education.filter(edu => edu.id !== id);
        return await this.saveData();
    }
    
    // Certificate methods
    async addCertificate(certificate) {
        certificate.id = Date.now();
        this.data.certificates.push(certificate);
        return await this.saveData();
    }
    
    async updateCertificate(id, certificate) {
        const index = this.data.certificates.findIndex(cert => cert.id === id);
        if (index !== -1) {
            this.data.certificates[index] = { ...this.data.certificates[index], ...certificate };
            return await this.saveData();
        }
        return false;
    }
    
    async removeCertificate(id) {
        this.data.certificates = this.data.certificates.filter(cert => cert.id !== id);
        return await this.saveData();
    }
    
    // Project methods
    async addProject(projectData) {
        if (!this.data.projects) this.data.projects = [];
        
        const newProject = {
            id: Date.now(),
            ...projectData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.data.projects.push(newProject);
        const result = await this.saveData();
        
        if (result) {
            console.log('Project added successfully:', newProject.title);
            return newProject;
        }
        return null;
    }

    async updateProject(id, projectData) {
        if (!this.data.projects) return false;
        
        const projectIndex = this.data.projects.findIndex(proj => proj.id === id);
        if (projectIndex !== -1) {
            this.data.projects[projectIndex] = { 
                ...this.data.projects[projectIndex], 
                ...projectData,
                updatedAt: new Date().toISOString()
            };
            
            const result = await this.saveData();
            if (result) {
                console.log('Project updated successfully:', this.data.projects[projectIndex].title);
                return true;
            }
        }
        return false;
    }

    async removeProject(id) {
        if (!this.data.projects) return false;
        
        const projectIndex = this.data.projects.findIndex(proj => proj.id === id);
        if (projectIndex !== -1) {
            const projectTitle = this.data.projects[projectIndex].title;
            this.data.projects = this.data.projects.filter(proj => proj.id !== id);
            
            const result = await this.saveData();
            if (result) {
                console.log('Project removed successfully:', projectTitle);
                return true;
            }
        }
        return false;
    }

    // Settings methods
    async updateSettings(settings) {
        this.data.settings = { ...this.data.settings, ...settings };
        return await this.saveData();
    }

    // Recruiter Settings methods
    async updateRecruiterSettings(settings) {
        if (!this.data.recruiterSettings) {
            this.data.recruiterSettings = {};
        }
        this.data.recruiterSettings = { ...this.data.recruiterSettings, ...settings };
        return await this.saveData();
    }

    async getRecruiterSettings() {
        if (!this.data.recruiterSettings) {
            this.data.recruiterSettings = {
                showSkillMatch: true,
                customSkillPercentages: {
                    backend: 90,
                    frontend: 88,
                    database: 85,
                    devops: 75
                },
                showATS: true,
                atsScores: {
                    overall: 94,
                    keywords: 92
                },
                showTags: true,
                customTags: [
                    "Senior Level", "Full Stack", "Tech Lead", "Remote Available",
                    "Immediate Start", "Full-time", "JavaScript Expert", "React Specialist"
                ],
                showAssessments: true,
                assessments: {
                    experience: "Senior ✓ Meets Requirements",
                    availability: "Immediate ✓ Available Now", 
                    location: "Remote/Hybrid ✓ Flexible",
                    communication: "Excellent ✓ Professional"
                },
                showProgressBars: true,
                showTimeline: true
            };
        }
        return this.data.recruiterSettings;
    }
    
    // Stats methods
    async updateStats(newStats) {
        this.data.stats = { ...this.data.stats, ...newStats };
        return await this.saveData();
    }
    
    async incrementProfileViews() {
        try {
            this.data.stats.profileViews = (this.data.stats.profileViews || 0) + 1;
            await this.saveData();
            console.log('✅ Profile views incremented');
        } catch (error) {
            console.error('Error incrementing profile views:', error);
        }
    }
    
    async incrementResumeCount() {
        try {
            this.data.stats.resumes = (this.data.stats.resumes || 0) + 1;
            await this.saveData();
            console.log('✅ Resume count incremented');
        } catch (error) {
            console.error('Error incrementing resume count:', error);
        }
    }

    async incrementPortfolioViews() {
        try {
            this.data.stats.portfolioViews = (this.data.stats.portfolioViews || 0) + 1;
            await this.saveData();
            console.log('✅ Portfolio views incremented');
        } catch (error) {
            console.error('Error incrementing portfolio views:', error);
        }
    }

    // Utility methods
    async resetToDefault() {
        this.data = this.getDefaultData();
        return await this.saveData();
    }
    
    async exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        return URL.createObjectURL(dataBlob);
    }
    
    async importData(jsonData) {
        try {
            const parsedData = JSON.parse(jsonData);
            this.data = { ...this.getDefaultData(), ...parsedData };
            return await this.saveData();
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
    
    // Wait for data to be loaded
    async waitForData() {
        if (this.initialized) {
            return this.data;
        }
        
        return new Promise((resolve) => {
            const checkData = () => {
                if (this.initialized) {
                    resolve(this.data);
                } else {
                    setTimeout(checkData, 100);
                }
            };
            checkData();
        });
    }

    // Trigger homepage updates
    triggerHomepageUpdate() {
        console.log('🔄 Triggering homepage update...');
        const currentData = JSON.stringify(this.data);
        localStorage.setItem('portfolioData', currentData);
        
        const event = new CustomEvent('portfolioDataUpdated', { 
            detail: { data: this.data } 
        });
        window.dispatchEvent(event);
        
        console.log('✅ Homepage update triggered');
    }
}

// Create global instance
const portfolioData = new PortfolioData();

// Auto-save feature
portfolioData.setupAutoSave = function() {
    setInterval(() => {
        if (this.hasUnsavedChanges) {
            this.saveData();
            console.log('💾 Auto-saved portfolio data');
            this.hasUnsavedChanges = false;
        }
    }, 30000);
};

// Initialize auto-save when data is ready
portfolioData.onReady = function() {
    this.setupAutoSave();
};