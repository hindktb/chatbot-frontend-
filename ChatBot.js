import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSpinner, faRobot, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { getSocket, isConnected } from '../services/socket';
import { checkHealth } from '../services/api';
import ChatMessage from './ChatMessage';
import './ChatBot.css';

// Suggested questions
const SUGGESTED_QUESTIONS = [
  { id: 1, label: 'Congés', question: 'Quelles sont les règles concernant les congés annuels ?' },
  { id: 2, label: 'RTT', question: 'Comment fonctionne le calcul des RTT ?' },
  { id: 3, label: 'Télétravail', question: 'Quelle est la politique de télétravail ?' },
  { id: 4, label: 'Assurance', question: 'Quels sont les avantages de la mutuelle santé ?' },
  { id: 5, label: 'Notes de frais', question: 'Comment faire une demande de notes de frais ?' },
  { id: 6, label: 'Formation', question: 'Quelles formations sont disponibles ?' },
];

function ChatBot({ onNewMessage, onFirstMessage }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [healthStatus, setHealthStatus] = useState('checking');
  const [executionTime, setExecutionTime] = useState(null);
  const messagesEndRef = useRef(null);

  // Initial bot message
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: ' Bonjour, je suis votre assistant RH. En quoi puis-je vous aider aujourd\'hui ?',
        timestamp: new Date(),
        isInitial: true
      }
    ]);
  }, []);

  // Health check
  useEffect(() => {
    const checkBackendHealth = async () => {
      const health = await checkHealth();
      setHealthStatus(health.status === 'healthy' ? 'healthy' : 'unhealthy');
    };
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    if (onFirstMessage) onFirstMessage();

    const userMessage = { role: 'user', content: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);
    setExecutionTime(null);

    handleWebSocketQuery(query);
  };

  const handleSuggestionClick = (suggestion) => {
    if (loading) return;
    setQuery(suggestion.question);
    
    // Auto-submit
    const userMessage = { role: 'user', content: suggestion.question, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setExecutionTime(null);

    if (onFirstMessage) onFirstMessage();
    handleWebSocketQuery(suggestion.question);
  };

  const handleWebSocketQuery = (queryText) => {
    const socket = getSocket();
    let fullResponse = '';

    socket.emit('chat_query', { query: queryText });

    socket.on('stream_token', (data) => {
      fullResponse += data.token;
      setIsTyping(true);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.isStreaming) {
          lastMsg.content = fullResponse;
          return newMessages;
        } else {
          return [...newMessages, { role: 'assistant', content: fullResponse, isStreaming: true, timestamp: new Date() }];
        }
      });
    });

    socket.on('stream_end', (data) => {
      setIsTyping(false);
      setLoading(false);
      
      if (data.execution_time) {
        setExecutionTime(data.execution_time);
      }

      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg && lastMsg.isStreaming) {
          lastMsg.isStreaming = false;
          lastMsg.sources = data.sources || [];
          lastMsg.similarityScore = data.similarity_score || 0;
          lastMsg.executionTime = data.execution_time;
        }
        return newMessages;
      });

      onNewMessage(queryText, { 
        answer: fullResponse, 
        sources: data.sources,
        execution_time: data.execution_time 
      });
    });

    socket.on('chat_error', (data) => {
      setIsTyping(false);
      setLoading(false);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Erreur: ${data.error}`, 
        isError: true, 
        timestamp: new Date() 
      }]);
    });
  };

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <div className="header-info">
          <img src="/logo_lmv.png" alt="LMV" className="header-logo" />
          <div>
            <h1>Assistant RH</h1>
            <p className="header-subtitle">Posez vos questions sur les ressources humaines</p>
          </div>
        </div>
        <div className="header-controls">
          {executionTime && (
            <div className="execution-time">
              Temps: {executionTime}s
            </div>
          )}
          <div className={`health-indicator ${healthStatus}`}>
            <span className="dot"></span>
            {healthStatus === 'healthy' ? 'Connecté' : 'Déconnecté'}
          </div>
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="suggestions-container">
          <h3><FontAwesomeIcon icon={faLightbulb} /> Questions fréquentes</h3>
          <div className="suggestions-grid">
            {SUGGESTED_QUESTIONS.map((sug) => (
              <button 
                key={sug.id} 
                className="suggestion-btn"
                onClick={() => handleSuggestionClick(sug)}
                disabled={loading}
              >
                {sug.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="messages-container">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tapez votre question ici..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !query.trim()}>
          {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPaperPlane} />}
        </button>
      </form>
    </div>
  );
}

export default ChatBot;
