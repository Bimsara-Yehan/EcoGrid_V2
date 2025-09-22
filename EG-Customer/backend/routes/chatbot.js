const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Simple NLP function to determine intent and extract entities
const analyzeMessage = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Intent detection
    let intent = 'unknown';
    let confidence = 0.5;
    let entities = {};

    // Greeting patterns
    if (lowerMessage.match(/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/)) {
        intent = 'greeting';
        confidence = 0.9;
    }
    // Goodbye patterns
    else if (lowerMessage.match(/\b(bye|goodbye|see you|thanks|thank you)\b/)) {
        intent = 'goodbye';
        confidence = 0.9;
    }
    // Waste collection schedule
    else if (lowerMessage.match(/\b(when|what time|schedule|collection|pickup|collect)\b/)) {
        intent = 'waste_collection_schedule';
        confidence = 0.8;
        
        // Extract waste type
        if (lowerMessage.includes('plastic')) entities.wasteType = 'plastic';
        else if (lowerMessage.includes('glass')) entities.wasteType = 'glass';
        else if (lowerMessage.includes('kitchen') || lowerMessage.includes('food')) entities.wasteType = 'kitchen_waste';
        else if (lowerMessage.includes('polythene')) entities.wasteType = 'polythene';
        else if (lowerMessage.includes('mixed')) entities.wasteType = 'mixed';
        else if (lowerMessage.includes('bulk')) entities.wasteType = 'bulk';
        
        // Extract day
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
            if (lowerMessage.includes(day)) entities.day = day;
        });
    }
    // Recycling guidance
    else if (lowerMessage.match(/\b(recycle|recycling|dispose|throw away|can i|how to)\b/)) {
        intent = 'recycling_guidance';
        confidence = 0.8;
        
        // Extract item type
        const items = ['plastic', 'glass', 'paper', 'metal', 'electronics', 'battery', 'furniture'];
        items.forEach(item => {
            if (lowerMessage.includes(item)) entities.item = item;
        });
    }
    // Special collection request
    else if (lowerMessage.match(/\b(special|bulk|large|furniture|appliance|request|pickup)\b/)) {
        intent = 'special_collection_request';
        confidence = 0.7;
    }
    // Account help
    else if (lowerMessage.match(/\b(account|profile|password|login|signup|register)\b/)) {
        intent = 'account_help';
        confidence = 0.8;
    }
    // App navigation
    else if (lowerMessage.match(/\b(where|how|navigate|find|go to|screen|page)\b/)) {
        intent = 'app_navigation';
        confidence = 0.7;
    }

    return { intent, confidence, entities };
};

// Generate response based on intent
const generateResponse = (intent, entities, user) => {
    const responses = {
        greeting: [
            `Hello ${user.name}! 👋 I'm your EcoGrid assistant. How can I help you today?`,
            `Hi there! Welcome to EcoGrid. What would you like to know about waste collection?`,
            `Good day! I'm here to help with your waste management needs. What can I assist you with?`
        ],
        goodbye: [
            `You're welcome! Feel free to ask if you need any more help. Have a great day! 🌱`,
            `Happy to help! Remember to keep our environment clean. See you next time!`,
            `Take care! Don't hesitate to reach out if you have more questions.`
        ],
        waste_collection_schedule: (() => {
            const schedule = {
                monday: { type: 'Plastic', time: '08:00 - 12:00' },
                tuesday: { type: 'Glass', time: '08:00 - 12:00' },
                wednesday: { type: 'Kitchen Waste', time: '08:00 - 12:00' },
                thursday: { type: 'Polythene', time: '08:00 - 12:00' },
                friday: { type: 'Mixed Collection', time: '08:00 - 12:00' },
                saturday: { type: 'Bulk Items', time: '09:00 - 13:00' },
                sunday: { type: 'No Collection', time: 'Rest Day' }
            };

            if (entities.day) {
                const dayInfo = schedule[entities.day];
                return `${entities.day.charAt(0).toUpperCase() + entities.day.slice(1)}: ${dayInfo.type} collection from ${dayInfo.time}`;
            }
            if (entities.wasteType) {
                const day = Object.keys(schedule).find(d => 
                    schedule[d].type.toLowerCase().includes(entities.wasteType)
                );
                if (day) {
                    const dayInfo = schedule[day];
                    return `${entities.wasteType.charAt(0).toUpperCase() + entities.wasteType.slice(1)} is collected on ${day.charAt(0).toUpperCase() + day.slice(1)} from ${dayInfo.time}`;
                }
            }
            return `Here's our weekly collection schedule:
• Monday: Plastic (08:00 - 12:00)
• Tuesday: Glass (08:00 - 12:00)  
• Wednesday: Kitchen Waste (08:00 - 12:00)
• Thursday: Polythene (08:00 - 12:00)
• Friday: Mixed Collection (08:00 - 12:00)
• Saturday: Bulk Items (09:00 - 13:00)
• Sunday: No Collection (Rest Day)`;
        })(),
        recycling_guidance: (() => {
            if (entities.item) {
                const guidance = {
                    plastic: 'Plastic items should be clean and dry. Remove labels and caps. Collected every Monday.',
                    glass: 'Glass bottles and jars should be clean with labels removed. Collected every Tuesday.',
                    paper: 'Paper and cardboard should be dry and clean. Can be included in mixed collection on Friday.',
                    metal: 'Metal cans should be clean and empty. Can be included in mixed collection on Friday.',
                    electronics: 'Electronic waste requires special collection. Use the special collection request feature.',
                    battery: 'Batteries are hazardous waste. Please use special collection or take to designated drop-off points.',
                    furniture: 'Large furniture items require special collection. Use the special collection request feature.'
                };
                return guidance[entities.item] || 'Please check our recycling guide for detailed information about this item.';
            }
            return `I can help you with recycling guidance! Here are some general tips:
• Clean items before recycling
• Remove labels and caps
• Check our recycling guide for specific items
• Use special collection for large or hazardous items`;
        })(),
        special_collection_request: `For special collection requests (bulk items, furniture, appliances), please:
1. Go to the Waste Collection page
2. Scroll down to "Need Special Collection?"
3. Fill out the request form
4. We'll contact you within 24 hours

This service is available for items that don't fit in regular collection.`,
        account_help: `I can help with account-related questions:
• Profile updates: Go to Profile page
• Password changes: Use Change Password option
• Account deletion: Available in Preferences
• Need more help? Contact our support team`,
        app_navigation: `Here are the main sections of EcoGrid:
• Dashboard: Overview and quick stats
• Waste Collection: Schedule and special requests
• Recycling Guide: How to recycle different items
• Tasks: Your assigned tasks and progress
• Reports: Submit issues or feedback
• Profile: Manage your account settings`,
        unknown: `I'm not sure I understand that question. I can help you with:
• Waste collection schedules
• Recycling guidance
• Special collection requests
• Account help
• App navigation

Could you rephrase your question?`
    };

    return responses[intent] || responses.unknown;
};

