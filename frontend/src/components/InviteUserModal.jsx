import React, { useState, useRef, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

// Custom styled dropdown replacing native <select>
const CustomSelect = ({ value, onChange, options, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selected = options.find(o => o.value === value);

    return (
        <div className="space-y-2 group" ref={ref}>
            <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.15em] ml-1 group-focus-within:text-sky-500 transition-colors">{label}</label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(prev => !prev)}
                    className={`w-full bg-primary-surface border-2 ${isOpen ? 'border-sky-500/50 shadow-lg shadow-sky-500/5' : 'border-border/60 hover:border-border'} rounded-2xl py-3 px-5 text-sm font-bold text-content-main outline-none transition-all text-left flex items-center justify-between shadow-sm`}
                >
                    <span className="flex items-center gap-2.5">
                        {selected?.icon && <span className="text-base">{selected.icon}</span>}
                        {selected?.label}
                    </span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14" height="14"
                        viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="3"
                        strokeLinecap="round" strokeLinejoin="round"
                        className={`text-content-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    >
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute left-0 right-0 mt-2 z-50 bg-white/95 dark:bg-navy-950/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-1.5 space-y-0.5">
                            {options.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                    className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                        value === opt.value
                                            ? 'bg-sky-500/10 text-sky-500'
                                            : 'text-content-muted hover:bg-primary-muted hover:text-content-main'
                                    }`}
                                >
                                    {opt.icon && <span className="text-base">{opt.icon}</span>}
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-wider">{opt.label}</p>
                                        {opt.desc && <p className="text-[9px] font-semibold opacity-60 mt-0.5">{opt.desc}</p>}
                                    </div>
                                    {value === opt.value && (
                                        <svg className="ml-auto text-sky-500 shrink-0" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ROLES = [
    { value: 'employee', label: 'Employee', icon: '👤', desc: 'Standard access · Read-only operations' },
    { value: 'manager', label: 'Manager', icon: '🏢', desc: 'Elevated access · Team oversight' },
    { value: 'admin', label: 'Administrator', icon: '👑', desc: 'Full access · System control' },
];

const DEPARTMENTS = [
    { value: 'General', label: 'General', icon: '🌐' },
    { value: 'Engineering', label: 'Engineering', icon: '⚙️' },
    { value: 'Design', label: 'Design', icon: '🎨' },
    { value: 'Operations', label: 'Operations', icon: '📊' },
    { value: 'Finance', label: 'Finance', icon: '💰' },
];

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
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/20 dark:bg-navy-950/40 backdrop-blur-md animate-fade-in">
            <div className="bg-primary-surface w-full max-w-xl rounded-[3rem] p-8 lg:p-10 shadow-2xl border border-border animate-scale-in relative overflow-visible">
                {/* Ambient Decorative Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-content-main tracking-tighter leading-none">Invite Member</h3>
                            <p className="text-content-muted font-bold text-[10px] uppercase tracking-widest mt-2 opacity-70">Personnel Authorization Hub</p>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-primary-muted rounded-2xl transition-all font-bold text-content-muted">ESC</button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.15em] ml-1 group-focus-within:text-sky-500 transition-colors">Full Name</label>
                                <input 
                                    required 
                                    className="w-full bg-primary-surface border-2 border-border/60 hover:border-border focus:border-sky-500/50 rounded-2xl py-3 px-5 text-sm font-bold text-content-main outline-none transition-all shadow-sm focus:shadow-lg focus:shadow-sky-500/5 placeholder:text-content-muted/30"
                                    value={formData.full_name}
                                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                                    placeholder="James Wilson"
                                />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.15em] ml-1 group-focus-within:text-sky-500 transition-colors">Username</label>
                                <input 
                                    required 
                                    className="w-full bg-primary-surface border-2 border-border/60 hover:border-border focus:border-sky-500/50 rounded-2xl py-3 px-5 text-sm font-bold text-content-main outline-none transition-all shadow-sm focus:shadow-lg focus:shadow-sky-500/5 placeholder:text-content-muted/30"
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                    placeholder="j_wilson"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.15em] ml-1 group-focus-within:text-sky-500 transition-colors">Corporate Email</label>
                            <input 
                                required 
                                type="email"
                                className="w-full bg-primary-surface border-2 border-border/60 hover:border-border focus:border-sky-500/50 rounded-2xl py-3 px-5 text-sm font-bold text-content-main outline-none transition-all shadow-sm focus:shadow-lg focus:shadow-sky-500/5 placeholder:text-content-muted/30"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                placeholder="james@optioffice.com"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <CustomSelect
                                label="Authority Level"
                                value={formData.role}
                                onChange={val => setFormData({...formData, role: val})}
                                options={ROLES}
                            />
                            <CustomSelect
                                label="Department"
                                value={formData.department}
                                onChange={val => setFormData({...formData, department: val})}
                                options={DEPARTMENTS}
                            />
                        </div>

                        <div className="pt-2 flex gap-4">
                            <button 
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-primary-muted hover:bg-border text-content-muted font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-[10px]"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="flex-[2] bg-sky-500 hover:bg-sky-400 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-sky-500/20 active:scale-95 disabled:opacity-50 uppercase tracking-widest text-[10px]"
                            >
                                {submitting ? 'Identifying...' : 'Dispatch Invitation'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InviteUserModal;
