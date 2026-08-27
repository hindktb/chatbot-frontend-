import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeadphones,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons';

import ChatBot from './components/ChatBot';
import Sidebar from './components/Sidebar';
import Login from './components/Login';

import './styles/App.css';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5010/me", {
      credentials: "include"
    })
      .then((response) => {
        if (response.ok) {
          setAuthenticated(true);
        }
      })
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const logout = async () => {
    try {
      await fetch("http://localhost:5010/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (error) {
      console.error(error);
    }

    setAuthenticated(false);
  };

  const addToHistory = (query, response) => {
    const newEntry = {
      query,
      response,
      timestamp: new Date(),
      id: Date.now()
    };

    setChatHistory((prev) => [...prev, newEntry]);
  };

  const selectConversation = (item) => {
    setCurrentConversation(item);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <span className="spinner" />
        <span>Chargement...</span>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Login
        onLoginSuccess={() => setAuthenticated(true)}
      />
    );
  }

  return (
    <div className="app-container">

      {/* HEADER */}
      <header className="top-header">

        <div className="header-actions">

          <button className="contact-btn">
            <span>Contactez-nous</span>
            <FontAwesomeIcon icon={faHeadphones} />
          </button>

          <button className="profile-icon-btn" title="Profil">
            <FontAwesomeIcon icon={faUserCircle} />
          </button>

        </div>

      </header>

      {/* APPLICATION BODY */}
      <div className="app-body">

        <Sidebar
          isOpen={sidebarOpen}
          chatHistory={chatHistory}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onSelectConversation={selectConversation}
          currentConversation={currentConversation}
          onLogout={logout}
        />

        <main className="main-content">

          <ChatBot
            onNewMessage={addToHistory}
            currentConversation={currentConversation}
          />

        </main>

      </div>

    </div>
  );
}

export default App;