// Generate quick actions based on intent
const generateQuickActions = (intent, entities) => {
    const actions = {
        waste_collection_schedule: [
            { text: 'View Full Schedule', action: 'navigate', url: '/waste-collection' }
        ],
        recycling_guidance: [
            { text: 'Recycling Guide', action: 'navigate', url: '/recycling-guide' }
        ],
        special_collection_request: [
            { text: 'Request Special Collection', action: 'navigate', url: '/waste-collection' }
        ],
        account_help: [
            { text: 'Go to Profile', action: 'navigate', url: '/profile' }
        ],
        app_navigation: [
            { text: 'Go to Dashboard', action: 'navigate', url: '/dashboard' }
        ]
    };

    return actions[intent] || [];
};

// @route   POST /api/chatbot/message
// @desc    Send message to chatbot
// @access  Private
router.post('/message', auth, async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ message: 'Message cannot be empty' });
        }

        // Analyze the message
        const analysis = analyzeMessage(message);
        
        // Generate response
        const response = generateResponse(analysis.intent, analysis.entities, req.user);
        
        // Generate quick actions
        const quickActions = generateQuickActions(analysis.intent, analysis.entities);

        // Create chat message record
        const chatMessage = new ChatMessage({
            user: req.user.id,
            message: message.trim(),
            response,
            intent: analysis.intent,
            confidence: analysis.confidence,
            quickActions,
            sessionId: sessionId || uuidv4()
        });

        await chatMessage.save();

        res.json({
            response,
            intent: analysis.intent,
            confidence: analysis.confidence,
            quickActions,
            sessionId: chatMessage.sessionId,
            messageId: chatMessage._id
        });
    } catch (error) {
        console.error('Error processing chatbot message:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/chatbot/history
// @desc    Get chat history for user
// @access  Private
router.get('/history', auth, async (req, res) => {
    try {
        const { limit = 20, sessionId } = req.query;
        
        let query = { user: req.user.id };
        if (sessionId) {
            query.sessionId = sessionId;
        }

        const history = await ChatMessage.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('message response intent createdAt sessionId')
            .lean();

        res.json(history.reverse()); // Return in chronological order
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/chatbot/feedback
// @desc    Submit feedback for a chat message
// @access  Private
router.post('/feedback', auth, async (req, res) => {
    try {
        const { messageId, rating, comment } = req.body;

        if (!messageId || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Invalid feedback data' });
        }

        const chatMessage = await ChatMessage.findOne({
            _id: messageId,
            user: req.user.id
        });

        if (!chatMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }

        chatMessage.feedback = {
            rating,
            comment: comment || '',
            submittedAt: new Date()
        };

        await chatMessage.save();

        res.json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/chatbot/sessions
// @desc    Get chat sessions for user
// @access  Private
router.get('/sessions', auth, async (req, res) => {
    try {
        const sessions = await ChatMessage.aggregate([
            { $match: { user: req.user._id } },
            {
                $group: {
                    _id: '$sessionId',
                    lastMessage: { $max: '$createdAt' },
                    messageCount: { $sum: 1 },
                    firstMessage: { $min: '$createdAt' }
                }
            },
            { $sort: { lastMessage: -1 } },
            { $limit: 10 }
        ]);

        res.json(sessions);
    } catch (error) {
        console.error('Error fetching chat sessions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/chatbot/history
// @desc    Clear chat history for user
// @access  Private
router.delete('/history', auth, async (req, res) => {
    try {
        const { sessionId } = req.query;
        
        let query = { user: req.user.id };
        if (sessionId) {
            query.sessionId = sessionId;
        }

        await ChatMessage.deleteMany(query);

        res.json({ message: 'Chat history cleared successfully' });
    } catch (error) {
        console.error('Error clearing chat history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;











