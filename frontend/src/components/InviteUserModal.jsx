import React, { useState } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const InviteUserModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ 
        full_name: '', 
        username: '', 
        email: '', 
        role: 'employee',
        department: 'General'
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiClient.post('users', { 
                ...formData, 
                password: 'TemporaryPassword123!' 
            });
            toast.success(`User Invited Successfully!`, {
                style: { borderRadius: '15px', background: '#0B1120', color: '#fff' }
            });
            onSuccess();
            onClose();
        } catch (err) {
            // Error handled by interceptor
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-primary/80 backdrop-blur-md animate-fade-in">
            <div className="bg-primary-surface w-full max-w-xl rounded-[2.5rem] p-12 shadow-2xl border border-border animate-scale-in relative overflow-hidden">
                {/* Ambient Decorative Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-3xl font-black text-content-main tracking-tighter leading-none">Invite Member.</h3>
                            <p className="text-content-muted font-bold text-xs uppercase tracking-widest mt-3">Personnel Authorization Hub</p>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-primary-muted hover:bg-border flex items-center justify-center transition-all text-content-muted hover:text-content-main font-bold">✕</button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-widest ml-1">Full Name</label>
                                <input 
                                    required 
                                    className="w-full bg-primary-muted border border-border rounded-2xl p-5 text-sm font-bold text-content-main focus:border-sky-500 outline-none transition-all placeholder:text-content-muted/50"
                                    value={formData.full_name}
                                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                                    placeholder="e.g. James Wilson"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-widest ml-1">System Username</label>
                                <input 
                                    required 
                                    className="w-full bg-primary-muted border border-border rounded-2xl p-5 text-sm font-bold text-content-main focus:border-sky-500 outline-none transition-all placeholder:text-content-muted/50"
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                    placeholder="j_wilson"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-content-muted uppercase tracking-widest ml-1">Corporate Email</label>
                            <input 
                                required 
                                type="email"
                                className="w-full bg-primary-muted border border-border rounded-2xl p-5 text-sm font-bold text-content-main focus:border-sky-500 outline-none transition-all placeholder:text-content-muted/50"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                placeholder="james@optioffice.com"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-widest ml-1">Authority Level</label>
                                <div className="relative group">
                                    <select 
                                        className="w-full bg-primary-muted border border-border rounded-2xl p-5 pr-12 text-sm font-bold text-content-main focus:border-sky-500 outline-none transition-all appearance-none cursor-pointer hover:bg-border/50"
                                        value={formData.role}
                                        onChange={e => setFormData({...formData, role: e.target.value})}
                                    >
                                        <option value="employee" className="bg-primary-surface text-content-main">Employee (Standard)</option>
                                        <option value="manager" className="bg-primary-surface text-content-main">Manager (Elevated)</option>
                                        <option value="admin" className="bg-primary-surface text-content-main">Administrator (Full)</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-content-muted group-hover:text-sky-500 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-widest ml-1">Department</label>
                                <div className="relative group">
                                    <select 
                                        className="w-full bg-primary-muted border border-border rounded-2xl p-5 pr-12 text-sm font-bold text-content-main focus:border-sky-500 outline-none transition-all appearance-none cursor-pointer hover:bg-border/50"
                                        value={formData.department}
                                        onChange={e => setFormData({...formData, department: e.target.value})}
                                    >
                                        <option value="General" className="bg-primary-surface text-content-main">General</option>
                                        <option value="Engineering" className="bg-primary-surface text-content-main">Engineering</option>
                                        <option value="Design" className="bg-primary-surface text-content-main">Design</option>
                                        <option value="Operations" className="bg-primary-surface text-content-main">Operations</option>
                                        <option value="Finance" className="bg-primary-surface text-content-main">Finance</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-content-muted group-hover:text-sky-500 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button 
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-primary-muted hover:bg-border text-content-muted font-black py-5 rounded-3xl transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="flex-[2] bg-sky-500 hover:bg-sky-400 text-white font-black py-5 rounded-3xl transition-all shadow-2xl shadow-sky-500/30 active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? 'Authenticating...' : 'Dispatch Authorization'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InviteUserModal;
