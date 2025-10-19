// AI Chatbot Integration - COMPLETE WORKING VERSION
class PortfolioChatbot {
    constructor() {
        this.isOpen = false;
        this.isWhatsAppOpen = false;
        this.chatHistory = [];
        this.portfolioData = null;
        this.aiIntegration = new AdvancedAIIntegration();
        this.init();
    }

    async init() {
        // Load portfolio data first
        await this.loadPortfolioData();
        this.setupEventListeners();
        this.loadChatHistory();
        this.initializeWelcomeMessage();
    }

    async loadPortfolioData() {
        try {
            // Try to get data from portfolioData manager
            if (typeof portfolioData !== 'undefined') {
                await portfolioData.ensureDataLoaded();
                this.portfolioData = portfolioData.data;
            } else {
                // Fallback: Load from localStorage
                const savedData = localStorage.getItem('portfolioData');
                if (savedData) {
                    this.portfolioData = JSON.parse(savedData);
                }
            }
            console.log('Portfolio data loaded for chatbot:', this.portfolioData);
        } catch (error) {
            console.error('Error loading portfolio data for chatbot:', error);
        }
    }

    initializeWelcomeMessage() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (messagesContainer && messagesContainer.children.length === 0) {
            const profile = this.portfolioData?.profile || {};
            //const welcomeName = profile.name ? `, ${profile.name.split(' ')[0]}` : '';//
            
            const welcomeHTML = `
                <div class="chat-message bot-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <p>Hello Sir ! I'm Ankit Kumar portfolio assistant. I can tell you about:</p>
                        <ul>
                            <li>👤 profile information</li>
                            <li>💼 Work experience</li>
                            <li>🎓 Education background</li>
                            <li>🛠️ Technical skills</li>
                            <li>📂 Projects portfolio</li>
                            <li>🏆 Certifications</li>
                            <li>📝 Resume details</li>
                        </ul>
                        <p>What would you like to know about?</p>
                    </div>
                </div>
            `;
            messagesContainer.innerHTML = welcomeHTML;
        }

