import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  faUser,
  faRobot,
  faDatabase,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

import './ChatMessage.css';


function ChatMessage({ message }) {

  const isUser = message.role === 'user';
  const isError = message.isError;
  const isInitial = message.isInitial;


  const parseResponse = (content) => {

    if (!content) {
      return {
        answer: content,
        score: 0,
        sources: []
      };
    }

    const answerMatch = content.match(
      /[- Réponse:]+(.+?)(?=\n[- Score]|$)/s
    );

    const scoreMatch = content.match(
      /Score[^:]*:\s*([\d.]+)/i
    );

    const sourcesMatch = content.match(
      /Sources[^:]*:\s*(.+?)(?=\n|$)/i
    );

    return {
      answer: answerMatch
        ? answerMatch[1].trim()
        : content,

      score: scoreMatch
        ? parseFloat(scoreMatch[1])
        : (message.similarityScore || 0),

      sources: sourcesMatch
        ? sourcesMatch[1]
            .split(',')
            .map((s) => s.trim())
        : (message.sources || [])
    };
  };


  const parsed =
    isUser
      ? null
      : parseResponse(message.content);


  const formattedTime =
    message.timestamp
      ? message.timestamp.toLocaleTimeString(
          'fr-FR',
          {
            hour: '2-digit',
            minute: '2-digit'
          }
        )
      : '';


  return (

    <div
      className={`
        message
        ${isUser ? 'user' : 'assistant'}
        ${isError ? 'error' : ''}
        ${isInitial ? 'initial' : ''}
      `}
    >

      {/* AVATAR */}
      <div className="message-avatar">

        <FontAwesomeIcon
          icon={
            isUser
              ? faUser
              : faRobot
          }
        />

      </div>


      {/* MESSAGE */}
      <div className="message-wrapper">

        {/* META */}
        <div className="message-meta">

          <span className="message-author">

            {isUser
              ? 'Vous'
              : 'Assistant LMV'}

          </span>

          <span className="message-time-inline">
            {isInitial
              ? `Aujourd'hui, ${formattedTime}`
              : formattedTime}
          </span>

        </div>


        {/* BUBBLE */}
        <div className="message-content">

          {isUser ? (

            <p className="message-text">
              {message.content}
            </p>

          ) : (

            <>

              <div className="message-text">

                {parsed?.answer ||
                  message.content}

                {message.isStreaming && (
                  <span className="cursor">
                    |
                  </span>
                )}

              </div>


              {!isInitial &&
                (
                  parsed?.score > 0 ||
                  parsed?.sources.length > 0 ||
                  message.executionTime
                ) && (

                  <div className="message-metadata">

                    {parsed?.score > 0 && (

                      <span className="similarity-score">

                        <FontAwesomeIcon
                          icon={faCheckCircle}
                        />

                        Score :
                        {' '}
                        {parsed.score.toFixed(2)}

                      </span>

                    )}


                    {parsed?.sources.length > 0 && (

                      <span className="sources">

                        <FontAwesomeIcon
                          icon={faDatabase}
                        />

                        {parsed.sources.join(', ')}

                      </span>

                    )}

                  </div>

                )}

            </>

          )}

        </div>

      </div>

    </div>
  );
}

export default ChatMessage;
