import React, { useState, useEffect, useMemo } from 'react';
import { 
    Users, ShieldCheck, UserCircle, Globe, Search, 
    Settings, ChevronDown, Briefcase, Cpu, Landmark, 
    UserPlus, Lock, Clock, Ban, CheckCircle2, Shield, User, Radar, ArrowRightLeft, Building2
} from 'lucide-react';
import apiClient from '../api/client';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { CardSkeleton } from './Skeleton';
import InviteUserModal from './InviteUserModal';
import SecurityModal from './SecurityModal';
import DossierModal from './DossierModal';
import ManagerTransferModal from './ManagerTransferModal';
import DepartmentShiftModal from './DepartmentShiftModal';

// --- Member Card Sub-Component ---
const MemberCard = ({ user, onRefresh, onOpenSecurity, onOpenDossier, onOpenTransfer, onOpenDeptShift }) => {
    const { isAdmin: currentIsAdmin, user: currentUser, permissions } = useAuth();
    // Normalize both IDs to strings for robust comparison
    const isSelf = String(user.id) === String(currentUser?.id);
    const canManage = permissions.includes('can_manage_users') && !isSelf;
    const canEditRoles = permissions.includes('can_edit_roles');
    const [showActions, setShowActions] = useState(false);
    const initials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
    const isOnline = user.status === 'Clocked In' || user.status === 'Online';

    const handleRoleChange = async (newRole) => {
        try {
            await apiClient.patch(`users/${user.id}`, { role: newRole });
            toast.success(`Role updated to ${newRole}`, {
                style: { borderRadius: '15px', background: '#0B1120', color: '#fff' }
            });
            onRefresh();
            setShowActions(false);
        } catch (err) {}
    };

    const handleRemove = async () => {
        toast((t) => (
            <div className="flex flex-col gap-4">
                <span className="font-bold text-white text-sm">Are you sure you want to remove this user from OptiOffice?</span>
                <div className="flex gap-2">
                    <button 
                        onClick={async () => {
                            try {
                                await apiClient.delete(`users/${user.id}`);
                                toast.success("User removed successfully");
                                onRefresh();
                                toast.dismiss(t.id);
                            } catch (err) {}
                        }}
                        className="bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold"
                    >
                        Yes, Remove
                    </button>
                    <button 
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: 'bottom-center',
            style: { background: '#0B1120', border: '1px solid #1e293b', padding: '16px' }
        });
    };

    const isBlocked = user.status === 'blocked';
    const isSuspended = user.status === 'suspended';

    return (
        <div className={`bg-white dark:bg-slate-800/40 backdrop-blur-md rounded-[2.5rem] p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-2xl hover:border-sky-500/50 transition-all duration-500 group relative flex flex-col h-full ${isBlocked ? 'opacity-50 grayscale-[0.5]' : ''}`}>
            
            {/* Status Indicators (Top Left) */}
            <div className="absolute top-6 left-6 z-10 flex gap-2">
                {isBlocked && (
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 animate-pulse" title="Account Locked">
                        <Lock className="w-3.5 h-3.5" />
                    </div>
                )}
                {isSuspended && (
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500" title="Account Suspended">
                        <Clock className="w-3.5 h-3.5" />
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center text-center mt-4 mb-6">
                <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-slate-100 dark:bg-slate-700 border-4 border-white dark:border-slate-800 flex items-center justify-center shadow-xl relative mb-4 transition-transform group-hover:scale-105 ${isBlocked ? 'border-rose-500/30 shadow-rose-500/5' : ''}`}>
                    <span className="text-xl lg:text-2xl font-black text-slate-400 dark:text-slate-300 tracking-tighter">{initials}</span>
                </div>

                <div className="flex items-center justify-center gap-2.5 w-full px-2">
                    <div className="max-w-full overflow-hidden whitespace-nowrap group/name">
                        <h3 className={`inline-block text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors leading-none truncate group-hover/name:animate-marquee-hover cursor-default pb-1 ${isBlocked ? 'text-rose-500' : 'group-hover/name:text-sky-500'}`}>
                            {user.full_name}
                        </h3>
                    </div>
                    {isOnline && !isBlocked && (
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800"></span>
                        </span>
                    )}
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em] opacity-60 mt-2 truncate w-full px-4">
                    {user.email}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 dark:bg-navy-950/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50 overflow-hidden">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1.5 opacity-70 truncate">Authorization</p>
                    <p className={`text-[10px] font-black ${user.role === 'admin' ? 'text-sky-500' : 'text-slate-500 dark:text-slate-300'} uppercase tracking-tighter truncate`}>{user.role || 'Member'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-navy-950/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50 overflow-hidden">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1.5 opacity-70 truncate">Lifecycle</p>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isBlocked ? 'bg-rose-500 animate-pulse' : isSuspended ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                        <p className={`text-[10px] font-black uppercase truncate tracking-tighter ${isBlocked ? 'text-rose-500' : isSuspended ? 'text-amber-500' : 'text-emerald-500'}`}>{user.status || 'Active'}</p>
                    </div>
                </div>
            </div>

            {/* Command Modules (Bottom Actions) */}
            {canManage && (
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-2">
                    <button 
                        onClick={() => onOpenDossier(user)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-500/10 hover:bg-sky-500 text-sky-500 hover:text-white transition-all font-black text-[9px] uppercase tracking-wider group/dossier border border-sky-500/20"
                    >
                        <Radar className="w-3.5 h-3.5 group-hover/dossier:animate-pulse" />
                        Dossier
                    </button>

                    {currentIsAdmin && (
                        <>
                            <button 
                                onClick={() => onOpenTransfer(user)}
                                className="w-11 h-11 rounded-xl bg-amber-500/10 hover:bg-amber-500 flex items-center justify-center transition-all text-amber-500 hover:text-white border border-amber-500/20 group/transfer"
                                title="Personnel Transfer Protocol"
                            >
                                <ArrowRightLeft className="w-4 h-4 group-hover/transfer:rotate-180 transition-transform" />
                            </button>
                            <button 
                                onClick={() => onOpenDeptShift(user)}
                                className="w-11 h-11 rounded-xl bg-indigo-500/10 hover:bg-indigo-500 flex items-center justify-center transition-all text-indigo-500 hover:text-white border border-indigo-500/20 group/dept"
                                title="Department Shifting Protocol"
                            >
                                <Building2 className="w-4 h-4 group-dept:scale-110 transition-transform" />
                            </button>
                        </>
                    )}

                    <button 
                        onClick={() => onOpenSecurity(user)}
                        className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-navy-950/50 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-all text-slate-400 hover:text-sky-500 border border-transparent hover:border-sky-500/30 group/gear"
                        title="Secure Access Protocol"
                    >
                        <Settings className="w-4 h-4 transition-transform group-hover/gear:rotate-90" />
                    </button>
                </div>
            )}


            {/* Action Button Removed - Security Protocol now lives in the Gear icon */}
        </div>
    );
};

// --- Main User List Component ---
function UserList() {
    const { isAdmin, user } = useAuth();
    const isManager = user?.role === 'manager';
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isSecurityOpen, setIsSecurityOpen] = useState(false);
    const [isDossierOpen, setIsDossierOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [isDeptOpen, setIsDeptOpen] = useState(false);
    const [isShiftOpen, setIsShiftOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const openSecurity = (user) => {
        setSelectedUser(user);
        setIsSecurityOpen(true);
    };

    const openDossier = (user) => {
        setSelectedUser(user);
        setIsDossierOpen(true);
    };

    const openTransfer = (user) => {
        setSelectedUser(user);
        setIsTransferOpen(true);
    };

    const openShift = (user) => {
        setSelectedUser(user);
        setIsShiftOpen(true);
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('users');
            // Diagnostic Sync Check
            // console.debug('Personnel Intelligence Sync:', response.data);
            setUsers(response.data);
        } catch (err) {
            toast.error('Intelligence breach: Failed to synchronize team.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(usr => {
            const query = searchQuery.toLowerCase();
            const matchesSearch = 
                usr.full_name?.toLowerCase().includes(query) ||
                usr.email?.toLowerCase().includes(query) ||
                usr.department?.toLowerCase().includes(query);
            
            const matchesRole = roleFilter === 'All' || usr.role?.toLowerCase() === roleFilter.toLowerCase();
            const matchesStatus = statusFilter === 'All' || 
                (statusFilter === 'Active' 
                    ? (!usr.status?.toLowerCase().startsWith('block') && !usr.status?.toLowerCase().startsWith('suspend'))
                    : usr.status?.toLowerCase().startsWith(statusFilter.toLowerCase().substring(0, 5)));
            
            // Debugging visibility
            if (statusFilter !== 'All' && !matchesStatus) {
                // console.debug(`User ${usr.full_name} excluded by Status Filter: ${statusFilter} (User Status: ${usr.status})`);
            }
            const matchesDept = departmentFilter === 'All' || usr.department?.toLowerCase() === departmentFilter.toLowerCase();
            return matchesSearch && matchesRole && matchesStatus && matchesDept;
        });
    }, [users, searchQuery, roleFilter, statusFilter, departmentFilter]);

    return (
        <>
            <div className="p-6 lg:p-12 max-w-[1600px] mx-auto animate-fade-in pb-32">
            {/* Command Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-10 relative z-[30]">
                <div className="space-y-4">
                    <h2 className="text-4xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                        {isManager ? 'My' : 'Personnel'} <span className="italic text-sky-500 font-extrabold underline decoration-sky-500/20 underline-offset-8">{isManager ? 'Team' : 'Directory'}</span>
                    </h2>
                    <div className="flex items-center gap-6">
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm lg:text-base tracking-tight">
                            {isManager ? 'Team Assets' : 'Registered Assets'}: <span className="text-slate-900 dark:text-white font-black">{users.length}</span>
                        </p>
                        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm lg:text-base tracking-tight">
                            Active Transmissions: <span className="text-emerald-500 font-black">{users.filter(u => u.status === 'Clocked In').length}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 w-full xl:w-auto">
                    {/* Search Engine */}
                    <div className="relative group flex-1 md:min-w-[400px]">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Identify assets..."
                            className="w-full bg-white dark:bg-navy-950/50 border border-slate-200 dark:border-slate-800 rounded-3xl py-4.5 pl-14 pr-8 text-sm font-bold dark:text-white focus:ring-4 focus:ring-sky-500/5 outline-none transition-all shadow-lg dark:shadow-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Authority Switcher */}
                    <div className="flex bg-white dark:bg-navy-950/50 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-x-auto no-scrollbar max-w-full">
                        {['All', 'Admin', 'Employee'].map(role => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-6 py-3.5 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest flex items-center gap-2 whitespace-nowrap ${
                                    roleFilter === role 
                                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' 
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                            >
                                {role === 'Admin' ? <ShieldCheck className="w-4 h-4" /> : 
                                 role === 'Employee' ? <UserCircle className="w-4 h-4" /> : 
                                 <Users className="w-4 h-4" />}
                                {role}
                            </button>
                        ))}
                    </div>

                    {/* Status Filter */}
                    <div className="flex bg-white dark:bg-navy-950/50 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-x-auto no-scrollbar max-w-full">
                        {['All', 'Active', 'Blocked', 'Suspended'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-5 py-3.5 rounded-2xl text-[9px] font-black transition-all uppercase tracking-widest flex items-center gap-2 whitespace-nowrap ${
                                    statusFilter === status 
                                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                            >
                                {status === 'Active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                                 status === 'Blocked' ? <Lock className="w-3.5 h-3.5" /> : 
                                 status === 'Suspended' ? <Clock className="w-3.5 h-3.5" /> : 
                                 <Ban className="w-3.5 h-3.5" />}
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="relative z-[60]">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsDeptOpen(!isDeptOpen); }}
                            className="bg-white dark:bg-navy-950/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] px-8 py-4 text-[10px] font-black text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase outline-none transition-all flex items-center gap-3 shadow-xl group/dept min-w-[220px]"
                        >
                            <Briefcase className="w-4 h-4 text-sky-500" />
                            <span className="flex-1 text-left truncate">{departmentFilter === 'All' ? 'All Departments' : departmentFilter}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDeptOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDeptOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsDeptOpen(false)}></div>
                                <div className="absolute top-full mt-3 left-0 w-full min-w-[240px] bg-white/95 dark:bg-navy-950/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden animate-scale-in z-50 p-2 space-y-1">
                                    <button 
                                        onClick={() => { setDepartmentFilter('All'); setIsDeptOpen(false); }}
                                        className={`w-full text-left px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
                                            departmentFilter === 'All' 
                                            ? 'bg-sky-500/10 text-sky-500' 
                                            : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <Globe className="w-4 h-4" /> All Departments
                                    </button>
                                    <div className="h-[1px] bg-slate-100 dark:bg-slate-800/50 mx-4 my-1"></div>
                                    {Array.from(new Set(users.map(u => u.department).filter(Boolean))).map(dept => (
                                        <button 
                                            key={dept}
                                            onClick={() => { setDepartmentFilter(dept); setIsDeptOpen(false); }}
                                            className={`w-full text-left px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
                                                departmentFilter === dept 
                                                ? 'bg-sky-500/10 text-sky-500' 
                                                : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            {dept === 'Engineering' ? <Cpu className="w-4 h-4" /> : 
                                             dept === 'HR' ? <Users className="w-4 h-4" /> : 
                                             dept === 'Finance' ? <Landmark className="w-4 h-4" /> : 
                                             <Briefcase className="w-4 h-4" />}
                                            {dept}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {isAdmin && (
                        <button 
                            onClick={() => setIsInviteOpen(true)}
                            className="bg-slate-900 dark:bg-white dark:text-navy-950 text-white font-black py-4.5 px-10 rounded-3xl transition-all shadow-xl hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 dark:hover:text-white active:scale-95 text-xs flex items-center gap-3"
                        >
                            <UserPlus className="w-5 h-5" />
                            Authorize
                        </button>
                    )}
                </div>
            </div>

            {/* Bento Directory Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <CardSkeleton key={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {filteredUsers.map((usr) => (
                        <MemberCard 
                            key={usr.id || usr.username} 
                            user={usr} 
                            onRefresh={fetchUsers}
                            onOpenSecurity={openSecurity}
                            onOpenDossier={openDossier}
                            onOpenTransfer={openTransfer}
                            onOpenDeptShift={openShift}
                        />
                    ))}
                </div>
            )}

            {!loading && filteredUsers.length === 0 && (
                <div className="mt-20 text-center py-40 bg-slate-50 dark:bg-navy-950/20 rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-slate-800">
                    <Radar className="w-20 h-20 text-slate-300 dark:text-slate-700 animate-pulse mx-auto mb-8" />
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Zero Contacts.</h3>
                </div>
            )}
        </div>

        <InviteUserModal 
            isOpen={isInviteOpen} 
            onClose={() => setIsInviteOpen(false)} 
            onSuccess={fetchUsers}
        />

        <SecurityModal 
            isOpen={isSecurityOpen}
            onClose={() => setIsSecurityOpen(false)}
            user={selectedUser}
            onRefresh={fetchUsers}
        />

        <DossierModal 
            isOpen={isDossierOpen}
            onClose={() => setIsDossierOpen(false)}
            user={selectedUser}
            onRefresh={fetchUsers}
        />

        <ManagerTransferModal 
            isOpen={isTransferOpen}
            onClose={() => setIsTransferOpen(false)}
            user={selectedUser}
            onRefresh={fetchUsers}
        />

        <DepartmentShiftModal 
            isOpen={isShiftOpen}
            onClose={() => setIsShiftOpen(false)}
            user={selectedUser}
            onRefresh={fetchUsers}
        />
    </>
);
}

export default UserList;