        const whatsappContainer = document.getElementById('whatsappMessages');
        if (whatsappContainer && whatsappContainer.children.length === 0) {
            const whatsappHTML = `
                <div class="chat-message bot-message">
                    <div class="message-avatar">
                        <i class="fab fa-whatsapp"></i>
                    </div>
                    <div class="message-content">
                        <p>Hi! Send me a quick message and I'll get back to you on WhatsApp.</p>
                    </div>
                </div>
            `;
            whatsappContainer.innerHTML = whatsappHTML;
        }
    }

    setupEventListeners() {
        // Chatbot toggle
        const chatbotToggle = document.getElementById('chatbotToggle');
        const chatbotClose = document.getElementById('chatbotClose');
        const chatbotSend = document.getElementById('chatbotSend');
        const chatbotInput = document.getElementById('chatbotInput');

        // WhatsApp toggle
        const whatsappToggle = document.getElementById('whatsappToggle');
        const whatsappClose = document.getElementById('whatsappClose');
        const whatsappSend = document.getElementById('whatsappSend');
        const whatsappInput = document.getElementById('whatsappInput');

        if (chatbotToggle) chatbotToggle.addEventListener('click', () => this.toggleChatbot());
        if (chatbotClose) chatbotClose.addEventListener('click', () => this.toggleChatbot());
        if (chatbotSend) chatbotSend.addEventListener('click', () => this.sendChatbotMessage());
        if (chatbotInput) chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatbotMessage();
        });

        if (whatsappToggle) whatsappToggle.addEventListener('click', () => this.toggleWhatsApp());
        if (whatsappClose) whatsappClose.addEventListener('click', () => this.toggleWhatsApp());
        if (whatsappSend) whatsappSend.addEventListener('click', () => this.sendWhatsAppMessage());
        if (whatsappInput) whatsappInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendWhatsAppMessage();
        });

        // Close chatbots when clicking outside
        document.addEventListener('click', (e) => {
            const chatbot = document.getElementById('chatbotWidget');
            const whatsapp = document.getElementById('whatsappWidget');
            
            if (chatbot && !chatbot.contains(e.target) && !e.target.closest('#chatbotToggle')) {
                this.closeChatbot();
            }
            if (whatsapp && !whatsapp.contains(e.target) && !e.target.closest('#whatsappToggle')) {
                this.closeWhatsApp();
            }
        });
    }

    toggleChatbot() {
        const chatbotWidget = document.getElementById('chatbotWidget');
        if (!chatbotWidget) return;

        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            chatbotWidget.classList.add('active');
            document.getElementById('chatbotInput')?.focus();
            this.closeWhatsApp(); // Close WhatsApp if open
        } else {
            chatbotWidget.classList.remove('active');
        }
    }

    closeChatbot() {
        const chatbotWidget = document.getElementById('chatbotWidget');
        if (chatbotWidget) {
            chatbotWidget.classList.remove('active');
            this.isOpen = false;
        }
    }

    toggleWhatsApp() {
        const whatsappWidget = document.getElementById('whatsappWidget');
        if (!whatsappWidget) return;

        this.isWhatsAppOpen = !this.isWhatsAppOpen;
        
        if (this.isWhatsAppOpen) {
            whatsappWidget.classList.add('active');
            document.getElementById('whatsappInput')?.focus();
            this.closeChatbot(); // Close chatbot if open
        } else {
            whatsappWidget.classList.remove('active');
        }
    }

    closeWhatsApp() {
        const whatsappWidget = document.getElementById('whatsappWidget');
        if (whatsappWidget) {
            whatsappWidget.classList.remove('active');
            this.isWhatsAppOpen = false;
        }
    }

    async sendChatbotMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input?.value.trim();
        
        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        if (input) input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get response
            const response = await this.getDynamicResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            console.error('Error getting response:', error);
            this.hideTypingIndicator();
            this.addMessage("I'm having trouble right now. Please try again later.", 'bot');
        }
    }

    sendWhatsAppMessage() {
        const input = document.getElementById('whatsappInput');
        const message = input?.value.trim();
        
        if (!message) return;

        // Add user message to WhatsApp UI
        this.addWhatsAppMessage(message, 'user');
        if (input) input.value = '';

        // Get WhatsApp number from portfolio data or use default
        const phoneNumber = this.portfolioData?.profile?.phone || '+91 9155892986';
        const encodedMessage = encodeURIComponent(message);
        
        // Open WhatsApp with pre-filled message
        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    }

    async getDynamicResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Ensure we have the latest data
        await this.loadPortfolioData();
        
        // Check for specific data queries first
        if (this.containsAny(lowerMessage, ['profile', 'about', 'who are you', 'introduce', 'background'])) {
            return this.getProfileResponse();
        }
        else if (this.containsAny(lowerMessage, ['experience', 'work', 'job', 'career', 'employed'])) {
            return this.getExperienceResponse();
        }
        else if (this.containsAny(lowerMessage, ['education', 'degree', 'study', 'college', 'university'])) {
            return this.getEducationResponse();
        }
        else if (this.containsAny(lowerMessage, ['skill', 'technology', 'tech', 'programming', 'language'])) {
            return this.getSkillsResponse();
        }
        else if (this.containsAny(lowerMessage, ['project', 'portfolio', 'work sample', 'github'])) {
            return this.getProjectsResponse();
        }
        else if (this.containsAny(lowerMessage, ['certificate', 'certification', 'cert', 'award'])) {
            return this.getCertificatesResponse();
        }
        else if (this.containsAny(lowerMessage, ['resume', 'cv', 'download', 'hire', 'contact'])) {
            return this.getResumeResponse();
        }
        else if (this.containsAny(lowerMessage, ['hello', 'hi', 'hey'])) {
            return this.getGreetingResponse();
        }
        else if (this.containsAny(lowerMessage, ['help', 'what can you do', 'support'])) {
            return this.getHelpResponse();
        }
        else {
            // Use AI for general questions and advice
            return await this.getAIEnhancedResponse(message);
        }
    }

    async getAIEnhancedResponse(message) {
        try {
            // Add portfolio context to AI query
            const portfolioContext = this.getPortfolioContext();
            const enhancedMessage = `${message}\n\nCandidate Portfolio Context:\n${portfolioContext}`;
            
            // Get AI response
            const aiResponse = await this.aiIntegration.getAIResponse(enhancedMessage);
            return aiResponse;
        } catch (error) {
            console.error('AI response failed:', error);
            // Fallback to default response
            return this.getDefaultResponse();
        }
    }

    getPortfolioContext() {
        if (!this.portfolioData) return "No portfolio data available.";
        
        const profile = this.portfolioData.profile || {};
        const skills = this.portfolioData.skills || [];
        const experience = this.portfolioData.experience || [];
        
        let context = `Candidate: ${profile.name || 'Not specified'}\n`;
        context += `Title: ${profile.title || 'Not specified'}\n`;
        context += `Skills: ${skills.slice(0, 10).join(', ')}\n`;
        context += `Experience: ${experience.length} positions\n`;
        
        if (profile.bio) {
            context += `Bio: ${profile.bio.substring(0, 200)}...\n`;
        }
        
        return context;
    }

    // DYNAMIC RESPONSE METHODS
    getProfileResponse() {
        const profile = this.portfolioData?.profile;
        if (!profile || !profile.name) {
            return "I don't have Ankit Kumar profile information yet. Please check back later.";
        }

        let response = `Here's Ankit Kumar profile information:\n\n`;
        response += `**Name:** ${profile.name}\n`;
        if (profile.title) response += `**Title:** ${profile.title}\n`;
        if (profile.email) response += `**Email:** ${profile.email}\n`;
        if (profile.phone) response += `**Phone:** ${profile.phone}\n`;
        if (profile.bio) response += `**Bio:** ${profile.bio}\n`;
        
        if (profile.linkedin || profile.github || profile.website) {
            response += `\n**Links:**\n`;
            if (profile.linkedin) response += `• LinkedIn: ${profile.linkedin}\n`;
            if (profile.github) response += `• GitHub: ${profile.github}\n`;
            if (profile.website) response += `• Website: ${profile.website}\n`;
        }

        return response;
    }

    getExperienceResponse() {
        const experiences = this.portfolioData?.experience || [];
        if (experiences.length === 0) {
            return " Ankit haven't added any work experience yet..";
        }

        let response = `Ankit kumar  work experience:\n\n`;
        experiences.forEach((exp, index) => {
            response += `**${index + 1}. ${exp.title}**\n`;
            response += `   Company: ${exp.company}\n`;
            response += `   Period: ${this.formatDateRange(exp.startDate, exp.endDate, exp.current)}\n`;
            if (exp.description) response += `   Description: ${exp.description}\n`;
            response += `\n`;
        });

        const totalExperience = this.calculateTotalExperience(experiences);
        response += `**Total Experience:** ${totalExperience} years`;

        return response;
    }

    getEducationResponse() {
        const education = this.portfolioData?.education || [];
        if (education.length === 0) {
            return "Ankit hasn't added any education details yet.." ;
        }

        let response = `Ankit kumar  education background:\n\n`;
        education.forEach((edu, index) => {
            response += `**${index + 1}. ${edu.degree}**\n`;
            response += `   Institution: ${edu.institution}\n`;
            response += `   Period: ${this.formatDateRange(edu.startDate, edu.endDate, edu.current)}\n`;
            if (edu.description) response += `   Details: ${edu.description}\n`;
            response += `\n`;
        });

        return response;
    }

    getSkillsResponse() {
        const skills = this.portfolioData?.skills || [];
        if (skills.length === 0) {
            return "Ankit  hasn't added any skills yet. ";
        }

        let response = `Ankit kumar  technical skills (${skills.length} skills):\n\n`;
        
        skills.forEach((skill, index) => {
            response += `• ${skill}\n`;
        });

        response += `\nAnkit kumar  have a strong skill set with ${skills.length} technologies listed.`;

        return response;
    }

    getProjectsResponse() {
        const projects = this.portfolioData?.projects || [];
        if (projects.length === 0) {
            return "Ankit hasn't added any projects yet. ";
        }

        let response = `Ankit kumar  portfolio projects (${projects.length} projects):\n\n`;
        projects.forEach((project, index) => {
            response += `**${index + 1}. ${project.title}**\n`;
            if (project.description) response += `   Description: ${project.description}\n`;
            if (project.technologies && project.technologies.length > 0) {
                response += `   Technologies: ${project.technologies.join(', ')}\n`;
            }
            response += `\n`;
        });

        return response;
    }

    getCertificatesResponse() {
        const certificates = this.portfolioData?.certificates || [];
        if (certificates.length === 0) {
            return "Ankit  hasn't added any certificates yet..";
        }

        let response = `Ankit kumar's  certifications (${certificates.length} certificates):\n\n`;
        certificates.forEach((cert, index) => {
            response += `**${index + 1}. ${cert.name}**\n`;
            if (cert.organization) response += `   Issued by: ${cert.organization}\n`;
            response += `\n`;
        });

        return response;
    }

    getResumeResponse() {
        const profile = this.portfolioData?.profile;
        const stats = this.portfolioData?.stats || {};
        
        let response = `Resume Information:\n\n`;
        response += `You can download Ankit Kumar Singh's resume from Download button on Homepage   And also can view the resume by clicking on View Resume.\n`;
        response += `**Resumes uploaded:** ${stats.resumes || 0}\n`;
        
        if (profile) {
            response += `\n**Contact Information:**\n`;
            response += `• Email: ${profile.email || 'Not provided'}\n`;
            response += `• Phone: ${profile.phone || 'Not provided'}\n`;
            if (profile.linkedin) response += `• LinkedIn: ${profile.linkedin}\n`;
        }

        response += `\nFeel free to reach out for opportunities!`;

        return response;
    }

    getGreetingResponse() {
        const profile = this.portfolioData?.profile;
        const name = profile?.name ? profile.name.split(' ')[0] : 'there';
        
        return `Hello Sir! I'm Ankit Kumar portfolio assistant. I can tell you about Ankit's profile, experience, skills, projects, and more. What would you like to know?`;
    }

    getHelpResponse() {
        return `I can help you with information about Ankit kumar singh's portfolio:\n\n` +
               `• **Profile**: Your personal and contact information\n` +
               `• **Experience**: Work history and career details\n` +
               `• **Education**: Academic background\n` +
               `• **Skills**: Technical and professional skills\n` +
               `• **Projects**: Portfolio projects and work samples\n` +
               `• **Certificates**: Certifications and awards\n` +
               `• **Resume**: Download and contact information\n\n` +
               `Just ask me about any of these topics!`;
    }

    getDefaultResponse() {
        return "I can tell you about Ankit kumar  portfolio data including profile, experience, education, skills, projects, and certificates. What specific information would you like to know?";
    }

    // UTILITY METHODS
    containsAny(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }

    formatDateRange(startDate, endDate, current) {
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

    calculateTotalExperience(experiences) {
        let totalMonths = 0;
        
        experiences.forEach(exp => {
            const start = new Date(exp.startDate);
            const end = exp.current ? new Date() : new Date(exp.endDate);
            const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
            totalMonths += Math.max(0, months);
        });
        
        return Math.floor(totalMonths / 12);
    }

    addMessage(message, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        
        const avatar = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                ${avatar}
            </div>
            <div class="message-content">
                <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Save to chat history
        this.chatHistory.push({ message, sender, timestamp: new Date().toISOString() });
        this.saveChatHistory();
    }

    addWhatsAppMessage(message, sender) {
        const messagesContainer = document.getElementById('whatsappMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        
        const avatar = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fab fa-whatsapp"></i>';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                ${avatar}
            </div>
            <div class="message-content">
                <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'chat-message bot-message typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    saveChatHistory() {
        try {
            localStorage.setItem('portfolioChatHistory', JSON.stringify(this.chatHistory));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    loadChatHistory() {
        try {
            const savedHistory = localStorage.getItem('portfolioChatHistory');
            if (savedHistory) {
                this.chatHistory = JSON.parse(savedHistory);
                
                // Optionally restore last few messages to UI
                const recentMessages = this.chatHistory.slice(-10); // Last 10 messages
                recentMessages.forEach(msg => {
                    this.addMessage(msg.message, msg.sender);
                });
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.portfolioChatbot = new PortfolioChatbot();
});