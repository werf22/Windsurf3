import { BrowserRouter as Router, Routes, Route, Navigate, Link, Outlet, useNavigate } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { useState, useEffect } from 'react';
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Layout } from "./components/AppLayout";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Chat from "./pages/Chat";
import Hierarchy from "./pages/Hierarchy";
import GlobalChat from "./pages/GlobalChat";
import './App.css';

function App() {
  const [auth, setAuth] = useState<{ username: string; password: string; email?: string } | null>(null);
  useEffect(() => {
    const session = localStorage.getItem('auth');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed?.username && parsed?.password) {
          setAuth(parsed);
        }
      } catch {}
    }
  }, []);
  const [loginError, setLoginError] = useState<string | undefined>(undefined);
  const [registerError, setRegisterError] = useState<string | undefined>(undefined);
  const [registerSuccess, setRegisterSuccess] = useState<boolean>(false);

  const handleLogin = async (username: string, password: string) => {
    try {
      const formBody = new URLSearchParams();
      formBody.append('username', username);
      formBody.append('password', password);
      const resp = await fetch("/api/login", {
        method: "POST",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString()
      });
      let email = undefined;
      if (resp.ok) {
        try {
          const data = await resp.json();
          email = data.email;
        } catch {}
      }
      if (!resp.ok) {
        const text = await resp.text();
        console.error("Login failed response body:", text);
      }
      if (resp.status === 200) {
        setAuth({ username, password, email });
        localStorage.setItem('auth', JSON.stringify({ username, password, email }));
        setLoginError(undefined);
      } else {
        localStorage.removeItem('auth');
        setAuth(null);
        setLoginError("Invalid username or password.");
      }
    } catch {
      setLoginError("Unable to connect to server.");
    }
  };


  const handleRegister = async (username: string, email: string, password: string) => {
    setRegisterError(undefined);
    setRegisterSuccess(false);
    try {
      const resp = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      if (resp.status === 200 || resp.status === 201) {
        setRegisterSuccess(true);
        setRegisterError(undefined);
        setAuth({ username, password, email });
        localStorage.setItem('auth', JSON.stringify({ username, password, email }));
      } else {
        const data = await resp.json();
        setRegisterError(data.detail || "Registration failed.");
      }
    } catch {
      setRegisterError("Unable to connect to server.");
    }
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem('auth');
  };

  // Registration success: show message and redirect to login
  if (!auth) {
    return (
      <ChakraProvider>
        <Router>
          <Routes>
            <Route path="/register" element={<Register onRegister={handleRegister} error={registerError} />} />
            <Route path="*" element={<Login onLogin={handleLogin} error={loginError} />} />
          </Routes>
          {registerSuccess && (
            <div style={{ position: 'fixed', top: 20, left: 0, right: 0, zIndex: 9999, textAlign: 'center' }}>
              <span style={{ background: '#68D391', color: 'white', padding: '12px 24px', borderRadius: 8, fontWeight: 600 }}>
                Registration successful! Please log in.
              </span>
            </div>
          )}
        </Router>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider>
      <Router>
        <Layout auth={auth}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard auth={auth} />} />
            <Route path="/tasks" element={<Home auth={auth} />} />
            <Route path="/hierarchy" element={<Hierarchy auth={auth} />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/global-chat" element={<GlobalChat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Layout>
      </Router>
    </ChakraProvider>
  );
}

export default App;
