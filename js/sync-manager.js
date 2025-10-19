// Sync Manager for real-time updates between admin and homepage
class SyncManager {
    constructor() {
        this.isAdmin = window.location.pathname.includes('dashboard') || 
                      window.location.pathname.includes('admin');
        this.init();
    }
    
    init() {
        console.log('Sync Manager initialized for:', this.isAdmin ? 'Admin' : 'Homepage');
        
        // Listen for storage changes (for cross-tab communication)
        window.addEventListener('storage', (e) => {
            if (e.key === 'portfolioData' && e.newValue) {
                console.log('Data change detected via storage event');
                this.handleDataUpdate(JSON.parse(e.newValue));
            }
        });
        
        // Poll for changes (fallback)
        this.startPolling();
    }
    
    startPolling() {
        setInterval(() => {
            this.checkForUpdates();
        }, 5000); // Check every 5 seconds
    }
    
    async checkForUpdates() {
        try {
            const savedData = localStorage.getItem('portfolioData');
            if (savedData) {
                const latestData = JSON.parse(savedData);
                const currentData = portfolioData.data;
                
                // Compare with current data and update if different
                if (JSON.stringify(latestData) !== JSON.stringify(currentData)) {
                    console.log('Data change detected via polling');
                    this.handleDataUpdate(latestData);
                }
            }
        } catch (error) {
            console.log('Polling check failed:', error);
        }
    }
    
    handleDataUpdate(newData) {
        console.log('Data updated, refreshing UI...');
        portfolioData.data = newData;
        
        // Update UI based on current page
        if (this.isAdmin) {
            // Refresh current admin section
            const activeSection = document.querySelector('.menu-item.active');
            if (activeSection) {
                const section = activeSection.getAttribute('data-section');
                if (typeof showSection === 'function') {
                    showSection(section);
                }
            }
        } else {
            // Refresh homepage
            if (typeof updateAllSections === 'function') {
                updateAllSections();
            }
        }
    }
    
    // Method to trigger updates from admin
    triggerUpdate() {
        // Update localStorage to trigger storage event
        const currentData = JSON.stringify(portfolioData.data);
        localStorage.setItem('portfolioData', currentData);
        
        console.log('Update triggered by admin');
    }
}

// Initialize sync manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.syncManager = new SyncManager();
});