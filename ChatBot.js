import React, { useState, useRef, useEffect } from 'react';

import {
  faPaperPlane,
  faSpinner,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { getSocket } from '../services/socket';
import { checkHealth } from '../services/api';

import ChatMessage from './ChatMessage';

import './ChatBot.css';


const SUGGESTED_QUESTIONS = [
  {
    id: 1,
    label: 'Congés',
    question: 'Quelles sont les règles concernant les congés annuels ?'
  },
  {
    id: 2,
    label: 'RTT',
    question: 'Comment fonctionne le calcul des RTT ?'
  },
  {
    id: 3,
    label: 'Télétravail',
    question: 'Quelle est la politique de télétravail ?'
  },
  {
    id: 4,
    label: 'Mutuelle',
    question: 'Quels sont les avantages de la mutuelle santé ?'
  },
  {
    id: 5,
    label: 'Notes de frais',
    question: 'Comment faire une demande de notes de frais ?'
  },
  {
    id: 6,
    label: 'Formation',
    question: 'Quelles formations sont disponibles ?'
  }
];


function ChatBot({
  onNewMessage,
  currentConversation
}) {

  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [healthStatus, setHealthStatus] = useState('checking');
  const [executionTime, setExecutionTime] = useState(null);

  const messagesEndRef = useRef(null);


  /* =========================================================
     MESSAGE INITIAL
     ========================================================= */

  useEffect(() => {

    setMessages([
      {
        role: 'assistant',
        content:
          "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
        timestamp: new Date(),
        isInitial: true
      }
    ]);

  }, []);


  /* =========================================================
     BACKEND HEALTH
     ========================================================= */

  useEffect(() => {

    const checkBackendHealth = async () => {

      const health = await checkHealth();

      setHealthStatus(
        health.status === 'healthy'
          ? 'healthy'
          : 'unhealthy'
      );
    };

    checkBackendHealth();

    const interval = setInterval(
      checkBackendHealth,
      30000
    );

    return () => clearInterval(interval);

  }, []);


  /* =========================================================
     AUTO SCROLL
     ========================================================= */

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });

  }, [messages]);


  /* =========================================================
     SEND MESSAGE
     ========================================================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!query.trim() || loading) {
      return;
    }

    const question = query.trim();

    const userMessage = {
      role: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [
      ...prev,
      userMessage
    ]);

    setQuery('');
    setLoading(true);
    setExecutionTime(null);

    handleWebSocketQuery(question);
  };


  /* =========================================================
     SUGGESTION
     ========================================================= */

  const handleSuggestionClick = (suggestion) => {

    if (loading) {
      return;
    }

    const question = suggestion.question;

    const userMessage = {
      role: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [
      ...prev,
      userMessage
    ]);

    setLoading(true);
    setExecutionTime(null);

    handleWebSocketQuery(question);
  };


  /* =========================================================
     WEBSOCKET
     ========================================================= */

  const handleWebSocketQuery = (queryText) => {

    const socket = getSocket();

    let fullResponse = '';

    socket.emit('chat_query', {
      query: queryText
    });


    socket.on('stream_token', (data) => {

      fullResponse += data.token;

      setIsTyping(true);

      setMessages(prev => {

        const newMessages = [...prev];

        const lastMessage =
          newMessages[newMessages.length - 1];

        if (
          lastMessage &&
          lastMessage.role === 'assistant' &&
          lastMessage.isStreaming
        ) {

          lastMessage.content = fullResponse;

          return newMessages;

        }

        return [
          ...newMessages,
          {
            role: 'assistant',
            content: fullResponse,
            isStreaming: true,
            timestamp: new Date()
          }
        ];

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

        const lastMessage =
          newMessages[newMessages.length - 1];

        if (
          lastMessage &&
          lastMessage.isStreaming
        ) {

          lastMessage.isStreaming = false;

          lastMessage.sources =
            data.sources || [];

          lastMessage.similarityScore =
            data.similarity_score || 0;

          lastMessage.executionTime =
            data.execution_time;
        }

        return newMessages;

      });


      if (onNewMessage) {

        onNewMessage(
          queryText,
          {
            answer: fullResponse,
            sources: data.sources,
            execution_time: data.execution_time
          }
        );

      }

    });


    socket.on('chat_error', (data) => {

      setIsTyping(false);
      setLoading(false);

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Erreur : ${data.error}`,
          isError: true,
          timestamp: new Date()
        }
      ]);

    });

  };


  return (

    <div className="chatbot-container">

      {/* =====================================================
          CHAT AREA
          ===================================================== */}

      <div className="chat-area">

        <div className="chat-background-pattern" />

        <div className="messages-container">

          {messages.map((message, index) => (

            <ChatMessage
              key={index}
              message={message}
            />

          ))}


          {/* SUGGESTIONS */}
          {messages.length <= 1 && (

            <div className="suggestions-container">

              <div className="suggestions-grid">

                {SUGGESTED_QUESTIONS
                  .slice(0, 3)
                  .map((suggestion) => (

                    <button
                      key={suggestion.id}
                      className="suggestion-btn"
                      onClick={() =>
                        handleSuggestionClick(suggestion)
                      }
                      disabled={loading}
                    >
                      {suggestion.label}
                    </button>

                  ))}

              </div>

            </div>

          )}


          {isTyping && (

            <div className="typing-indicator">

              <span />
              <span />
              <span />

            </div>

          )}

          <div ref={messagesEndRef} />

        </div>

      </div>


      {/* =====================================================
          INPUT
          ===================================================== */}

      <div className="input-area">

        <form
          className="input-form"
          onSubmit={handleSubmit}
        >

          <input
            type="text"
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Écrivez votre message..."
            disabled={loading}
          />

          <button
            type="submit"
            disabled={
              loading ||
              !query.trim()
            }
            aria-label="Envoyer"
          >

            {loading ? (
              <FontAwesomeIcon
                icon={faSpinner}
                spin
              />
            ) : (
              <FontAwesomeIcon
                icon={faPaperPlane}
              />
            )}

          </button>

        </form>


        <p className="disclaimer">
          L'Assistant LMV peut faire des erreurs.
          Pensez à vérifier les informations importantes.
        </p>

      </div>

    </div>
  );
}

export default ChatBot;
