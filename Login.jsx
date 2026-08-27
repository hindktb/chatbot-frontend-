import React, { useState } from "react";
import "./Login.css";

function Login({ onLoginSuccess }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

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

      const data = await response.json();

      if (data.success) {

        onLoginSuccess();

      } else {

        setError("Identifiants incorrects");

      }

    } catch (err) {

      console.error("LOGIN ERROR :", err);

      setError("Erreur serveur, veuillez réessayer");

    } finally {

      setSubmitting(false);

    }
  };

  return (

    <div className="login-page">

      <div className="login-card">

        <div className="login-accent" aria-hidden="true" />

        <img src="/logo_lmv.png" alt="La Marocaine Vie" className="login-logo" />

        <h1 className="login-title">Assistant RH</h1>

        <p className="login-subtitle">
          Bienvenue sur le portail RH de La Marocaine Vie
        </p>

        <form onSubmit={login}>

          <label className="login-label" htmlFor="username">Identifiant</label>
          <input
            id="username"
            className="login-input"
            placeholder="Votre identifiant"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />

          <label className="login-label" htmlFor="password">Mot de passe</label>
          <input
            id="password"
            className="login-input"
            type="password"
            placeholder="Votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <button
            type="submit"
            className="login-button"
            disabled={submitting || !username || !password}
          >
            {submitting ? "Connexion..." : "Se connecter"}
          </button>

        </form>

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

      </div>

    </div>

  );
}

export default Login;
