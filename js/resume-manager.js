// Resume Manager - Handles all resume upload, viewing, and editing functionality
class ResumeManager {
    constructor() {
        this.currentResume = null;
        this.resumeDetails = {
            title: 'My Resume',
            summary: '',
            version: 'v1.0',
            visibility: 'public',
            lastUpdated: null
        };
        this.initializeEventListeners();
        this.loadStoredResume();
        this.loadResumeDetails();
    }

    initializeEventListeners() {
        // Upload resume button
        document.getElementById('upload-resume-btn').addEventListener('click', () => {
            this.showUploadModal();
        });

        // Modal upload buttons
        document.getElementById('browse-resume-btn').addEventListener('click', () => {
            document.getElementById('resume-file').click();
        });

        document.getElementById('resume-file').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        document.getElementById('confirm-upload-btn').addEventListener('click', () => {
            this.uploadResume();
        });

        document.getElementById('cancel-upload-btn').addEventListener('click', () => {
            this.hideUploadModal();
        });

        // View and download buttons in resume section
        document.addEventListener('click', (e) => {
            if (e.target.closest('#view-resume-btn')) {
                this.viewResume();
            }
            if (e.target.closest('#download-resume-btn')) {
                this.downloadResume();
            }
            if (e.target.closest('#delete-resume-btn')) {
                this.deleteResume();
            }
            if (e.target.closest('#edit-resume-details-btn')) {
                this.showEditResumeModal();
            }
        });

        // Edit resume modal
        document.getElementById('save-resume-details-btn').addEventListener('click', () => {
            this.saveResumeDetails();
        });

        document.getElementById('cancel-edit-resume-btn').addEventListener('click', () => {
            this.hideEditResumeModal();
        });

        // Close modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                modal.style.display = 'none';
            });
        });

        document.getElementById('close-viewer-btn').addEventListener('click', () => {
            this.hideViewerModal();
        });

        document.getElementById('download-from-viewer-btn').addEventListener('click', () => {
            this.downloadResume();
        });

        // Drag and drop functionality
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('resume-upload-area');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('drag-over');
            }, false);
        });

        uploadArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            this.handleDroppedFiles(files);
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDroppedFiles(files) {
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        // Validate file type
        const validTypes = ['application/pdf', 'application/msword', 
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                           'text/plain'];
        
        if (!validTypes.includes(file.type)) {
            this.showNotification('Please select a valid file (PDF, DOC, DOCX, TXT)', 'error');
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            this.showNotification('File size must be less than 5MB', 'error');
            return;
        }

        // Update file info
        this.updateFileInfo(file);
        
        // Enable upload button
        document.getElementById('confirm-upload-btn').disabled = false;
    }

    updateFileInfo(file) {
        const fileName = file.name;
        const fileSize = this.formatFileSize(file.size);

        document.getElementById('file-name').textContent = fileName;
        document.getElementById('file-size').textContent = fileSize;
        document.getElementById('file-info').style.display = 'block';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showUploadModal() {
        document.getElementById('upload-resume-modal').style.display = 'flex';
    }

    hideUploadModal() {
        document.getElementById('upload-resume-modal').style.display = 'none';
        this.resetModal();
    }

    resetModal() {
        document.getElementById('resume-file').value = '';
        document.getElementById('file-info').style.display = 'none';
        document.getElementById('confirm-upload-btn').disabled = true;
        document.getElementById('upload-progress').style.display = 'none';
        document.getElementById('resume-upload-area').classList.remove('drag-over');
    }

    uploadResume() {
        const fileInput = document.getElementById('resume-file');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showNotification('Please select a file first', 'error');
            return;
        }

        this.simulateUpload(file);
    }

    simulateUpload(file) {
    // Show progress
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    document.getElementById('upload-progress').style.display = 'block';
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Store resume data with sync
            this.storeResumeAndSync(file);
            
            // Update UI
            this.updateResumeSection();
            
            // Show success message
            this.showNotification('Resume uploaded successfully! Homepage updated.', 'success');
            
            // Hide modal and progress
            setTimeout(() => {
                this.hideUploadModal();
                document.getElementById('upload-progress').style.display = 'none';
                progressFill.style.width = '0%';
            }, 500);
        }
        
        progressFill.style.width = progress + '%';
        progressText.textContent = `Uploading... ${Math.round(progress)}%`;
    }, 200);
}
    storeResumeAndSync(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const resumeData = {
            name: file.name,
            size: file.size,
            type: file.type,
            data: e.target.result,
            uploadedAt: new Date().toISOString()
        };
        
        localStorage.setItem('portfolioResume', JSON.stringify(resumeData));
        this.currentResume = resumeData;
        
        // Update resume details
        this.resumeDetails.lastUpdated = new Date().toISOString();
        this.saveResumeDetails();
        
        // Trigger homepage update
        if (portfolioData && portfolioData.triggerHomepageUpdate) {
            portfolioData.triggerHomepageUpdate();
        }
        
        // Also update resume stats
        portfolioData.incrementResumeCount();
    };
    reader.readAsDataURL(file);
}

    loadStoredResume() {
        const storedResume = localStorage.getItem('portfolioResume');
        if (storedResume) {
            this.currentResume = JSON.parse(storedResume);
        }
    }

    loadResumeDetails() {
        const storedDetails = localStorage.getItem('portfolioResumeDetails');
        if (storedDetails) {
            this.resumeDetails = JSON.parse(storedDetails);
        }
    }

    saveResumeDetails() {
        const title = document.getElementById('resume-title').value;
        const summary = document.getElementById('resume-summary').value;
        const version = document.getElementById('resume-version').value;
        const visibility = document.getElementById('resume-visibility').value;

        this.resumeDetails = {
            title: title || 'My Resume',
            summary: summary || '',
            version: version || 'v1.0',
            visibility: visibility || 'public',
            lastUpdated: this.resumeDetails.lastUpdated || new Date().toISOString()
        };

        localStorage.setItem('portfolioResumeDetails', JSON.stringify(this.resumeDetails));
        this.updateResumeSection();
        this.hideEditResumeModal();
        this.showNotification('Resume details updated successfully!', 'success');
    }

    showEditResumeModal() {
        document.getElementById('resume-title').value = this.resumeDetails.title;
        document.getElementById('resume-summary').value = this.resumeDetails.summary;
        document.getElementById('resume-version').value = this.resumeDetails.version;
        document.getElementById('resume-visibility').value = this.resumeDetails.visibility;
        
        document.getElementById('edit-resume-modal').style.display = 'flex';
    }

    hideEditResumeModal() {
        document.getElementById('edit-resume-modal').style.display = 'none';
    }

    updateResumeSection() {
        const resumeSection = document.getElementById('resume-section');
        
        if (this.currentResume) {
            resumeSection.innerHTML = this.getResumeSectionWithFile();
        } else {
            resumeSection.innerHTML = this.getEmptyResumeSection();
        }
    }

    getEmptyResumeSection() {
        return `
            <div class="resume-section">
                <div class="resume-header">
                    <h2>Resume Management</h2>
                    <div class="resume-actions">
                        <button class="btn btn-primary" id="upload-resume-btn">
                            <i class="fas fa-upload"></i> Upload Resume
                        </button>
                    </div>
                </div>
                
                <div class="resume-content">
                    <div class="resume-file-card">
                        <h3>Resume File</h3>
                        <div class="upload-area" id="upload-area">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>No resume uploaded yet</p>
                            <p class="text-muted">Upload your resume to get started</p>
                            <button class="btn btn-primary" id="browse-empty-btn">
                                <i class="fas fa-upload"></i> Upload Resume
                            </button>
                        </div>
                    </div>
                    
                    <div class="resume-details-card">
                        <h3>Resume Details</h3>
                        <div class="resume-details-content">
                            <div class="empty-state">
                                <i class="fas fa-file-alt"></i>
                                <h4>No Resume Details</h4>
                                <p>Upload a resume to add details</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getResumeSectionWithFile() {
        const uploadedDate = this.currentResume ? new Date(this.currentResume.uploadedAt).toLocaleDateString() : 'N/A';
        const lastUpdated = this.resumeDetails.lastUpdated ? new Date(this.resumeDetails.lastUpdated).toLocaleDateString() : 'N/A';

        return `
            <div class="resume-section">
                <div class="resume-header">
                    <h2>Resume Management</h2>
                    <div class="resume-actions">
                        <button class="btn btn-primary" id="upload-resume-btn">
                            <i class="fas fa-upload"></i> Upload New
                        </button>
                        <button class="btn btn-success" id="view-resume-btn">
                            <i class="fas fa-eye"></i> View Resume
                        </button>
                        <button class="btn btn-info" id="download-resume-btn">
                            <i class="fas fa-download"></i> Download
                        </button>
                    </div>
                </div>
                
                <div class="resume-content">
                    <div class="resume-file-card">
                        <h3>Resume File</h3>
                        <div class="resume-preview has-resume">
                            <div class="resume-file-info">
                                <div class="resume-icon">
                                    <i class="fas fa-file-pdf"></i>
                                </div>
                                <div class="resume-details">
                                    <div class="resume-name">${this.currentResume.name}</div>
                                    <div class="resume-meta">
                                        ${this.formatFileSize(this.currentResume.size)} • 
                                        Uploaded: ${uploadedDate}
                                    </div>
                                </div>
                            </div>
                            <div class="resume-actions-buttons">
                                <button class="btn btn-primary" id="view-resume-btn">
                                    <i class="fas fa-eye"></i> View
                                </button>
                                <button class="btn btn-success" id="download-resume-btn">
                                    <i class="fas fa-download"></i> Download
                                </button>
                                <button class="btn btn-danger" id="delete-resume-btn">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="resume-details-card">
                        <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 20px;">
                            <h3 style="margin: 0;">Resume Details</h3>
                            <button class="btn btn-outline-primary" id="edit-resume-details-btn">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                        </div>
                        <div class="resume-details-content">
                            <div class="detail-item">
                                <span class="detail-label">Title:</span>
                                <span class="detail-value">${this.resumeDetails.title}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Version:</span>
                                <span class="detail-value">${this.resumeDetails.version}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Visibility:</span>
                                <span class="detail-value">
                                    <span class="badge ${this.resumeDetails.visibility === 'public' ? 'badge-success' : 'badge-secondary'}">
                                        ${this.resumeDetails.visibility}
                                    </span>
                                </span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Last Updated:</span>
                                <span class="detail-value">${lastUpdated}</span>
                            </div>
                            <div class="detail-item" style="align-items: flex-start;">
                                <span class="detail-label">Summary:</span>
                                <span class="detail-value" style="text-align: right; flex: 1;">
                                    ${this.resumeDetails.summary || 'No summary provided'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    viewResume() {
        if (!this.currentResume) {
            this.showNotification('No resume available to view', 'error');
            return;
        }

        const viewerModal = document.getElementById('view-resume-modal');
        const resumeIframe = document.getElementById('resume-iframe');
        const noResumeMessage = document.getElementById('no-resume-message');

        if (this.currentResume.type === 'application/pdf') {
            // For PDF files, we can display them directly
            resumeIframe.src = this.currentResume.data;
            resumeIframe.style.display = 'block';
            noResumeMessage.style.display = 'none';
        } else {
            // For other file types, show a message
            resumeIframe.style.display = 'none';
            noResumeMessage.style.display = 'block';
            noResumeMessage.innerHTML = `
                <i class="fas fa-file-alt" style="font-size: 48px; color: #6c757d; margin-bottom: 20px;"></i>
                <h3>Preview Not Available</h3>
                <p>Preview is only available for PDF files. Please download the file to view it.</p>
                <button class="btn btn-primary" onclick="resumeManager.downloadResume()">
                    <i class="fas fa-download"></i> Download Resume
                </button>
            `;
        }

        viewerModal.style.display = 'flex';
    }

    hideViewerModal() {
        document.getElementById('view-resume-modal').style.display = 'none';
        document.getElementById('resume-iframe').src = 'about:blank';
    }

    downloadResume() {
        if (!this.currentResume) {
            this.showNotification('No resume available to download', 'error');
            return;
        }

        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = this.currentResume.data;
        link.download = this.currentResume.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showNotification('Resume download started', 'success');
    }

    deleteResume() {
        if (!this.currentResume) return;

        if (confirm('Are you sure you want to delete your resume? This action cannot be undone.')) {
            // Clear from storage
            localStorage.removeItem('portfolioResume');
            this.currentResume = null;

            // Reset resume details
            this.resumeDetails.lastUpdated = null;
            this.saveResumeDetails();

            // Update UI
            this.updateResumeSection();

            this.showNotification('Resume deleted successfully', 'success');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification container if it doesn't exist
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${message}</div>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add to container
        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
}

// Initialize Resume Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.resumeManager = new ResumeManager();
});

// Enhanced initialization to work with dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for dashboard to initialize
    setTimeout(() => {
        window.resumeManager = new ResumeManager();
        
        // Update resume section if it's currently visible
        const resumeSection = document.getElementById('resume-section');
        if (resumeSection && resumeSection.style.display !== 'none') {
            window.resumeManager.updateResumeSection();
        }
        
        console.log('Resume Manager initialized successfully');
    }, 100);
});

// Make updateResumeSection method available globally
ResumeManager.prototype.updateResumeSection = function() {
    const resumeSection = document.getElementById('resume-section');
    if (!resumeSection) return;
    
    if (this.currentResume) {
        resumeSection.innerHTML = this.getResumeSectionWithFile();
    } else {
        resumeSection.innerHTML = this.getEmptyResumeSection();
    }
    
    // Re-attach event listeners for the new content
    this.attachResumeSectionListeners();
};

// Add this method to handle dynamic content events
ResumeManager.prototype.attachResumeSectionListeners = function() {
    // Attach listeners to dynamically created buttons
    const viewBtn = document.getElementById('view-resume-btn');
    const downloadBtn = document.getElementById('download-resume-btn');
    const deleteBtn = document.getElementById('delete-resume-btn');
    const editBtn = document.getElementById('edit-resume-details-btn');
    const uploadBtn = document.getElementById('upload-resume-btn');
    
    if (viewBtn) {
        viewBtn.addEventListener('click', () => this.viewResume());
    }
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => this.downloadResume());
    }
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => this.deleteResume());
    }
    if (editBtn) {
        editBtn.addEventListener('click', () => this.showEditResumeModal());
    }
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => this.showUploadModal());
    }
};