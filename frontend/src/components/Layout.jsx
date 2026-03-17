import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import apiClient from '../api/client';
import useAuth from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import { 
  IconDashboard, 
  IconUsers, 
  IconBriefcase, 
  IconClock, 
  IconCalendar, 
  IconPackage, 
  IconCreditCard, 
  IconMail, 
  IconShield, 
  IconFileText, 
  IconBarChart, 
  IconLogOut, 
  IconBell, 
  IconHelp, 
  IconSearch 
} from './Icons';

function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('dashboard');
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch layout data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-navy-950 text-slate-500 font-medium">
        <div className="animate-pulse">Initializing Command Center...</div>
      </div>
    );
  }

  // Define navigation items with roles
  const navItems = [
    { label: 'Dashboard', path: '/', icon: <IconDashboard className="w-5 h-5" /> },
    { label: 'Team Hub', path: '/users', icon: <IconUsers className="w-5 h-5" />, roles: ['admin'] },
    { label: 'Organization', path: '/organization', icon: <IconBriefcase className="w-5 h-5" />, roles: ['admin', 'manager'] },
    { label: 'Attendance', path: '/attendance', icon: <IconClock className="w-5 h-5" /> },
    { label: 'Tasks', path: '/tasks', icon: <IconFileText className="w-5 h-5" /> },
    { label: 'Assets', path: '/assets', icon: <IconPackage className="w-5 h-5" /> },
    { label: 'Billing', path: '/billing', icon: <IconCreditCard className="w-5 h-5" />, roles: ['admin'] },
    { label: 'Holidays', path: '/holidays', icon: <IconCalendar className="w-5 h-5" /> },
    { label: 'Leaves', path: '/leaves', icon: <IconMail className="w-5 h-5" /> },
    { label: 'Roles', path: '/roles', icon: <IconShield className="w-5 h-5" />, roles: ['admin'] },
    { label: 'Policies', path: '/policies', icon: <IconShield className="w-5 h-5" />, roles: ['admin'] },
    { label: 'Reports', path: '/reports', icon: <IconBarChart className="w-5 h-5" />, roles: ['admin', 'manager'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-navy-950 transition-colors duration-300 font-sans">
      
      {/* Floating Sidebar (Left) */}
      <aside className="w-72 m-4 rounded-3xl bg-primary-surface border border-border text-content-muted flex flex-col shadow-xl z-20">
        
        {/* Logo Section */}
        <div className="p-8 pb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <span className="font-black text-xl">O</span>
          </div>
          <div>
            <h1 className="text-content-main font-black text-xl tracking-tighter leading-none">
              {isAdmin ? 'Admin Portal' : 'OptiOffice'}
            </h1>
            <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest mt-1">
              {isAdmin ? 'Command Center' : 'My Workspace'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 overflow-y-auto custom-scrollbar">
          <ul className="space-y-2">
            {filteredNavItems.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={`${item.path}-${idx}`}>
                  <Link 
                    to={item.path} 
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-semibold ${
                      isActive 
                        ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 shadow-sm' 
                         : 'hover:bg-primary-muted'
                    }`}
                  >
                    <span className="opacity-80">{item.icon}</span>
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
            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-semibold text-red-500 hover:bg-red-500/10 w-full"
          >
            <IconLogOut className="w-5 h-5 opacity-80" />
            <span>Logout</span>
          </button>
          
          <div className="flex items-center gap-3 px-4 py-4 pt-6">
            <div className="w-10 h-10 rounded-full bg-primary-muted flex items-center justify-center font-bold text-sky-500">
              {user?.sub?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-content-main truncate uppercase tracking-tight">{user?.sub || 'User Profile'}</p>
              <p className="text-xs text-content-muted font-medium">{user?.role || 'Member'}</p>
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
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-content-muted group-focus-within:text-sky-500 transition-colors">
                <IconSearch className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="w-full bg-primary-surface border border-border rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Header Action Items */}
          <div className="flex items-center gap-6">
            {isAdmin && (
              <div className="hidden lg:flex items-center bg-red-100/50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-full text-xs font-bold border border-red-200/50 dark:border-red-900/50 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                Subscription Past Due
              </div>
            )}
            
            <div className="flex gap-4 text-content-muted">
               <button className="p-2.5 rounded-xl border border-border hover:bg-primary-surface transition-all">
                 <IconBell className="w-5 h-5" />
               </button>
               <button className="p-2.5 rounded-xl border border-border hover:bg-primary-surface transition-all">
                 <IconHelp className="w-5 h-5" />
               </button>
               <div className="w-10 h-10 rounded-xl bg-primary-surface flex items-center justify-center border border-border overflow-hidden shadow-inner cursor-pointer hover:border-sky-500 transition-colors">
                  <IconUsers className="w-6 h-6 text-content-muted" />
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
