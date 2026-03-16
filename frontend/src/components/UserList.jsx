import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { CardSkeleton } from './Skeleton';

// --- Member Card Sub-Component ---
const MemberCard = ({ user }) => {
    const initials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
    const isOnline = user.status === 'Clocked In' || user.status === 'Online';

    return (
        <div className="bg-white dark:bg-slate-800/40 backdrop-blur-md rounded-[2rem] p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-2xl hover:border-sky-500/50 transition-all duration-500 group relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors"></div>
            
            <div className="flex items-center gap-5 mb-6">
                {/* Avatar Badge: Circular Slate Frame */}
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-600 flex items-center justify-center shadow-inner relative shrink-0">
                    <span className="text-lg font-black text-slate-400 dark:text-slate-300 tracking-tighter">{initials}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter truncate group-hover:text-sky-500 transition-colors">
                            {user.full_name}
                        </h3>
                        {/* Live Status Indicator: Pulsing dot next to name */}
                        {isOnline && (
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                        )}
                    </div>
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest truncate">
                        {user.email}
                    </p>
                </div>
            </div>

            {/* Department & Identity Block */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workspace Role</span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${
                        user.role === 'admin' 
                        ? 'bg-sky-500/10 text-sky-600 border border-sky-500/20' 
                        : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
                    } uppercase tracking-widest`}>
                        {user.role || 'Member'}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</span>
                    <span className="text-[10px] font-bold text-slate-900 dark:text-slate-200 uppercase tracking-tight">
                        {user.department || 'General'}
                    </span>
                </div>
            </div>

            {/* Action Footer (Coming in Part 2) */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-black text-sky-500 uppercase tracking-tighter">View Detailed Profile</span>
                <button className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all">
                    <span className="text-xs">➡️</span>
                </button>
            </div>
        </div>
    );
};

// --- Invite User Modal Component (Updated for Part 1/2 Sync) ---
const InviteModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ full_name: '', username: '', email: '', role: 'employee' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiClient.post('users', { ...formData, password: 'TemporaryPassword123!' });
            toast.success(`User Invited Successfully!`, {
                style: { borderRadius: '15px', background: '#0B1120', color: '#fff' }
            });
            onSuccess();
            onClose();
        } catch (err) {} finally { setSubmitting(false); }
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-navy-900 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-8">Invite Team Member</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input required className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold dark:text-white" placeholder="Full Name" onChange={e => setFormData({...formData, full_name: e.target.value})} />
                    <input required type="email" className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold dark:text-white" placeholder="Email Address" onChange={e => setFormData({...formData, email: e.target.value})} />
                    <select className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold dark:text-white" onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button type="submit" disabled={submitting} className="w-full bg-sky-500 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-sky-500/20 active:scale-95">
                        {submitting ? 'Processing...' : 'Dispatch Invitation'}
                    </button>
                    <button type="button" onClick={onClose} className="w-full text-slate-400 font-bold text-sm">Cancel</button>
                </form>
            </div>
        </div>
    );
};

// --- Main User List Component ---
function UserList() {
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
            toast.error('Failed to load team');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const query = searchQuery.toLowerCase();
            const matchesSearch = 
                user.full_name?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query) ||
                user.department?.toLowerCase().includes(query);
            
            const matchesRole = roleFilter === 'All' || user.role === roleFilter.toLowerCase();
            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, roleFilter]);

    return (
        <div className="p-10 max-w-[1600px] mx-auto animate-fade-in transition-colors duration-500">
            {/* Command Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8">
                <div>
                    <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                        Team <span className="italic text-sky-500 font-extrabold">Hub.</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-6 text-xl tracking-tight max-w-xl">
                        Supervision of <span className="text-sky-500">{users.length}</span> personnel assets across all departments.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
                    {/* Intelligent Search Input */}
                    <div className="relative group flex-1 lg:min-w-[400px]">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">🔍</span>
                        <input 
                            type="text"
                            placeholder="Filter by name, email, or department..."
                            className="w-full bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] py-5 pl-14 pr-6 text-sm font-bold dark:text-white focus:ring-4 focus:ring-sky-500/10 outline-none transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Quick-Toggle Role Switcher */}
                    <div className="flex bg-slate-100 dark:bg-navy-950 p-1.5 rounded-[1.5rem] border border-slate-200 dark:border-slate-800">
                        {['All', 'Admin', 'Employee'].map(role => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-8 py-3.5 rounded-2xl text-[11px] font-black transition-all uppercase tracking-widest ${
                                    roleFilter === role 
                                    ? 'bg-white dark:bg-slate-800 text-sky-500 shadow-xl dark:shadow-none' 
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => setIsInviteOpen(true)}
                        className="bg-sky-500 hover:bg-sky-400 text-white font-black py-5 px-10 rounded-[1.5rem] transition-all shadow-2xl shadow-sky-500/30 active:scale-95 text-sm flex items-center gap-3"
                    >
                        <span className="text-xl">➕</span>
                        Invite Member
                    </button>
                </div>
            </div>

            {/* Bento Directory Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <CardSkeleton key={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredUsers.map((user) => (
                        <MemberCard key={user._id || user.username} user={user} />
                    ))}
                </div>
            )}

            {/* Filter Results Check */}
            {!loading && filteredUsers.length === 0 && (
                <div className="mt-12 text-center py-32 bg-slate-100/50 dark:bg-navy-900/20 rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-slate-800/50">
                    <div className="text-6xl mb-6 grayscale">🕵️‍♂️</div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Zero matches found.</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">Adjust your intelligence parameters and try again.</p>
                </div>
            )}

            <InviteModal 
                isOpen={isInviteOpen} 
                onClose={() => setIsInviteOpen(false)} 
                onSuccess={fetchUsers}
            />
        </div>
    );
}

export default UserList;
