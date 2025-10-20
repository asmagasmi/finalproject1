import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Task Manager</h1>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className="nav-item">
            📊 Dashboard
          </NavLink>
          <NavLink to="/tasks" className="nav-item">
            ✅ My Tasks
          </NavLink>
          <NavLink to="/profile" className="nav-item">
            👤 Profile
          </NavLink>
        </nav>
      </aside>
      
      <main className="main-content">
        <header className="header">
          <div></div>
          <div className="user-info">
            <span>Welcome, {user?.username}</span>
            <button 
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              Logout
            </button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;