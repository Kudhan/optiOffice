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

const InviteUserModal = ({ isOpen, onClose, onSuccess }) => {
    const [departments, setDepartments] = useState([]);
    const [loadingDepts, setLoadingDepts] = useState(false);
    const [formData, setFormData] = useState({ 
        full_name: '', 
        username: '', 
        email: '', 
        role: 'employee',
        department: 'General'
    });

    useEffect(() => {
        if (isOpen) {
            fetchDepts();
        }
    }, [isOpen]);

    const fetchDepts = async () => {
        try {
            setLoadingDepts(true);
            const res = await apiClient.get('/departments');
            const mapped = res.data.map(d => ({
                value: d.name,
                label: d.name,
                icon: d.name === 'Engineering' ? '⚙️' : d.name === 'HR' ? '👤' : d.name === 'Finance' ? '💰' : d.name === 'General' ? '🌐' : '🏢'
            }));
            setDepartments(mapped);
        } catch (err) {
            console.error("Failed to load departments");
        } finally {
            setLoadingDepts(false);
        }
    };
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
        <div className="fixed inset-0 z-[999] flex items-start justify-center p-6 bg-navy-950/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white/80 dark:bg-navy-950/80 backdrop-blur-2xl w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl border border-white/20 dark:border-white/10 animate-scale-in relative overflow-visible">
                {/* Ambient Decorative Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-3xl font-black text-content-main tracking-tighter leading-none uppercase">Invite <span className="text-sky-500 italic">Personnel</span></h3>
                            <p className="text-content-muted font-black text-[9px] uppercase tracking-[0.4em] mt-3 opacity-70">Authorization Hub</p>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-primary-muted/50 rounded-xl hover:bg-rose-500 hover:text-white transition-all font-black text-content-muted border border-border/40">✕</button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-sky-500 transition-colors">Full Name</label>
                                <input 
                                    required 
                                    className="w-full bg-primary-muted/30 border-2 border-transparent focus:border-sky-500/50 focus:bg-white dark:focus:bg-navy-950 rounded-2xl py-4 px-6 text-[11px] font-black uppercase tracking-widest text-content-main outline-none transition-all shadow-inner placeholder:text-content-muted/30"
                                    value={formData.full_name}
                                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                                    placeholder="JAMES WILSON"
                                />
                            </div>
                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-sky-500 transition-colors">Username</label>
                                <input 
                                    required 
                                    className="w-full bg-primary-muted/30 border-2 border-transparent focus:border-sky-500/50 focus:bg-white dark:focus:bg-navy-950 rounded-2xl py-4 px-6 text-[11px] font-black uppercase tracking-widest text-content-main outline-none transition-all shadow-inner placeholder:text-content-muted/30"
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                    placeholder="J_WILSON"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 group">
                            <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.2em] ml-1 group-focus-within:text-sky-500 transition-colors">Corporate Email</label>
                            <input 
                                required 
                                type="email"
                                className="w-full bg-primary-muted/30 border-2 border-transparent focus:border-sky-500/50 focus:bg-white dark:focus:bg-navy-950 rounded-2xl py-4 px-6 text-[11px] font-black lowercase tracking-widest text-content-main outline-none transition-all shadow-inner placeholder:text-content-muted/30"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                placeholder="james@optioffice.com"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
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
                                options={departments.length > 0 ? departments : [{ value: 'General', label: 'General', icon: '🌐' }]}
                            />
                        </div>

                        <div className="pt-6 flex gap-4">
                            <button 
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-primary-muted/50 hover:bg-rose-500/10 hover:text-rose-500 text-content-muted font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-[10px] border border-border/40"
                            >
                                Abort
                            </button>
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="flex-[2] bg-sky-500 hover:bg-sky-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-sky-500/20 active:scale-95 disabled:opacity-50 uppercase tracking-widest text-[10px] overflow-hidden relative group"
                            >
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
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
