import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

const Roles = () => {
    const { isAdmin, isSuperAdmin } = useAuth();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Standard platform permissions
    const systemPermissions = [
        'can_manage_users',
        'can_manage_tasks',
        'can_manage_holidays',
        'can_manage_billing',
        'can_view_all_attendance',
        'can_approve_leaves'
    ];

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await apiClient.get('roles');
            setRoles(response.data);
        } catch (err) {
            console.error("Failed to fetch roles", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePermission = async (roleId, permission) => {
        const role = roles.find(r => r.id === roleId);
        if (!role) return;

        let newPermissions = [...role.permissions];
        if (newPermissions.includes(permission)) {
            newPermissions = newPermissions.filter(p => p !== permission);
        } else {
            newPermissions.push(permission);
        }

        try {
            const response = await apiClient.put(`roles/${roleId}`, { permissions: newPermissions });
            setRoles(roles.map(r => r.id === roleId ? response.data : r));
            if (selectedRole?.id === roleId) {
                setSelectedRole(response.data);
            }
            toast.success(`Permissions updated for ${role.name}`, {
                style: { borderRadius: '15px', background: '#0B1120', color: '#fff' }
            });
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="p-10 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin border-4 border-sky-500 border-t-transparent rounded-full w-12 h-12"></div>
            </div>
        );
    }

    const getBadgeStyle = (roleName) => {
        const name = roleName.toLowerCase();
        if (name === 'admin' || name === 'super-admin') return 'bg-indigo-500/10 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 shadow-[0_5px_15px_rgba(99,102,241,0.05)] dark:shadow-[0_0_15px_rgba(99,102,241,0.1)]';
        if (name === 'manager') return 'bg-sky-500/10 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
        return 'bg-slate-500/10 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    };

    return (
        <div className="p-10 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">Authority Management.</h2>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Configure access levels and granular permissions</p>
                </div>
            </header>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map(role => (
                    <div 
                        key={role.id} 
                        className="group relative bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-[2.5rem] p-8 hover:border-sky-500/30 transition-all duration-500 overflow-hidden shadow-sm dark:shadow-none"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-sky-500/10 transition-colors"></div>
                        
                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-start">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getBadgeStyle(role.name)}`}>
                                    {role.name}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2 capitalize">{role.name} Role</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">{role.description || 'System defined access level for workspace members.'}</p>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700/30">
                                <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Top Capabilities</h4>
                                <div className="space-y-2">
                                    {role.permissions.slice(0, 5).map(perm => (
                                        <div key={perm} className="flex items-center gap-3">
                                            <span className="text-emerald-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                                </svg>
                                            </span>
                                            <span className="text-slate-700 dark:text-slate-200 text-sm font-bold tracking-tight capitalize">{perm.replace(/_/g, ' ')}</span>
                                        </div>
                                    ))}
                                    {role.permissions.length > 5 && (
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 pl-7">+{role.permissions.length - 5} MORE PERMISSIONS</p>
                                    )}
                                </div>
                            </div>

                            {/* Task 4: Component Protection */}
                            {(isAdmin || isSuperAdmin) && (
                                <button 
                                    onClick={() => {
                                        setSelectedRole(role);
                                        setIsModalOpen(true);
                                    }}
                                    className="w-full bg-slate-100 dark:bg-slate-700/30 hover:bg-sky-500 dark:hover:bg-sky-500 text-slate-900 dark:text-white hover:text-white font-black py-4 rounded-2xl transition-all active:scale-95 group-hover:shadow-[0_10px_20px_rgba(14,165,233,0.1)] dark:group-hover:shadow-[0_0_20px_rgba(14,165,233,0.15)]"
                                >
                                    Manage Permissions
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Permission Toggle Modal */}
            {isModalOpen && selectedRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 dark:bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <div className="mb-10 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border mb-4 inline-block ${getBadgeStyle(selectedRole.name)}`}>
                                Security Tuning
                            </span>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Adjust Powers.</h2>
                            <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest">Granular Control for {selectedRole.name}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {systemPermissions.map(perm => {
                                const isActive = selectedRole.permissions.includes(perm);
                                return (
                                    <button
                                        key={perm}
                                        onClick={() => handleTogglePermission(selectedRole.id, perm)}
                                        className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                                            isActive 
                                                ? 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-white' 
                                                : 'bg-slate-50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="text-left">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">Availability</p>
                                            <p className="font-bold text-sm capitalize">{perm.replace(/_/g, ' ')}</p>
                                        </div>
                                        <div className={`w-10 h-6 rounded-full relative transition-colors ${isActive ? 'bg-sky-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isActive ? 'left-5' : 'left-1'}`}></div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-navy-950 font-black py-5 rounded-3xl mt-10 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all active:scale-95 shadow-lg shadow-slate-900/20 dark:shadow-none"
                        >
                            Done Tuning
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Roles;
