import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { IconSync, IconTrash, IconShield } from './Icons';

const EditProfileModal = ({ 
    isOpen, 
    onClose, 
    user, 
    onSave, 
    isAdminView = false,
    isViewerAdmin = false,
    departments = [],
    roles = ['admin', 'manager', 'employee']
}) => {
    const [activeSection, setActiveSection] = useState('public');
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        publicProfile: {
            preferredName: user?.publicProfile?.preferredName || user?.full_name || '',
            bio: user?.publicProfile?.bio || user?.bio || '',
            skills: user?.publicProfile?.skills || [],
            avatarUrl: user?.publicProfile?.avatarUrl || user?.profile_photo || '',
            workEmail: user?.publicProfile?.workEmail || user?.email || ''
        },
        privateIdentity: {
            legalName: user?.privateIdentity?.legalName || '',
            dob: user?.privateIdentity?.dob || '',
            gender: user?.privateIdentity?.gender || '',
            nationality: user?.privateIdentity?.nationality || '',
            personalContact: {
                email: user?.privateIdentity?.personalContact?.email || '',
                mobile: user?.privateIdentity?.personalContact?.mobile || ''
            },
            address: user?.privateIdentity?.address || '',
            emergencyContact: {
                name: user?.privateIdentity?.emergencyContact?.name || '',
                relationship: user?.privateIdentity?.emergencyContact?.relationship || '',
                phone: user?.privateIdentity?.emergencyContact?.phone || ''
            },
            taxId: user?.privateIdentity?.taxId || '',
            passportNumber: user?.privateIdentity?.passportNumber || '',
            resumeUrl: user?.privateIdentity?.resumeUrl || ''
        },
        secureVault: {
            bankDetails: {
                accountNumber: user?.secureVault?.bankDetails?.accountNumber || '',
                ifscCode: user?.secureVault?.bankDetails?.ifscCode || '',
                bankName: user?.secureVault?.bankDetails?.bankName || '',
                accountHolder: user?.secureVault?.bankDetails?.accountHolder || ''
            }
        },
        role: user?.role || '',
        department_id: user?.department_id || '',
        status: user?.status || 'Active'
    });

    const [isSaving, setIsSaving] = useState(false);
    const [newSkill, setNewSkill] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const errors = {
            public: [],
            identity: [],
            vault: []
        };

        // Section: Public
        if (!formData.publicProfile.preferredName) errors.public.push("Preferred Name");
        if (!formData.publicProfile.workEmail) errors.public.push("Professional Email");

        // Section: Identity
        if (!formData.privateIdentity.legalName) errors.identity.push("Legal Full Name");
        if (!formData.privateIdentity.dob) errors.identity.push("Date of Birth");
        if (!formData.privateIdentity.nationality) errors.identity.push("Nationality");
        if (!formData.privateIdentity.taxId) errors.identity.push("Tax ID");

        // Section: Vault (Only validate if Admin and ANY field is touched)
        if (isViewerAdmin) {
            const vd = formData.secureVault.bankDetails;
            const isVaultTouched = !!(vd.accountNumber || vd.ifscCode || vd.bankName || vd.accountHolder);
            if (isVaultTouched) {
                if (!vd.accountNumber) errors.vault.push("Account Number");
                if (!vd.ifscCode) errors.vault.push("IFSC Code");
                if (!vd.bankName) errors.vault.push("Bank Name");
                if (!vd.accountHolder) errors.vault.push("Account Holder");
            }
        }

        // Error Handling & Tab Switching
        if (errors.public.length > 0 || errors.identity.length > 0 || errors.vault.length > 0) {
            let firstErrorSection = 'public';
            if (errors.public.length > 0) firstErrorSection = 'public';
            else if (errors.identity.length > 0) firstErrorSection = 'identity';
            else if (errors.vault.length > 0) firstErrorSection = 'vault';

            setActiveSection(firstErrorSection);
            
            const allErrors = [...errors.public, ...errors.identity, ...errors.vault];
            toast.error(`Incomplete Nodes in ${firstErrorSection.toUpperCase()}: ${allErrors.slice(0, 3).join(', ')}${allErrors.length > 3 ? '...' : ''}`, {
                style: { borderRadius: '15px', background: '#0B1120', color: '#fff', border: '1px solid rgba(244, 63, 94, 0.3)' }
            });
            return;
        }

        setIsSaving(true);
        try {
            await onSave(formData);
            toast.success("Identity record synchronized successfully");
            onClose();
        } catch (err) {
            toast.error("Structural sync failed: " + (err.response?.data?.detail || "Network disruption"));
        } finally {
            setIsSaving(false);
        }
    };

    const addSkill = () => {
        if (newSkill.trim()) {
            setFormData({
                ...formData,
                publicProfile: {
                    ...formData.publicProfile,
                    skills: [...formData.publicProfile.skills, newSkill.trim()]
                }
            });
            setNewSkill('');
        }
    };

    const removeSkill = (index) => {
        const updatedSkills = [...formData.publicProfile.skills];
        updatedSkills.splice(index, 1);
        setFormData({
            ...formData,
            publicProfile: {
                ...formData.publicProfile,
                skills: updatedSkills
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl animate-fade-in font-sans">
            <div className="bg-primary-surface border border-sky-500/20 w-full max-w-4xl rounded-[3rem] shadow-[0_0_100px_rgba(14,165,233,0.1)] overflow-hidden animate-scale-in relative max-h-[90vh] flex flex-col">
                {/* Modal Scanner Ray */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500/30 blur-sm z-50 animate-scanner"></div>
                
                <div className="p-10 lg:p-14 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-black text-content-main tracking-tighter uppercase leading-none">
                                {isAdminView ? 'Override Protocol' : 'Identity Sync'}
                            </h2>
                            <p className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] mt-3 opacity-60">
                                {isAdminView ? `Modifying structural node: ${user.username}` : 'Recalibrating multi-bucket identity data'}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-4 hover:bg-rose-500/10 hover:text-rose-500 rounded-2xl transition-all font-black text-[10px] text-content-muted uppercase tracking-widest border border-border/50">Abort</button>
                    </div>

                    {/* SECTION TABS */}
                    <div className="flex gap-4 mb-12 p-2 bg-primary-muted/10 rounded-3xl w-fit">
                        {['public', 'identity', 'vault'].map(tab => (
                            <button 
                                key={tab}
                                type="button"
                                onClick={() => setActiveSection(tab)}
                                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === tab ? 'bg-sky-500 text-white shadow-lg' : 'text-content-muted hover:bg-primary-muted'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-12">
                        {activeSection === 'public' && (
                            <div className="grid md:grid-cols-2 gap-10 animate-fade-in">
                                <div className="space-y-4 group">
                                    <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] ml-1 group-focus-within:text-sky-500 transition-colors opacity-60">Preferred Name <span className="text-rose-500">*</span></label>
                                    <input 
                                        value={formData.publicProfile.preferredName}
                                        onChange={(e) => setFormData({...formData, publicProfile: {...formData.publicProfile, preferredName: e.target.value}})}
                                        className="w-full bg-primary-surface/50 border-2 border-border/40 hover:border-sky-500/30 focus:border-sky-500 rounded-3xl py-4 px-8 font-black text-content-main outline-none transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-4 group">
                                    <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] ml-1 group-focus-within:text-sky-500 transition-colors opacity-60">Professional Alias (Email) <span className="text-rose-500">*</span></label>
                                    <input 
                                        value={formData.publicProfile.workEmail}
                                        disabled={!isViewerAdmin}
                                        onChange={(e) => setFormData({...formData, publicProfile: {...formData.publicProfile, workEmail: e.target.value}})}
                                        className={`w-full bg-primary-surface/50 border-2 border-border/40 hover:border-sky-500/30 focus:border-sky-500 rounded-3xl py-4 px-8 font-black text-content-main outline-none transition-all shadow-sm ${!isViewerAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                                <div className="col-span-2 space-y-4 group">
                                    <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] ml-1 group-focus-within:text-sky-500 transition-colors opacity-60">Visible Biography</label>
                                    <textarea 
                                        rows="3"
                                        value={formData.publicProfile.bio}
                                        onChange={(e) => setFormData({...formData, publicProfile: {...formData.publicProfile, bio: e.target.value}})}
                                        className="w-full bg-primary-surface/50 border-2 border-border/40 hover:border-sky-500/30 focus:border-sky-500 rounded-[2rem] py-5 px-8 font-black text-content-main outline-none transition-all resize-none shadow-sm"
                                    />
                                </div>
                                <div className="col-span-2 space-y-4">
                                    <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] ml-1 opacity-60">Tactical Skillsets</label>
                                    <div className="flex gap-4">
                                        <input 
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                            placeholder="Add skill..."
                                            className="flex-1 bg-primary-surface/50 border-2 border-border/40 rounded-2xl py-3 px-6 font-bold text-sm outline-none"
                                        />
                                        <button type="button" onClick={addSkill} className="px-6 bg-sky-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-600 transition-colors">Add</button>
                                    </div>
                                    <div className="flex flex-wrap gap-3 mt-4">
                                        {formData.publicProfile.skills.map((skill, idx) => (
                                            <span key={idx} className="px-4 py-2 bg-primary-muted/20 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                                {skill}
                                                <button type="button" onClick={() => removeSkill(idx)} className="text-rose-500 hover:scale-125 transition-transform">×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'identity' && (
                            <div className="grid md:grid-cols-2 gap-10 animate-fade-in">
                                <div className="space-y-4 group">
                                    <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] opacity-60">Legal Full Name <span className="text-rose-500">*</span></label>
                                    <input 
                                        value={formData.privateIdentity.legalName}
                                        onChange={(e) => setFormData({...formData, privateIdentity: {...formData.privateIdentity, legalName: e.target.value}})}
                                        className="w-full bg-primary-surface/50 border-2 border-border/40 rounded-3xl py-4 px-8 font-black text-content-main outline-none"
                                    />
                                </div>
                                <div className="space-y-4 group">
                                    <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] opacity-60">Date of Birth <span className="text-rose-500">*</span></label>
                                    <input 
                                        type="date"
                                        value={formData.privateIdentity.dob}
                                        onChange={(e) => setFormData({...formData, privateIdentity: {...formData.privateIdentity, dob: e.target.value}})}
                                        className="w-full bg-primary-surface/50 border-2 border-border/40 rounded-3xl py-4 px-8 font-black text-content-main outline-none"
                                    />
                                </div>
                                <div className="space-y-4 group">
                                    <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] opacity-60">Nationality <span className="text-rose-500">*</span></label>
                                    <input 
                                        value={formData.privateIdentity.nationality}
                                        onChange={(e) => setFormData({...formData, privateIdentity: {...formData.privateIdentity, nationality: e.target.value}})}
                                        className="w-full bg-primary-surface/50 border-2 border-border/40 rounded-3xl py-4 px-8 font-black text-content-main outline-none"
                                    />
                                </div>
                                <div className="space-y-4 group">
                                    <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] opacity-60">Gender</label>
                                    <select 
                                        value={formData.privateIdentity.gender}
                                        onChange={(e) => setFormData({...formData, privateIdentity: {...formData.privateIdentity, gender: e.target.value}})}
                                        className="w-full bg-primary-surface/50 border-2 border-border/40 rounded-3xl py-4 px-8 font-black text-content-main outline-none appearance-none"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>
                                <div className="col-span-2 space-y-4">
                                    <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] opacity-60 ml-1">Emergency Protocol Contact</label>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <input 
                                            placeholder="Contact Name"
                                            value={formData.privateIdentity.emergencyContact.name}
                                            onChange={(e) => setFormData({...formData, privateIdentity: {...formData.privateIdentity, emergencyContact: {...formData.privateIdentity.emergencyContact, name: e.target.value}}})}
                                            className="bg-primary-surface/50 border-2 border-border/40 rounded-3xl py-4 px-8 font-black text-sm outline-none"
                                        />
                                        <input 
                                            placeholder="Relationship"
                                            value={formData.privateIdentity.emergencyContact.relationship}
                                            onChange={(e) => setFormData({...formData, privateIdentity: {...formData.privateIdentity, emergencyContact: {...formData.privateIdentity.emergencyContact, relationship: e.target.value}}})}
                                            className="bg-primary-surface/50 border-2 border-border/40 rounded-3xl py-4 px-8 font-black text-sm outline-none"
                                        />
                                        <input 
                                            placeholder="Phone Number"
                                            value={formData.privateIdentity.emergencyContact.phone}
                                            onChange={(e) => setFormData({...formData, privateIdentity: {...formData.privateIdentity, emergencyContact: {...formData.privateIdentity.emergencyContact, phone: e.target.value}}})}
                                            className="bg-primary-surface/50 border-2 border-border/40 rounded-3xl py-4 px-8 font-black text-sm outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4 group">
                                    <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] opacity-60">Personal Contact Email</label>
                                    <input 
                                        value={formData.privateIdentity.personalContact.email}
                                        disabled={!isViewerAdmin}
                                        onChange={(e) => setFormData({...formData, privateIdentity: {...formData.privateIdentity, personalContact: {...formData.privateIdentity.personalContact, email: e.target.value}}})}
                                        className={`w-full bg-primary-surface/50 border-2 border-border/40 rounded-3xl py-4 px-8 font-black text-content-main outline-none ${!isViewerAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                                <div className="space-y-4 group">
                                    <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] opacity-60">Tax ID (TID) <span className="text-rose-500">*</span></label>
                                    <input 
                                        value={formData.privateIdentity.taxId}
                                        onChange={(e) => setFormData({...formData, privateIdentity: {...formData.privateIdentity, taxId: e.target.value}})}
                                        className="w-full bg-primary-surface/50 border-2 border-border/40 rounded-3xl py-4 px-8 font-black text-content-main outline-none"
                                    />
                                </div>
                                <div className="space-y-4 group">
                                    <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] opacity-60">Passport Serial</label>
                                    <input 
                                        value={formData.privateIdentity.passportNumber}
                                        onChange={(e) => setFormData({...formData, privateIdentity: {...formData.privateIdentity, passportNumber: e.target.value}})}
                                        className="w-full bg-primary-surface/50 border-2 border-border/40 rounded-3xl py-4 px-8 font-black text-content-main outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        {activeSection === 'vault' && (
                            <div className="space-y-10 animate-fade-in p-10 bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem]">
                                <div className="flex items-center gap-6 mb-4">
                                    <div className="p-4 bg-rose-500 text-white rounded-2xl">
                                        <IconShield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-content-main tracking-tighter uppercase">Secure Financial Node</h3>
                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1">
                                            {isViewerAdmin ? 'Data encrypted at rest. Double-check before sync.' : 'Restricted Identity Node'}
                                        </p>
                                    </div>
                                </div>

                                {!isViewerAdmin ? (
                                    <div className="p-10 border-2 border-dashed border-rose-500/30 rounded-[2rem] bg-rose-500/5 text-center space-y-6">
                                        <div className="w-16 h-16 bg-rose-500/20 rounded-2xl mx-auto flex items-center justify-center text-rose-500">
                                            <IconShield className="w-8 h-8" />
                                        </div>
                                        <h4 className="text-xl font-black text-content-main uppercase tracking-tighter">Vault Access Restricted</h4>
                                        <p className="text-sm font-bold text-content-muted leading-relaxed max-w-md mx-auto italic">
                                            Financial Vault protocols are locked for non-administrative entities. To update your bank details, please <span className="text-rose-500">raise a structural ticket</span> with the Finance or HR department.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-10">
                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] opacity-60">Legal Account Holder <span className="text-rose-500">*</span></label>
                                            <input 
                                                value={formData.secureVault.bankDetails.accountHolder}
                                                onChange={(e) => setFormData({...formData, secureVault: {...formData.secureVault, bankDetails: {...formData.secureVault.bankDetails, accountHolder: e.target.value}}})}
                                                className="w-full bg-primary-surface border-2 border-border/40 rounded-3xl py-4 px-8 font-black text-content-main outline-none"
                                            />
                                        </div>
                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] opacity-60">Bank Institution Name <span className="text-rose-500">*</span></label>
                                            <input 
                                                value={formData.secureVault.bankDetails.bankName}
                                                onChange={(e) => setFormData({...formData, secureVault: {...formData.secureVault, bankDetails: {...formData.secureVault.bankDetails, bankName: e.target.value}}})}
                                                className="w-full bg-primary-surface border-2 border-border/40 rounded-3xl py-4 px-8 font-black text-content-main outline-none"
                                            />
                                        </div>
                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] opacity-60">Account Number (Sensitive) <span className="text-rose-500">*</span></label>
                                            <input 
                                                type="password"
                                                value={formData.secureVault.bankDetails.accountNumber}
                                                onChange={(e) => setFormData({...formData, secureVault: {...formData.secureVault, bankDetails: {...formData.secureVault.bankDetails, accountNumber: e.target.value}}})}
                                                className="w-full bg-primary-surface border-2 border-border/40 rounded-3xl py-4 px-8 font-black text-content-main outline-none"
                                            />
                                        </div>
                                        <div className="space-y-4 group">
                                            <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] opacity-60">IFSC / Routing Code <span className="text-rose-500">*</span></label>
                                            <input 
                                                value={formData.secureVault.bankDetails.ifscCode}
                                                onChange={(e) => setFormData({...formData, secureVault: {...formData.secureVault, bankDetails: {...formData.secureVault.bankDetails, ifscCode: e.target.value}}})}
                                                className="w-full bg-primary-surface border-2 border-border/40 rounded-3xl py-4 px-8 font-black text-content-main outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-6 pt-10 border-t border-border">
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="flex-1 py-6 bg-gradient-to-r from-sky-600 to-sky-500 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
                            >
                                {isSaving ? <IconSync className="w-6 h-6 animate-spin-slow" /> : (
                                    <>
                                        <span>Authorize Identity Update</span>
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
