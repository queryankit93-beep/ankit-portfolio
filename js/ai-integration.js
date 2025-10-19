// Advanced AI Integration
class AdvancedAIIntegration {
    constructor() {
        this.apiKey = ''; // Set your AI API key here
        this.apiUrl = 'https://api.openai.com/v1/chat/completions'; // OpenAI endpoint
    }

        async getAIResponse(message) {
        // For production, use actual AI API
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a helpful portfolio assistant for a candidate. 
                                    Provide concise, helpful advice about their portfolio, career development, and technical skills.
                                    Use the provided portfolio context to give personalized responses.
                                    Keep responses under 150 words and focused on portfolio improvement, career advice, or technical guidance.`
                        },
                        {
                            role: 'user',
                            content: message
                        }
                    ],
                    max_tokens: 150,
                    temperature: 0.7
                })
            });

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('AI API Error:', error);
            return this.getFallbackResponse(message);
        }
    }

    getFallbackResponse(message) {
        // Fallback responses when AI is unavailable
        const fallbackResponses = {
            'hello': 'Hello! I\'m Ankit kumar  portfolio assistant. How can I help you today?',
            'hi': 'Hi there! I\'m here to help with Ankit kumar  portfolio and career questions.',
            'help': 'I can assist with:\n• Portfolio optimization\n• Career advice\n• Technical guidance\n• Resume tips\nWhat do you need help with?',
            'default': 'Thanks for your message! Feel free to ask anything about Ankit portfolio . Could you tell me more about what you\'re looking for?'
        };

        const lowerMessage = message.toLowerCase();
        for (const [keyword, response] of Object.entries(fallbackResponses)) {
            if (lowerMessage.includes(keyword)) {
                return response;
            }
        }

        return fallbackResponses.default;
    }
}

// Export for use in other files
window.AdvancedAIIntegration = AdvancedAIIntegration;