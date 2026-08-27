import React, { useState } from "react";
import "./Login.css";

function Login({ onLoginSuccess }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {

    try {

      const response = await fetch(
        "http://localhost:5010/login",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username,
            password
          })
        }
      );

      console.log("STATUS =", response.status);

      const data = await response.json();

      if (data.success) {

        onLoginSuccess();

      } else {

        setError("Identifiants incorrects");

      }

    } catch (err) {

      console.error("LOGIN ERROR :", err);

      setError("Erreur serveur");

    }
  };

  return (

    <div className="login-page">

      <div className="login-card">

        /logo_lmv.png

        <h1 className="login-title">
          Assistant RH
        </h1>

        <p className="login-subtitle">
          Bienvenue sur le portail RH de La Marocaine Vie
        </p>

        <input
          className="login-input"
          placeholder="Utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="login-button"
          onClick={login}
        >
          Se connecter
        </button>

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}

      </div>

    </div>

  );
}

export default Login;