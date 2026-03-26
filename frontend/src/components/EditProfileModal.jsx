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
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl animate-fade-in font-sans">
            <div className="bg-primary-surface border border-sky-500/20 w-full max-w-2xl rounded-[3rem] shadow-[0_0_100px_rgba(14,165,233,0.1)] overflow-hidden animate-scale-in relative">
                {/* Modal Scanner Ray */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500/30 blur-sm z-50 animate-scanner"></div>
                
                <div className="p-10 lg:p-14">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-black text-content-main tracking-tighter uppercase leading-none">
                                {isAdminView ? 'Override Protocol' : 'Identity Sync'}
                            </h2>
                            <p className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] mt-3 opacity-60">
                                {isAdminView ? `Modifying structural node: ${user.username}` : 'Recalibrating public profile data'}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-4 hover:bg-rose-500/10 hover:text-rose-500 rounded-2xl transition-all font-black text-[10px] text-content-muted uppercase tracking-widest border border-border/50">Abort</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-10">
                            {/* Common Fields */}
                            <div className="space-y-4 group">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] ml-1 group-focus-within:text-sky-500 transition-colors opacity-60">Visible Identity</label>
                                <input 
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                    placeholder="Enter your full name"
                                    className="w-full bg-primary-surface/50 border-2 border-border/40 hover:border-sky-500/30 focus:border-sky-500 rounded-3xl py-4 px-8 font-black text-content-main outline-none transition-all shadow-sm focus:shadow-2xl focus:shadow-sky-500/10 placeholder:text-content-muted/20"
                                />
                            </div>
                            <div className="space-y-4 group">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] ml-1 group-focus-within:text-sky-500 transition-colors opacity-60">Secure Link</label>
                                <input 
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    placeholder="+1 234 567 890"
                                    className="w-full bg-primary-surface/50 border-2 border-border/40 hover:border-sky-500/30 focus:border-sky-500 rounded-3xl py-4 px-8 font-black text-content-main outline-none transition-all shadow-sm focus:shadow-2xl focus:shadow-sky-500/10 placeholder:text-content-muted/20"
                                />
                            </div>

                            {/* Bio (Full Width) */}
                            <div className="col-span-2 space-y-4 group">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] ml-1 group-focus-within:text-sky-500 transition-colors opacity-60">Strategic Dossier Overview</label>
                                <textarea 
                                    rows="4"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                    className="w-full bg-primary-surface/50 border-2 border-border/40 hover:border-sky-500/30 focus:border-sky-500 rounded-[2.5rem] py-5 px-8 font-black text-content-main outline-none transition-all resize-none shadow-sm focus:shadow-2xl focus:shadow-sky-500/10 placeholder:text-content-muted/20 leading-relaxed"
                                    placeholder="Initialize profile description protocol..."
                                />
                            </div>

                            {/* Admin Only Fields */}
                            {isAdminView && (
                                <>
                                    <div className="space-y-4 group">
                                        <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] ml-1 group-focus-within:text-sky-500 transition-colors opacity-60">Authority Level</label>
                                        <div className="relative">
                                            <select 
                                                value={formData.role}
                                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                                className="w-full bg-primary-surface/50 border-2 border-border/40 hover:border-sky-500/30 focus:border-sky-500 rounded-3xl py-4 px-8 font-black text-content-main outline-none transition-all appearance-none cursor-pointer shadow-sm uppercase tracking-widest"
                                            >
                                                {roles.map(r => <option key={r} value={r} className="bg-primary-surface">{r}</option>)}
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-sky-500">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4 group">
                                        <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] ml-1 group-focus-within:text-sky-500 transition-colors opacity-60">Node Pulse</label>
                                        <div className="relative">
                                            <select 
                                                value={formData.status}
                                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                                className="w-full bg-primary-surface/50 border-2 border-border/40 hover:border-sky-500/30 focus:border-sky-500 rounded-3xl py-4 px-8 font-black text-content-main outline-none transition-all appearance-none cursor-pointer shadow-sm uppercase tracking-widest"
                                            >
                                                <option value="Active" className="bg-primary-surface">ACTIVE</option>
                                                <option value="Deactivated" className="bg-primary-surface">DEACTIVATED</option>
                                                <option value="Away" className="bg-primary-surface">AWAY</option>
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-sky-500">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-6 pt-10">
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="flex-1 py-6 bg-gradient-to-r from-sky-600 to-sky-500 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
                            >
                                {isSaving ? <IconSync className="w-6 h-6 animate-spin-slow" /> : (
                                    <>
                                        <span>Initialize Sync</span>
                                        <IconSync className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </>
                                )}
                            </button>
                            {isAdminView && (
                                <button 
                                    type="button"
                                    className="p-6 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-[2.5rem] hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-rose-500/5 group"
                                    title="Deactivate Account"
                                >
                                    <IconTrash className="w-8 h-8 group-hover:scale-110 transition-transform" />
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
