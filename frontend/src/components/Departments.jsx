import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { IconUsers, IconBriefcase, IconPlus, IconShield } from './Icons';

const Departments = () => {
    const { isAdmin } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', head: '' });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [deptRes, userRes] = await Promise.all([
                apiClient.get('departments'),
                apiClient.get('users')
            ]);
            setDepartments(deptRes.data);
            setUsers(userRes.data);
        } catch (err) {
            toast.error("Cloud Error: Failed to synchronize department data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('departments', formData);
            toast.success("Structural Unit Created 🏢");
            setIsModalOpen(false);
            setFormData({ name: '', head: '' });
            fetchData();
        } catch (err) {}
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will remove the functional group.")) return;
        try {
            await apiClient.delete(`departments/${id}`);
            toast.success("Unit Decommissioned");
            fetchData();
        } catch (err) {}
    };

    return (
        <div className="p-10 lg:p-16 max-w-[1600px] mx-auto animate-fade-in pb-32">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="text-6xl font-black text-content-main tracking-tighter leading-none mb-4">
                        Organizational <span className="italic text-sky-500 font-extrabold underline decoration-sky-500/20 underline-offset-8">Units</span>
                    </h2>
                    <p className="text-content-muted font-bold text-sm tracking-tight opacity-60 uppercase">Business Hierarchy & Deployment Scopes</p>
                </div>
                {isAdmin && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-slate-900 dark:bg-white text-white dark:text-navy-950 font-black py-5 px-10 rounded-3xl transition-all shadow-xl hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 dark:hover:text-white active:scale-95 flex items-center gap-3"
                    >
                        <IconPlus className="w-5 h-5" />
                        Provision Unit
                    </button>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1,2,3].map(i => <div key={i} className="h-64 bg-primary-surface rounded-[2.5rem] animate-pulse"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {departments.map((dept) => (
                        <div key={dept.id} className="bg-primary-surface p-8 rounded-[3rem] border border-border shadow-sm hover:shadow-2xl hover:border-sky-500/30 transition-all group relative">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-sky-500 group-hover:text-white transition-all">
                                    {dept.name === 'Engineering' ? '⚙️' : dept.name === 'HR' ? '👤' : '🏢'}
                                </div>
                                {isAdmin && (
                                    <button 
                                        onClick={() => handleDelete(dept.id)}
                                        className="text-[10px] font-black uppercase text-rose-500/40 hover:text-rose-500 transition-colors"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                            
                            <h3 className="text-2xl font-black text-content-main tracking-tighter mb-2">{dept.name}</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-xs font-bold text-content-muted">
                                    <IconShield className="w-4 h-4 opacity-40" />
                                    <span>Head: <span className="text-content-main">{dept.head?.full_name || 'Unassigned'}</span></span>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-bold text-content-muted">
                                    <IconUsers className="w-4 h-4 opacity-40" />
                                    <span>Deployment Scale: <span className="text-content-main">Active Zone</span></span>
                                </div>
                            </div>

                            <button className="mt-8 w-full py-4 border border-border rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] group-hover:bg-sky-500 group-hover:text-white transition-all">
                                Inspect Scope
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/20 dark:bg-navy-950/40 backdrop-blur-md animate-fade-in">
                    <div className="bg-primary-surface w-full max-w-lg rounded-[3rem] p-10 border border-border shadow-2xl relative overflow-visible">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-content-main tracking-tighter">Provision Unit</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-content-muted font-bold">ESC</button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.15em] ml-1 group-focus-within:text-sky-500 transition-colors">Unit Name</label>
                                <input 
                                    required 
                                    className="w-full bg-primary-muted border-2 border-transparent focus:border-sky-500/50 rounded-2xl py-4 px-6 text-sm font-bold text-content-main outline-none transition-all shadow-sm"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g., Engineering"
                                />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.15em] ml-1 group-focus-within:text-sky-500 transition-colors">Department Head</label>
                                <select 
                                    className="w-full bg-primary-muted border-2 border-transparent focus:border-sky-500/50 rounded-2xl py-4 px-6 text-sm font-bold text-content-main outline-none transition-all shadow-sm appearance-none"
                                    value={formData.head}
                                    onChange={e => setFormData({...formData, head: e.target.value})}
                                >
                                    <option value="">Select Leader...</option>
                                    {users.map(u => (
                                        <option key={u._id} value={u._id}>{u.full_name} (@{u.username})</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-sky-500 hover:bg-sky-400 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-sky-500/20 active:scale-95 uppercase tracking-widest text-[11px]">
                                Authorize Unit
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Departments;
