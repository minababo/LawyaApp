import React, { useState } from 'react';
import { api } from '../lib/api';
import { saveToken } from '../utils/token';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('users/login/', { email, password });
      saveToken(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Admin Login</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Login
          </button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: '1rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: 380,
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 24,
    color: '#2c3e50',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '12px 14px',
    fontSize: 15,
    borderRadius: 8,
    border: '1px solid #ccc',
    outlineColor: '#AFA2A2',
    transition: 'box-shadow 0.2s ease',
  },
  button: {
    backgroundColor: '#AFA2A2',
    color: '#fff',
    padding: '12px',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
  error: {
    color: '#e74c3c',
    marginTop: 10,
    fontSize: 14,
  },
};
