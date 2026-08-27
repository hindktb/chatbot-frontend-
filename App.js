import React, { useState, useEffect } from 'react';

import ChatBot from './components/ChatBot';
import Sidebar from './components/Sidebar';
import HeroSection from './components/HeroSection';
import Login from './components/Login';

import './styles/App.css';

function App() {

  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showHero, setShowHero] = useState(true);
  const [currentConversation, setCurrentConversation] = useState(null);

  useEffect(() => {

    fetch(
      "http://localhost:5010/me",
      {
        credentials: "include"
      }
    )
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

      await fetch(
        "http://localhost:5010/logout",
        {
          method: "POST",
          credentials: "include"
        }
      );

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

    setChatHistory(prev => [...prev, newEntry]);

    setShowHero(false);

  };

  const selectConversation = (item) => {

    setCurrentConversation(item);

    setShowHero(false);

  };

  if (loading) {

    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        Chargement...
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

      <button
        onClick={logout}
        style={{
          position: "fixed",
          top: "15px",
          right: "15px",
          zIndex: 999,
          padding: "8px 15px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          backgroundColor: "#dc3545",
          color: "white"
        }}
      >
        Déconnexion
      </button>

      <Sidebar
        isOpen={sidebarOpen}
        chatHistory={chatHistory}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onSelectConversation={selectConversation}
        currentConversation={currentConversation}
      />

      <main
        className={`main-content ${
          sidebarOpen ? 'sidebar-open' : 'sidebar-closed'
        }`}
      >

        {showHero && <HeroSection />}

        <ChatBot
          onNewMessage={addToHistory}
          onFirstMessage={() => setShowHero(false)}
          currentConversation={currentConversation}
        />

      </main>

    </div>

  );

}

export default App;