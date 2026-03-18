import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import apiClient from '../api/client';
import useAuth from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import HeaderDropdown from './HeaderDropdown';
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
  IconSearch,
  IconChevronLeft,
  IconSettings,
  IconInfo,
  IconBookOpen,
  IconActivity,
  IconZap
} from './Icons';

function Layout() {
  const { user, logout, isAdmin, hasPermission } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = (e) => {
    const currentScrollY = e.currentTarget.scrollTop;
    
    // Show navbar if scrolling up or if near top
    if (currentScrollY <= 50) {
      setShowNavbar(true);
    } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down and past threshold
      setShowNavbar(false);
    } else if (currentScrollY < lastScrollY) {
      // Scrolling up
      setShowNavbar(true);
    }
    
    setLastScrollY(currentScrollY);
  };

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
    { label: 'Team Hub', path: '/users', icon: <IconUsers className="w-5 h-5" />, permission: 'can_manage_users' },
    { label: 'Organization', path: '/organization', icon: <IconBriefcase className="w-5 h-5" /> },
    { label: 'Attendance', path: '/attendance', icon: <IconClock className="w-5 h-5" /> },
    { label: 'Tasks', path: '/tasks', icon: <IconFileText className="w-5 h-5" /> },
    { label: 'Assets', path: '/assets', icon: <IconPackage className="w-5 h-5" /> },
    { label: 'Billing', path: '/billing', icon: <IconCreditCard className="w-5 h-5" />, permission: 'can_manage_billing' },
    { label: 'Holidays', path: '/holidays', icon: <IconCalendar className="w-5 h-5" /> },
    { label: 'Leaves', path: '/leaves', icon: <IconMail className="w-5 h-5" /> },
    { label: 'Departments', path: '/departments', icon: <IconBriefcase className="w-5 h-5" />, permission: 'can_manage_users' },
    { label: 'Roles', path: '/roles', icon: <IconShield className="w-5 h-5" />, permission: 'can_manage_users' }, // Using same permission for now
    { label: 'Policies', path: '/policies', icon: <IconShield className="w-5 h-5" />, permission: 'can_manage_users' },
    { label: 'Reports', path: '/reports', icon: <IconBarChart className="w-5 h-5" /> },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  return (
    <div className="flex h-screen bg-primary transition-colors duration-300 font-sans">
      
      {/* Floating Sidebar (Left) */}
      <aside className={`${isCollapsed ? 'w-24' : 'w-72'} m-4 rounded-3xl bg-primary-surface border border-border text-content-muted flex flex-col shadow-xl z-20 transition-all duration-300 overflow-hidden group/sidebar`}>
        
        {/* Logo Section */}
        <div className={`p-8 pb-4 flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex min-w-[40px] items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <span className="font-black text-xl">O</span>
          </div>
          {!isCollapsed && (
            <Link to="/" className="min-w-0 text-left"> 
              <h1 className="text-content-main font-black text-xl tracking-tighter leading-none truncate">
                {isAdmin ? 'Admin Portal' : 'OptiOffice'}
              </h1>
              <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest mt-1">
                {isAdmin ? 'Command Center' : 'My Workspace'}
              </p>
            </Link>
          )}
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
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <span className="opacity-80 min-w-[20px]">{item.icon}</span>
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Section (Logout & Profile) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-semibold text-red-500 hover:bg-red-500/10 w-full ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <IconLogOut className="w-5 h-5 opacity-80 min-w-[20px]" />
            {!isCollapsed && <span>Logout</span>}
          </button>
          
          <Link 
            to="/profile"
            className={`flex items-center gap-3 px-4 py-4 pt-6 hover:bg-primary-muted rounded-2xl transition-all cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'View Profile' : ''}
          >
            <div className="w-10 h-10 rounded-full bg-primary-muted flex min-w-[40px] items-center justify-center font-bold text-sky-500 shadow-inner">
              {user?.sub?.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden text-left">
                <p className="text-sm font-bold text-content-main truncate uppercase tracking-tight">{user?.sub || 'User Profile'}</p>
                <p className="text-xs text-content-muted font-medium">{user?.role || 'Member'}</p>
              </div>
            )}
          </Link>
        </div>
      </aside>

      {/* Main Container */}
      <div 
        className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar"
        onScroll={handleScroll}
      >
        
        {/* Top Header Bar */}
        <header className={`py-4 flex items-center justify-between px-8 sticky top-4 z-30 gap-8 transition-all duration-500 ease-in-out backdrop-blur-xl bg-primary-surface/90 rounded-[2.5rem] mx-6  shadow-xl shadow-sky-500/5 ${
          showNavbar ? 'translate-y-0 opacity-100' : '-translate-y-[calc(100%+2rem)] opacity-0'
        }`}>
          
          {/* Animated Collapse Button */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="group/btn relative p-3 rounded-2xl bg-primary-surface border border-border hover:border-sky-500/50 hover:bg-sky-500/5 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <div className={`transition-transform duration-500 ease-out ${isCollapsed ? 'rotate-180' : 'rotate-0'}`}>
              <IconChevronLeft className="w-5 h-5 text-content-muted group-hover/btn:text-sky-500 transition-colors" />
            </div>
            {/* Visual Flare Effect */}
            <span className="absolute inset-0 rounded-2xl bg-sky-500/0 group-hover/btn:bg-sky-500/5 scale-90 group-hover/btn:scale-100 transition-all duration-300 -z-10"></span>
          </button>

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
            <div className="hidden lg:flex items-center bg-sky-100/50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 px-4 py-2 rounded-full text-xs font-bold border border-sky-200/50 dark:border-sky-900/40">
              <span className="w-2 h-2 rounded-full bg-sky-500 mr-2"></span>
              Tenant: <span className="uppercase ml-1">{user?.tenantId || 'OptiOffice Central'}</span>
            </div>

             <div className="flex gap-4 text-content-muted">
                <ThemeToggle />

                {/* Notifications */}
                <HeaderDropdown
                  title="Secure Notifications"
                  trigger={
                    <button className="p-2.5 rounded-xl border border-border hover:bg-primary-surface transition-all relative group">
                        <IconBell className="w-5 h-5 group-hover:text-sky-500 transition-colors" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-primary-surface"></span>
                    </button>
                  }
                  items={[
                    {
                        label: 'Neural Task Assignment',
                        description: 'New objective: Refinement of Profile UI',
                        icon: <IconZap size={16} />,
                        colorClass: 'bg-amber-500/10 text-amber-500',
                        badge: true
                    },
                    {
                        label: 'Protocol: Leave Approved',
                        description: 'Your leave node for March 24-25 is active.',
                        icon: <IconCalendar size={16} />,
                        colorClass: 'bg-emerald-500/10 text-emerald-500'
                    },
                    { type: 'divider' },
                    {
                        label: 'System Maintenance',
                        description: 'Operational downtime scheduled for 0200h.',
                        icon: <IconShield size={16} />,
                        colorClass: 'bg-indigo-500/10 text-indigo-500'
                    }
                  ]}
                />

                {/* Help/Support */}
                <HeaderDropdown
                  title="Operations Support"
                  trigger={
                    <button className="p-2.5 rounded-xl border border-border hover:bg-primary-surface transition-all group">
                        <IconHelp className="w-5 h-5 group-hover:text-sky-500 transition-colors" />
                    </button>
                  }
                  items={[
                    {
                        label: 'Operational Guide',
                        description: 'Search documentation core',
                        icon: <IconBookOpen size={16} />,
                        colorClass: 'bg-sky-500/10 text-sky-500'
                    },
                    {
                        label: 'Command Support',
                        description: 'Open a priority uplink',
                        icon: <IconMail size={16} />,
                        colorClass: 'bg-emerald-500/10 text-emerald-500'
                    },
                    { type: 'divider' },
                    {
                        label: 'Protocol Status',
                        description: 'Global system availability',
                        icon: <IconInfo size={16} />,
                        colorClass: 'bg-amber-500/10 text-amber-500'
                    }
                  ]}
                />

                {/* Quick Profile/Users */}
                <HeaderDropdown
                  title="Identity Perspective"
                  trigger={
                    <div className="w-10 h-10 rounded-xl bg-primary-surface flex items-center justify-center border border-border overflow-hidden shadow-inner cursor-pointer hover:border-sky-500 transition-colors">
                        <IconUsers className="w-6 h-6 text-content-muted" />
                    </div>
                  }
                  items={[
                    {
                        label: 'Identity Dashboard',
                        description: 'View overall performance',
                        icon: <IconActivity size={16} />,
                        colorClass: 'bg-sky-500/10 text-sky-500',
                        onClick: () => navigate(`/profile/${user.id}`)
                    },
                    {
                        label: 'Security Core',
                        description: 'Manage authentication nodes',
                        icon: <IconShield size={16} />,
                        colorClass: 'bg-emerald-500/10 text-emerald-500'
                    },
                    {
                        label: 'System Settings',
                        description: 'Configure interface preferences',
                        icon: <IconSettings size={16} />,
                        colorClass: 'bg-indigo-500/10 text-indigo-500'
                    },
                    { type: 'divider' },
                    {
                        label: 'Terminate Session',
                        description: 'Immediate secure logout',
                        icon: <IconLogOut size={16} />,
                        colorClass: 'bg-rose-500/10 text-rose-500',
                        onClick: logout
                    }
                  ]}
                />
             </div>
          </div>
        </header>

        {/* Dynamic Canvas */}
        <main className="flex-1 bg-transparent relative">
           <Outlet context={{ user, data }} />
        </main>
      </div>

    </div>
  );
}

export default Layout;
