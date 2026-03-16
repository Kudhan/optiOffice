import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/client';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { CardSkeleton } from './Skeleton';
import InviteUserModal from './InviteUserModal';

// --- Member Card Sub-Component ---
const MemberCard = ({ user, onRefresh }) => {
    const { isAdmin: currentIsAdmin } = useAuth();
    const [showActions, setShowActions] = useState(false);
    const initials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
    const isOnline = user.status === 'Clocked In' || user.status === 'Online';

    const handleRoleChange = async (newRole) => {
        try {
            await apiClient.patch(`users/${user._id}`, { role: newRole });
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
                                await apiClient.delete(`users/${user._id}`);
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

    return (
        <div className="bg-white dark:bg-slate-800/40 backdrop-blur-md rounded-[2.5rem] p-7 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-2xl hover:border-sky-500/50 transition-all duration-500 group relative">
            
            {/* Admin Action Menu: Physically hidden for non-admins */}
            {currentIsAdmin && (
                <div className="absolute top-6 right-6 z-20">
                    <button 
                        onClick={() => setShowActions(!showActions)}
                        className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-navy-950/50 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-all text-slate-400 hover:text-sky-500 border border-transparent hover:border-sky-500/30"
                    >
                        <span className="text-lg">⚙️</span>
                    </button>
                    
                    {showActions && (
                        <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-[#0B1120] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 overflow-hidden animate-scale-in">
                            <button onClick={() => handleRoleChange('admin')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-sky-500/10 hover:text-sky-500 rounded-xl transition-all">Promote to Admin</button>
                            <button onClick={() => handleRoleChange('employee')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-sky-500/10 hover:text-sky-500 rounded-xl transition-all">Demote to Employee</button>
                            <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-2 mx-2"></div>
                            <button onClick={handleRemove} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">Terminate Access</button>
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 border-4 border-white dark:border-slate-800 flex items-center justify-center shadow-xl relative mb-4">
                    <span className="text-2xl font-black text-slate-400 dark:text-slate-300 tracking-tighter">{initials}</span>
                </div>

                <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-sky-500 transition-colors leading-none">
                        {user.full_name}
                    </h3>
                    {isOnline && (
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-800"></span>
                        </span>
                    )}
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                    {user.email}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 dark:bg-navy-950/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Authorization</p>
                    <p className={`text-[10px] font-black ${user.role === 'admin' ? 'text-sky-500' : 'text-slate-500 dark:text-slate-300'} uppercase`}>{user.role || 'Member'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-navy-950/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Deployment</p>
                    <p className="text-[10px] font-black text-slate-900 dark:text-slate-300 uppercase truncate">{user.department || 'HQ-GEN'}</p>
                </div>
            </div>

            <button className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white/5 text-white dark:text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 transition-all border border-transparent hover:border-sky-500/50">
                Secure Access Profile
            </button>
        </div>
    );
};

// --- Main User List Component ---
function UserList() {
    const { isAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('users');
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
            
            const matchesRole = roleFilter === 'All' || usr.role === roleFilter.toLowerCase();
            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, roleFilter]);

    return (
        <div className="p-10 max-w-[1600px] mx-auto animate-fade-in pb-32">
            {/* Command Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-16 gap-10">
                <div>
                    <h2 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-6">
                        Personnel <span className="italic text-sky-500 font-extrabold underline decoration-sky-500/20 underline-offset-8">Directory.</span>
                    </h2>
                    <div className="flex items-center gap-6">
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-xl tracking-tight">
                            Total Registered Assets: <span className="text-slate-900 dark:text-white">{users.length}</span>
                        </p>
                        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-xl tracking-tight">
                            Active Transmissions: <span className="text-emerald-500">{users.filter(u => u.status === 'Clocked In').length}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 w-full xl:w-auto">
                    {/* Search Engine */}
                    <div className="relative group flex-1 xl:min-w-[450px]">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors font-black flex items-center gap-2">
                            <span>🔍</span>
                        </span>
                        <input 
                            type="text"
                            placeholder="Identify assets..."
                            className="w-full bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] py-6 pl-16 pr-8 text-sm font-bold dark:text-white focus:ring-8 focus:ring-sky-500/5 outline-none transition-all shadow-xl dark:shadow-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Authority Switcher */}
                    <div className="flex bg-white dark:bg-navy-950 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl">
                        {['All', 'Admin', 'Employee'].map(role => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-10 py-4 rounded-[1.5rem] text-[10px] font-black transition-all uppercase tracking-[0.2em] ${
                                    roleFilter === role 
                                    ? 'bg-sky-500 text-white shadow-2xl shadow-sky-500/40' 
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>

                    {isAdmin && (
                        <button 
                            onClick={() => setIsInviteOpen(true)}
                            className="bg-slate-900 dark:bg-white dark:text-navy-950 text-white font-black py-6 px-12 rounded-[2rem] transition-all shadow-2xl hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 dark:hover:text-white active:scale-95 text-sm flex items-center gap-4"
                        >
                            <span className="text-xl">➕</span>
                            Authorize Member
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
                            key={usr._id || usr.username} 
                            user={usr} 
                            onRefresh={fetchUsers}
                        />
                    ))}
                </div>
            )}

            {!loading && filteredUsers.length === 0 && (
                <div className="mt-20 text-center py-40 bg-slate-50 dark:bg-navy-950/20 rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="text-8xl mb-8 group-hover:animate-bounce transition-transform">🛰️</div>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Zero Contacts.</h3>
                </div>
            )}

            <InviteUserModal 
                isOpen={isInviteOpen} 
                onClose={() => setIsInviteOpen(false)} 
                onSuccess={fetchUsers}
            />
        </div>
    );
}

export default UserList;
