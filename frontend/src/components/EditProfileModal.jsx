import React, { useState } from 'react';
import { IconSync, IconTrash } from './Icons';

const EditProfileModal = ({ 
    isOpen, 
    onClose, 
    user, 
    onSave, 
    isAdminView = false,
    departments = [],
    roles = ['admin', 'manager', 'employee']
}) => {
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        profile_photo: user?.profile_photo || '',
        role: user?.role || '',
        department_id: user?.department_id || '',
        status: user?.status || 'Active'
    });

    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/20 dark:bg-navy-950/40 backdrop-blur-md animate-fade-in">
            <div className="bg-primary-surface border border-border w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-10">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-content-main tracking-tight">
                                {isAdminView ? 'Administrative Control' : 'Personal Identity'}
                            </h2>
                            <p className="text-xs font-bold text-content-muted uppercase tracking-widest mt-1">
                                {isAdminView ? `Modifying ${user.full_name}'s record` : 'Update your public persona'}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-primary-muted rounded-2xl transition-all font-bold text-content-muted">ESC</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Common Fields */}
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.15em] ml-1 group-focus-within:text-sky-500 transition-colors">Visible Name</label>
                                <input 
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                    placeholder="Enter your full name"
                                    className="w-full bg-primary-surface border-2 border-border/60 hover:border-border focus:border-sky-500/50 rounded-2xl py-3.5 px-6 font-bold text-content-main outline-none transition-all shadow-sm focus:shadow-lg focus:shadow-sky-500/5 placeholder:text-content-muted/30"
                                />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.15em] ml-1 group-focus-within:text-sky-500 transition-colors">Secure Contact</label>
                                <input 
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    placeholder="+1 234 567 890"
                                    className="w-full bg-primary-surface border-2 border-border/60 hover:border-border focus:border-sky-500/50 rounded-2xl py-3.5 px-6 font-bold text-content-main outline-none transition-all shadow-sm focus:shadow-lg focus:shadow-sky-500/5 placeholder:text-content-muted/30"
                                />
                            </div>

                            {/* Bio (Full Width) */}
                            <div className="col-span-2 space-y-2 group">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.15em] ml-1 group-focus-within:text-sky-500 transition-colors">Professional Bio</label>
                                <textarea 
                                    rows="3"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    className="w-full bg-primary-surface border-2 border-border/60 hover:border-border focus:border-sky-500/50 rounded-[2rem] py-4 px-6 font-bold text-content-main outline-none transition-all resize-none shadow-sm focus:shadow-lg focus:shadow-sky-500/5 placeholder:text-content-muted/30"
                                    placeholder="Write something about yourself..."
                                />
                            </div>

                            {/* Admin Only Fields */}
                            {isAdminView && (
                                <>
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.15em] ml-1 group-focus-within:text-sky-500 transition-colors">Strategic Role</label>
                                        <div className="relative">
                                            <select 
                                                value={formData.role}
                                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                                className="w-full bg-primary-surface border-2 border-border/60 hover:border-border focus:border-sky-500/50 rounded-2xl py-3.5 px-6 font-bold text-content-main outline-none transition-all appearance-none cursor-pointer shadow-sm"
                                            >
                                                {roles.map(r => <option key={r} value={r} className="bg-primary-surface">{r.toUpperCase()}</option>)}
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-content-muted">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.15em] ml-1 group-focus-within:text-sky-500 transition-colors">Current Status</label>
                                        <div className="relative">
                                            <select 
                                                value={formData.status}
                                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                                className="w-full bg-primary-surface border-2 border-border/60 hover:border-border focus:border-sky-500/50 rounded-2xl py-3.5 px-6 font-bold text-content-main outline-none transition-all appearance-none cursor-pointer shadow-sm"
                                            >
                                                <option value="Active" className="bg-primary-surface">ACTIVE</option>
                                                <option value="Deactivated" className="bg-primary-surface">DEACTIVATED</option>
                                                <option value="Away" className="bg-primary-surface">AWAY</option>
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-content-muted">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="flex-1 py-5 bg-sky-500 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                {isSaving ? <IconSync className="w-5 h-5 animate-spin-slow" /> : 'Commit Changes'}
                            </button>
                            {isAdminView && (
                                <button 
                                    type="button"
                                    className="p-5 bg-rose-500/10 text-rose-500 border border-rose-500/10 rounded-[2rem] hover:bg-rose-500/20 transition-all"
                                    title="Deactivate Account"
                                >
                                    <IconTrash className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
