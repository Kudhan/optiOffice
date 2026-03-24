import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { 
  Building2, Users, Plus, Shield, Trash2, 
  Search, Briefcase, Globe, Cpu, LayoutGrid, Zap
} from 'lucide-react';
import DeptScopeModal from './DeptScopeModal';

const Departments = () => {
    const { isAdmin, user: currentUser } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScopeOpen, setIsScopeOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    const [formData, setFormData] = useState({ name: '', head: '' });
    const [searchQuery, setSearchQuery] = useState('');

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
            toast.error("Intelligence Breach: Failed to synchronize organizational data.");
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
            toast.success("Strategic Unit Deployed Successfully.");
            setIsModalOpen(false);
            setFormData({ name: '', head: '' });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Structural Provisioning Failed.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("CONFIRM UNIT DECOMMISSION: This will dismantle the organizational scope.")) return;
        try {
            await apiClient.delete(`departments/${id}`);
            toast.success("Structural Unit Decommissioned.");
            fetchData();
        } catch (err) {}
    };

    const handleInspectScope = (dept) => {
        setSelectedDept(dept);
        setIsScopeOpen(true);
    };

    const getMemberCount = (dept) => {
        return users.filter(u => u.department_id === dept.id || u.department === dept.name).length;
    };

    const filteredDepts = departments.filter(d => 
        d.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-12 max-w-[1700px] mx-auto animate-fade-in pb-32">
            
            {/* Command Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-16 gap-10 relative z-[30]">
                <div className="space-y-4">
                    <h2 className="text-4xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                        Organizational <span className="italic text-sky-500 font-extrabold underline decoration-sky-500/20 underline-offset-8">Structure</span>
                    </h2>
                    <div className="flex items-center gap-6">
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm lg:text-base tracking-tight uppercase tracking-[0.2em] opacity-60">
                            Active Scopes: <span className="text-slate-900 dark:text-white font-black">{departments.length} Units</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 w-full xl:w-auto">
                    {/* Search Portal */}
                    <div className="relative group flex-1 md:min-w-[350px]">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Identify organizational node..."
                            className="w-full bg-white dark:bg-navy-950/50 border border-slate-200 dark:border-slate-800 rounded-3xl py-4.5 pl-14 pr-8 text-sm font-bold dark:text-white focus:ring-4 focus:ring-sky-500/5 outline-none transition-all shadow-lg dark:shadow-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {isAdmin && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-slate-900 dark:bg-white text-white dark:text-navy-950 font-black py-4 px-10 rounded-2.5xl transition-all shadow-xl hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 dark:hover:text-white active:scale-95 text-xs flex items-center gap-3 uppercase tracking-widest border-2 border-transparent hover:border-sky-500"
                        >
                            <Plus className="w-5 h-5" />
                            Provision Unit
                        </button>
                    )}
                </div>
            </div>

            {/* Grid Area */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[1,2,3,4].map(i => <div key={i} className="h-72 bg-slate-50 dark:bg-navy-950/20 rounded-[3rem] animate-pulse border-2 border-dashed border-slate-200 dark:border-slate-800"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredDepts.map((dept) => (
                        <div key={dept.id} className="bg-white dark:bg-navy-950 p-10 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:border-sky-500/30 transition-all group relative flex flex-col">
                            
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-20 h-20 bg-sky-500/5 dark:bg-sky-500/10 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                                    {dept.name === 'Engineering' ? '⚙️' : dept.name === 'HR' ? '👤' : dept.name === 'Finance' ? '💰' : dept.name === 'General' ? '🌐' : '🏢'}
                                </div>
                                {isAdmin && dept.name !== 'General' && (
                                    <button 
                                        onClick={() => handleDelete(dept.id)}
                                        className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                                        title="Initiate Unit Disposal"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 group-hover:text-sky-500 transition-colors">{dept.name}</h3>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <Shield className="w-4 h-4 text-sky-500" />
                                    <span>Authority: <span className="text-slate-900 dark:text-white">{dept.head?.full_name || 'Protocol Offline'}</span></span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <Users className="w-4 h-4 text-emerald-500" />
                                    <span>Deployment: <span className="text-emerald-500 italic">{getMemberCount(dept)} Units Detected</span></span>
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-4">
                                <button 
                                    onClick={() => handleInspectScope(dept)}
                                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500 text-sky-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-wider group/scope border border-sky-500/20 shadow-sm shadow-sky-500/5 group-hover:shadow-sky-500/20"
                                >
                                    <Zap className="w-4 h-4 group-hover/scope:animate-pulse" />
                                    Inspect Scope
                                </button>
                                <div className={`text-[8px] font-black text-center uppercase tracking-[0.4em] ${isAdmin ? 'text-sky-500/60 animate-pulse' : 'text-slate-300 dark:text-slate-700'}`}>
                                    {isAdmin ? 'Command Link [Active]' : 'Interface [Restricted]'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Scope Modal Integration */}
            <DeptScopeModal 
                isOpen={isScopeOpen}
                onClose={() => setIsScopeOpen(false)}
                department={selectedDept}
                users={users}
            />

            {/* Provision Modal (Refactored for High-Fidelity) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white dark:bg-navy-950 w-full max-w-xl rounded-[3.5rem] p-12 border border-slate-200 dark:border-slate-800 shadow-2xl relative animate-scale-in">
                        <div className="flex justify-between items-start mb-10">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Strategic Unit <span className="text-sky-500">Provision</span></h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authority Level: Command</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-rose-500/10 rounded-xl transition-colors text-rose-500">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-8">
                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-sky-500 transition-colors ml-2">Unit Identifier</label>
                                <input 
                                    required 
                                    className="w-full bg-slate-50 dark:bg-navy-900 border-2 border-transparent focus:border-sky-500/30 rounded-2.5xl py-4.5 px-8 text-sm font-bold dark:text-white outline-none transition-all shadow-inner"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g., Tactical Operations"
                                />
                            </div>
                            <div className="space-y-3 group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-focus-within:text-sky-500 transition-colors ml-2">Command Node [Head]</label>
                                <select 
                                    className="w-full bg-slate-50 dark:bg-navy-900 border-2 border-transparent focus:border-sky-500/30 rounded-2.5xl py-4.5 px-8 text-sm font-bold dark:text-white outline-none transition-all shadow-inner appearance-none"
                                    value={formData.head}
                                    onChange={e => setFormData({...formData, head: e.target.value})}
                                >
                                    <option value="">Select Authority Node...</option>
                                    {users.map(u => (
                                        <option key={u.id || u._id} value={u.id || u._id}>{u.full_name} | @{u.username}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-navy-950 font-black py-5.5 rounded-[2rem] transition-all shadow-2xl active:scale-95 uppercase tracking-[0.2em] text-xs hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 dark:hover:text-white">
                                Authorize Deployment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Departments;
