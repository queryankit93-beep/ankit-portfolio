const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// WhatsApp Client Setup
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Generate QR Code for WhatsApp
client.on('qr', (qr) => {
    console.log('📱 Scan this QR code with your WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp client is ready!');
});

client.on('authenticated', () => {
    console.log('✅ WhatsApp authenticated!');
});

client.on('auth_failure', msg => {
    console.error('❌ WhatsApp authentication failed:', msg);
});

// Initialize WhatsApp
client.initialize();

// Email transporter setup
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER || 'your-email@gmail.com',
        pass: process.env.GMAIL_PASS || 'your-app-password'
    }
});

// Function to send WhatsApp notification
async function sendWhatsAppNotification(phoneNumber, message) {
    try {
        const chatId = `${phoneNumber}@c.us`;
        await client.sendMessage(chatId, message);
        console.log('✅ WhatsApp notification sent!');
        return { success: true };
    } catch (error) {
        console.error('❌ WhatsApp error:', error);
        return { success: false, error: error.message };
    }
}

// Function to send email notification
async function sendEmailNotification(subject, message) {
    try {
        await emailTransporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER,
            subject: subject,
            text: message,
            html: `<div>${message.replace(/\n/g, '<br>')}</div>`
        });
        console.log('✅ Email notification sent!');
        return { success: true };
    } catch (error) {
        console.error('❌ Email error:', error);
        return { success: false, error: error.message };
    }
}

// API Route for chat notifications
app.post('/api/chat-notification', async (req, res) => {
    const { name, email, phone, message, userPhone } = req.body;
    
    const whatsappMessage = `🚀 New Chat Message!\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}\n\nTime: ${new Date().toLocaleString()}`;
    
    const emailSubject = `New Chat from ${name}`;
    const emailMessage = `New chat message received:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}\n\nTime: ${new Date().toLocaleString()}`;

    try {
        // Send WhatsApp notification
        if (userPhone) {
            await sendWhatsAppNotification(userPhone, whatsappMessage);
        }
        
        // Send email notification
        await sendEmailNotification(emailSubject, emailMessage);
        
        res.json({ 
            success: true, 
            message: 'Notifications sent successfully!' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// API Route for contact form notifications
app.post('/api/contact-notification', async (req, res) => {
    const { name, email, subject, message, userPhone } = req.body;
    
    const whatsappMessage = `📧 New Contact Form!\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}\n\nTime: ${new Date().toLocaleString()}`;
    
    const emailSubject = `New Contact: ${subject}`;
    const emailMessage = `New contact form submission:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}\n\nTime: ${new Date().toLocaleString()}`;

    try {
        if (userPhone) {
            await sendWhatsAppNotification(userPhone, whatsappMessage);
        }
        await sendEmailNotification(emailSubject, emailMessage);
        
        res.json({ success: true, message: 'Notifications sent!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check route
app.get('/', (req, res) => {
    res.json({ 
        status: 'Server is running!', 
        whatsapp: client.info ? 'Connected' : 'Connecting...'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Access via: http://localhost:${PORT}`);
});