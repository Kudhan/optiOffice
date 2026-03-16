import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { CardSkeleton } from './Skeleton';

// --- Invite User Modal Component ---
const InviteModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ 
        full_name: '', 
        username: '', 
        email: '', 
        role: 'employee', 
        password: 'TemporaryPassword123!' 
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiClient.post('users', formData);
            toast.success(`User Invited Successfully!`, {
                icon: '📩',
                style: { borderRadius: '15px', background: '#0B1120', color: '#fff' }
            });
            onSuccess();
            onClose();
        } catch (err) {
            // Error handled by interceptor (e.g. "Email already exists")
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-navy-900 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-in">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Invite Team Member</h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-xl">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                        <input 
                            required 
                            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold dark:text-white"
                            value={formData.full_name}
                            onChange={e => setFormData({...formData, full_name: e.target.value})}
                            placeholder="Alex Carter"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Username</label>
                            <input 
                                required 
                                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold dark:text-white"
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                                placeholder="alex_c"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Role</label>
                            <select 
                                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold dark:text-white appearance-none"
                                value={formData.role}
                                onChange={e => setFormData({...formData, role: e.target.value})}
                            >
                                <option value="employee">Employee</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                        <input 
                            required 
                            type="email"
                            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold dark:text-white"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            placeholder="alex@optioffice.com"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full bg-sky-500 hover:bg-sky-400 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-sky-500/20 active:scale-95 disabled:opacity-50"
                    >
                        {submitting ? 'Sending Invite...' : 'Dispatch Invitation'}
                    </button>
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
            toast.error('Failed to load team', {
                style: { borderRadius: '15px', background: '#0B1120', color: '#fff' }
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = 
                user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesRole = roleFilter === 'All' || user.role === roleFilter.toLowerCase();
            
            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, roleFilter]);

    return (
        <div className="p-10 max-w-[1600px] mx-auto animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
                <div>
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                        Team <span className="italic text-sky-500 font-extrabold">Hub.</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-4 text-lg tracking-tight">
                        Managing {users.length} active workspace members
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 lg:min-w-[300px]">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 italic text-sm">🔍</span>
                        <input 
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold dark:text-white focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Role Filter */}
                    <div className="flex bg-white dark:bg-navy-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        {['All', 'Admin', 'Employee'].map(role => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${
                                    roleFilter === role 
                                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' 
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                                }`}
                            >
                                {role.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => setIsInviteOpen(true)}
                        className="bg-sky-500 hover:bg-sky-400 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-xl shadow-sky-500/20 active:scale-95 text-sm flex items-center gap-2"
                    >
                        <span>👤+</span>
                        Invite User
                    </button>
                </div>
            </div>

            {/* Bento Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <CardSkeleton key={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredUsers.map((user) => (
                        <div 
                            key={user._id}
                            className="bg-white dark:bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:border-sky-500/30 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-slate-100 dark:bg-navy-950 rounded-2xl flex items-center justify-center text-2xl relative">
                                    👤
                                    {/* Pulsing Status Dot */}
                                    {user.status === 'Clocked In' && (
                                        <div className="absolute -top-1 -right-1 flex h-4 w-4">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-800"></span>
                                        </div>
                                    )}
                                </div>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full ${
                                    user.role === 'admin' ? 'bg-amber-500/10 text-amber-600' : 'bg-sky-500/10 text-sky-600'
                                } uppercase tracking-widest`}>
                                    {user.role || 'Member'}
                                </span>
                            </div>

                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2 group-hover:text-sky-500 transition-colors">
                                {user.full_name}
                            </h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">
                                {user.email}
                            </p>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Last Active: <span className="text-slate-900 dark:text-slate-300">Today</span>
                                </div>
                                <button className="text-slate-400 hover:text-sky-500 transition-colors text-lg">
                                    ⋯
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredUsers.length === 0 && (
                <div className="text-center py-24 bg-slate-50 dark:bg-navy-900/30 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                    <span className="text-6xl mb-6 block">🛸</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">No members found.</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Try adjusting your search or role filter.</p>
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
