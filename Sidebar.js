import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faBars
} from '@fortawesome/free-solid-svg-icons';

import './Sidebar.css';

function Sidebar({
  isOpen,
  onToggle,
  chatHistory,
  onSelectConversation
}) {

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>

      {/* LOGO */}
      <div className="sidebar-logo-container">
        <img
          src="/logo_lmv.png"
          alt="La Marocaine Vie"
          className="sidebar-logo"
        />
      </div>

      {/* HISTORIQUE */}
      <div className="sidebar-history">

        <h3 className="history-title">
          HISTORIQUE
        </h3>

        {chatHistory.length === 0 ? (

          <div className="empty-history">
            Aucune conversation
          </div>

        ) : (

          <div className="history-list">

            {chatHistory.map((item) => (

              <button
                key={item.id}
                className="history-item"
                onClick={() =>
                  onSelectConversation &&
                  onSelectConversation(item)
                }
              >

                <span className="history-query">
                  {item.query?.substring(0, 40)}
                  {item.query?.length > 40 ? '...' : ''}
                </span>

                <span className="history-time">
                  {new Date(item.timestamp).toLocaleDateString(
                    'fr-FR',
                    {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    }
                  )}
                </span>

              </button>

            ))}

          </div>

        )}

      </div>

      {/* PROFILE */}
      <div className="sidebar-profile">

        <div className="profile-avatar">
          <FontAwesomeIcon icon={faUser} />
        </div>

        <div className="profile-text">
          <span className="profile-name">
            Mon Profil
          </span>

          <span className="profile-settings">
            Paramètres
          </span>
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;
