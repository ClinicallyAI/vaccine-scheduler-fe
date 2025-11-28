import axios from "axios";
import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "@/services/auth";

const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const payload = { username, password };
      const response = await axios.post("https://sms-demo-fszn.onrender.com/login", payload);

      if (!response.data.data.token) {
        throw new Error("Login failed");
      }

      const token = response.data.data.token;
      setToken(token);
      navigate("/clinically-home");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>ClinicallyAI Login</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    height: "100vh",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
  card: {
    padding: "2rem",
    borderRadius: "10px",
    background: "#fff",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  title: {
    marginBottom: "1rem",
    textAlign: "center",
    fontSize: "1.5rem",
  },
  input: {
    padding: "0.75rem",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "0.75rem",
    fontSize: "1rem",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: "0.9rem",
    textAlign: "center",
  },
};

export default Login;
