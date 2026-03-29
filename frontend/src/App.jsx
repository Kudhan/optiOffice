import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import UserList from './components/UserList';
import Hierarchy from './components/Hierarchy';
import Shifts from './components/Shifts';
import Holidays from './components/Holidays';
import Assets from './components/Assets';
import Attendance from './components/Attendance';
import Leaves from './components/Leaves';
import Tasks from './components/Tasks';
import Profile from './components/Profile';
import Roles from './components/Roles';
import Departments from './components/Departments';
import Policies from './components/Policies';
import ActivityLogs from './components/ActivityLogs';
import Reports from './components/Reports';
import TeamHub from './components/TeamHub';
import HelpDesk from './components/HelpDesk';
import TicketDetails from './components/TicketDetails';
import Placeholder from './components/Placeholder';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  const { token, login, isAuthenticated } = useAuth();

  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" reverseOrder={false} />
          <Routes>
            <Route
              path="/login"
              element={!isAuthenticated ? <Login setToken={login} /> : <Navigate to="/" />}
            />

            {/* Protected Routes wrapped in Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout token={token} />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              
              <Route path="users" element={
                <ProtectedRoute requiredPermission="can_manage_users">
                  <UserList />
                </ProtectedRoute>
              } />
              
              <Route path="organization" element={<Hierarchy />} />
              <Route path="team-hub" element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <TeamHub />
                </ProtectedRoute>
              } />
              <Route path="shifts" element={<Shifts />} />
              
              
              <Route path="holidays" element={<Holidays />} />
              <Route path="assets" element={<Assets />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="leaves" element={<Leaves />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="profile/:id?" element={<Profile />} />
              
              {/* Specialized Guards */}
              <Route path="roles" element={
                <ProtectedRoute requiredPermission="can_manage_users">
                  <Roles />
                </ProtectedRoute>
              } />
              <Route path="departments" element={
                <ProtectedRoute requiredPermission="can_manage_users">
                  <Departments />
                </ProtectedRoute>
              } />
              <Route path="policies" element={<Policies />} />
              
              <Route path="activity-logs" element={
                <ProtectedRoute requiredPermission="can_manage_users">
                  <ActivityLogs />
                </ProtectedRoute>
              } />
              
              <Route path="settings" element={<Placeholder title="Settings" />} />
              <Route path="reports" element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="help-desk" element={<HelpDesk />} />
              <Route path="help-desk/:id" element={<TicketDetails />} />
              <Route path="sprints" element={<Placeholder title="Sprint Management" />} />
            </Route>

            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
