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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-navy-950/80 backdrop-blur-md animate-fade-in">
            <div className="bg-[#0B1120] w-full max-w-xl rounded-[2.5rem] p-12 shadow-2xl border border-slate-800 animate-scale-in relative overflow-hidden">
                {/* Ambient Decorative Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tighter leading-none">Invite Member.</h3>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-3">Personnel Authorization Hub</p>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-slate-400 hover:text-white">✕</button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                <input 
                                    required 
                                    className="w-full bg-white/5 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-sky-500 outline-none transition-all placeholder:text-slate-700"
                                    value={formData.full_name}
                                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                                    placeholder="e.g. James Wilson"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">System Username</label>
                                <input 
                                    required 
                                    className="w-full bg-white/5 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-sky-500 outline-none transition-all placeholder:text-slate-700"
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                    placeholder="j_wilson"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Corporate Email</label>
                            <input 
                                required 
                                type="email"
                                className="w-full bg-white/5 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-sky-500 outline-none transition-all placeholder:text-slate-700"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                placeholder="james@optioffice.com"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Authority Level</label>
                                <select 
                                    className="w-full bg-white/5 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-sky-500 outline-none transition-all appearance-none cursor-pointer"
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="employee">Employee (Standard)</option>
                                    <option value="manager">Manager (Elevated)</option>
                                    <option value="admin">Administrator (Full)</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Department</label>
                                <select 
                                    className="w-full bg-white/5 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white focus:border-sky-500 outline-none transition-all appearance-none cursor-pointer"
                                    value={formData.department}
                                    onChange={e => setFormData({...formData, department: e.target.value})}
                                >
                                    <option value="General">General</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Design">Design</option>
                                    <option value="Operations">Operations</option>
                                    <option value="Finance">Finance</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button 
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 font-black py-5 rounded-3xl transition-all"
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
