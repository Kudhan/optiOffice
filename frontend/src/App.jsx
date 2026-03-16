import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import UserList from './components/UserList';
import OrgTree from './components/OrgTree';
import Billing from './components/Billing';
import Holidays from './components/Holidays';
import Assets from './components/Assets';
import Attendance from './components/Attendance';
import Leaves from './components/Leaves';
import Tasks from './components/Tasks';
import Profile from './components/Profile';
import Roles from './components/Roles';
import Policies from './components/Policies';
import Placeholder from './components/Placeholder';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded); // contains sub, role, tenantId
      } catch (err) {
        setToken(null);
        localStorage.removeItem('token');
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const setAuthToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
    setToken(newToken);
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" reverseOrder={false} />
          <Routes>
            <Route
              path="/login"
              element={!token ? <Login setToken={setAuthToken} /> : <Navigate to="/" />}
            />

            {/* Protected Routes wrapped in Layout */}
            {token && user && (
              <Route path="/" element={<Layout token={token} setToken={setAuthToken} user={user} />}>
                <Route index element={<Dashboard token={token} user={user} />} />
                {user.role === 'admin' && (
                  <Route path="users" element={<UserList token={token} role={user.role} />} />
                )}
                <Route path="organization" element={<OrgTree token={token} />} />
                <Route path="billing" element={<Billing token={token} />} />
                <Route path="holidays" element={<Holidays token={token} />} />
                <Route path="assets" element={<Assets token={token} />} />
                <Route path="attendance" element={<Attendance token={token} />} />
                <Route path="leaves" element={<Leaves token={token} />} />
                <Route path="tasks" element={<Tasks token={token} />} />
                <Route path="profile" element={<Profile token={token} />} />
                <Route path="roles" element={<Roles token={token} />} />
                <Route path="policies" element={<Policies token={token} />} />
                <Route path="settings" element={<Placeholder title="Settings" />} />
                <Route path="reports" element={<Placeholder title="Reports & Analytics" />} />
                <Route path="sprints" element={<Placeholder title="Sprint Management" />} />
              </Route>
            )}

            <Route path="*" element={<Navigate to={token ? "/" : "/login"} />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
