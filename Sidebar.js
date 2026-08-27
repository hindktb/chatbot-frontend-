import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faClock, faBars } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';

function Sidebar({ isOpen, onToggle, chatHistory, onSelectConversation }) {
  // Get current date and time
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR');
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Toggle button - NOW ON THE RIGHT */}
      <button className="sidebar-toggle" onClick={onToggle} style={{ right: isOpen ? '280px' : '0', left: 'auto' }}>
        <FontAwesomeIcon icon={faBars} />
      </button>
      
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <img src="/logo_lmv.png" alt="LMV" className="sidebar-logo" />
          <h2>HR Assistant</h2>
          <p className="sidebar-subtitle">La Marocaine Vie</p>
        </div>
        
        <div className="sidebar-section">
          <h3><FontAwesomeIcon icon={faHistory} /> Historique</h3>
          <div className="history-list">
            {chatHistory.length === 0 ? (
              <p className="empty-history">Aucune conversation</p>
            ) : (
              chatHistory.map((item, index) => (
                <div 
                  key={index} 
                  className="history-item"
                  onClick={() => onSelectConversation && onSelectConversation(item)}
                >
                  <p className="history-query">{item.query?.substring(0, 35)}{item.query?.length > 35 ? '...' : ''}</p>
                  <p className="history-time">
                    {new Date(item.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="sidebar-footer">
          <div className="sidebar-date">
            <FontAwesomeIcon icon={faClock} />
            <span>{dateStr}</span>
            <span>{timeStr}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
