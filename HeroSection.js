import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faComments, faDatabase } from '@fortawesome/free-solid-svg-icons';
import './HeroSection.css';

function HeroSection() {
  return (
    <div className="hero-section">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <div className="hero-icon">
          <FontAwesomeIcon icon={faRobot} size="3x" />
        </div>
        <h1>Assistant RH Intelligent</h1>
        <p>Posez vos questions sur les ressources humaines et obtenez des réponses instantanées basées sur votre base documentaire.</p>
        <div className="hero-features">
          <div className="feature">
            <FontAwesomeIcon icon={faComments} />
            <span>Chat en temps réel</span>
          </div>
          <div className="feature">
            <FontAwesomeIcon icon={faDatabase} />
            <span>Base documentaire RH</span>
          </div>
          <div className="feature">
            <FontAwesomeIcon icon={faRobot} />
            <span>IA locale privée</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
