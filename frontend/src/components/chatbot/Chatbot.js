import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  ThumbsUp, 
  ThumbsDown,
  RotateCcw,
  Trash2,
  Minimize2,
  Maximize2
} from 'lucide-react';
import axios from 'axios';

const Chatbot = () => {
  const { user, token } = useAuth();
  const { isDarkMode } = useTheme();
  const { getString } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showFeedback, setShowFeedback] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Load chat history on mount
  useEffect(() => {
    if (isOpen && user) {
      loadChatHistory();
    }
  }, [isOpen, user]);

  const loadChatHistory = async () => {
    try {
      const response = await axios.get('/api/chatbot/history', {
        headers: { 'x-auth-token': token },
        params: { limit: 20, sessionId }
      });
      
      setMessages(response.data);
      if (response.data.length > 0 && !sessionId) {
        setSessionId(response.data[0].sessionId);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chatbot/message', {
        message: inputMessage.trim(),
        sessionId
      }, {
        headers: { 'x-auth-token': token }
      });

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: response.data.response,
        intent: response.data.intent,
        confidence: response.data.confidence,
        quickActions: response.data.quickActions,
        timestamp: new Date(),
        messageId: response.data.messageId
      };

      setMessages(prev => [...prev, botMessage]);
      
      if (!sessionId) {
        setSessionId(response.data.sessionId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    if (action.action === 'navigate') {
      // Navigate to the specified URL
      window.location.href = action.url;
    }
  };

  const submitFeedback = async (messageId, rating) => {
    try {
      await axios.post('/api/chatbot/feedback', {
        messageId,
        rating
      }, {
        headers: { 'x-auth-token': token }
      });
      
      setShowFeedback(null);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const clearHistory = async () => {
    try {
      await axios.delete('/api/chatbot/history', {
        headers: { 'x-auth-token': token },
        params: { sessionId }
      });
      
      setMessages([]);
      setSessionId(null);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Hello';
    
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    
    return `${greeting}! I'm your EcoGrid assistant. How can I help you today?`;
  };

  // Show greeting if no messages
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = {
        id: 'greeting',
        type: 'bot',
        message: getGreetingMessage(),
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 p-3 sm:p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
          isDarkMode 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
        title="Chat with EcoGrid Assistant"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-72 sm:w-80 h-16' : 'w-80 sm:w-96 h-[400px] sm:h-[500px]'
    }`}>
      {/* Chat Header */}
      <div className={`flex items-center justify-between p-4 rounded-t-lg ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-green-600 text-white'
      }`}>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="font-medium">EcoGrid Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Messages */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          } border-l border-r border-gray-200`} style={{ height: '350px' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-green-500 text-white'
                  }`}>
                    {msg.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  
                  {/* Message */}
                  <div className={`rounded-lg p-3 ${
                    msg.type === 'user'
                      ? isDarkMode 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-500 text-white'
                      : isDarkMode 
                        ? 'bg-gray-700 text-gray-100' 
                        : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    
                    {/* Quick Actions */}
                    {msg.quickActions && msg.quickActions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.quickActions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickAction(action)}
                            className={`block w-full text-left px-2 py-1 rounded text-xs ${
                              isDarkMode 
                                ? 'bg-gray-600 hover:bg-gray-500 text-gray-100' 
                                : 'bg-white hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            {action.text}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Feedback */}
                    {msg.type === 'bot' && msg.messageId && (
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          onClick={() => submitFeedback(msg.messageId, 5)}
                          className="p-1 hover:bg-white/20 rounded"
                          title="Good response"
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => submitFeedback(msg.messageId, 1)}
                          className="p-1 hover:bg-white/20 rounded"
                          title="Poor response"
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    
                    <p className="text-xs opacity-70 mt-1">{formatTime(msg.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className={`rounded-lg p-3 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className={`p-4 border-t ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } rounded-b-lg`}>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me about waste collection, recycling, or anything else..."
                className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className={`p-2 rounded-lg transition-colors ${
                  inputMessage.trim() && !isLoading
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            
            {/* Chat Actions */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                  title="Clear chat history"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </button>
                <button
                  onClick={loadChatHistory}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                  title="Reload chat history"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reload
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Powered by EcoGrid AI
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;











