import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import apiClient from '../api/client';
import ThemeToggle from './ThemeToggle';

function Layout({ token, setToken, user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/dashboard');
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch layout data", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-navy-950 text-slate-500 font-medium">
        <div className="animate-pulse">Initializing Command Center...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-navy-950 transition-colors duration-300 font-sans">
      
      {/* Floating Sidebar (Left) */}
      <aside className="w-72 m-4 rounded-3xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 flex flex-col shadow-xl z-20">
        
        {/* Logo Section */}
        <div className="p-8 pb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <span className="font-black text-xl">O</span>
          </div>
          <div>
            <h1 className="text-slate-900 dark:text-white font-black text-xl tracking-tighter leading-none">OptiOffice</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Command Center</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 overflow-y-auto custom-scrollbar">
          <ul className="space-y-2">
            {[
              { label: 'Dashboard', path: '/', icon: '🏢' },
              ...(data?.menu || []).map(item => {
                let path = '/';
                let icon = '📄';
                if (item === 'Users' || item === 'My Team') { path = '/users'; icon = '👥'; }
                else if (item === 'Organization Tree') { path = '/organization'; icon = '🌳'; }
                else if (item === 'Billing') { path = '/billing'; icon = '💳'; }
                else if (item === 'Holidays') { path = '/holidays'; icon = '📅'; }
                else if (item === 'Assets') { path = '/assets'; icon = '📦'; }
                else if (item === 'Attendance') { path = '/attendance'; icon = '⏱️'; }
                else if (item === 'Leaves') { path = '/leaves'; icon = '✉️'; }
                else if (item === 'Tasks' || item === 'My Tasks') { path = '/tasks'; icon = '🛠️'; }
                else if (item === 'Roles') { path = '/roles'; icon = '🔐'; }
                else if (item === 'Policies') { path = '/policies'; icon = '📜'; }
                else if (item === 'Settings') { path = '/settings'; icon = '⚙️'; }
                else if (item === 'Reports') { path = '/reports'; icon = '📊'; }
                
                return { label: item, path, icon };
              })
            ].map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={`${item.path}-${idx}`}>
                  <Link 
                    to={item.path} 
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-semibold ${
                      isActive 
                        ? 'bg-sky-500/10 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 shadow-sm' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-lg opacity-80">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Section (Theme & Logout) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <ThemeToggle />
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-semibold text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/10 w-full"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
          
          <div className="flex items-center gap-3 px-4 py-4 pt-6">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-sky-500">
              {user?.sub?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate uppercase tracking-tight">User Profile</p>
              <p className="text-xs text-slate-400 font-medium">{user?.role || 'Member'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="h-24 flex items-center justify-between px-10 relative z-10">
          
          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors italic">🔍</span>
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="w-full bg-white dark:bg-navy-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Header Action Items */}
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center bg-red-100/50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-full text-xs font-bold border border-red-200/50 dark:border-red-900/50 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
              Subscription Past Due
            </div>
            
            <div className="flex gap-4 text-slate-400">
               <button className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all">🔔</button>
               <button className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all">❓</button>
               <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-slate-300 dark:border-slate-700 overflow-hidden shadow-inner cursor-pointer hover:border-sky-500 transition-colors">
                  <span className="text-xl">👤</span>
               </div>
            </div>
          </div>
        </header>

        {/* Dynamic Canvas */}
        <main className="flex-1 overflow-auto bg-transparent relative custom-scrollbar">
           <Outlet context={{ user, data }} />
        </main>
      </div>

    </div>
  );
}

export default Layout;
