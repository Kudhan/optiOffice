import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Plus, 
    Edit2, 
    ChevronRight,
    FileText, 
    Shield, 
    Info,
    CheckCircle,
    XCircle,
    Trash2,
    Clock,
    Calendar,
    AlertCircle,
    Coffee,
    BookOpen,
    Zap,
    Lock,
    ExternalLink
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import apiClient from '../api/client';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const ICON_MAP = {
    FileText,
    Shield,
    CheckCircle,
    Clock,
    Calendar,
    AlertCircle,
    Coffee,
    BookOpen,
    Zap,
    Lock
};

const CATEGORIES = ['All', 'General', 'HR', 'IT', 'Attendance'];

const Policies = () => {
    const { user, isAdmin } = useAuth();
    const [policies, setPolicies] = useState([]);
    const [meta, setMeta] = useState({ total: 0, pages: 1, currentPage: 1 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({ title: '', content: '', description: '', category: 'General', icon: 'FileText' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async (page = 1, category = 'All', search = '') => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/policies`, {
                params: { page, limit: 12, category, search }
            });
            setPolicies(response.data.data);
            setMeta(response.data.pagination);
        } catch (err) {
            toast.error("Signal fragmentation in Policy Engine");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchData(1, selectedCategory, searchTerm);
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchTerm, selectedCategory]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            if (editData.id) {
                await apiClient.put(`/policies/${editData.id}`, editData);
                toast.success("Strategic protocol updated");
            } else {
                await apiClient.post('/policies', editData);
                toast.success("New protocol indexed");
            }
            setShowEditModal(false);
            setEditData({ title: '', content: '', description: '', category: 'General', icon: 'FileText' });
            fetchData(meta.currentPage, selectedCategory, searchTerm);
        } catch (err) {
            toast.error("Failed to sync protocol");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Commence protocol decommissioning?")) return;
        try {
            await apiClient.delete(`/policies/${id}`);
            toast.success("Protocol offline");
            fetchData(meta.currentPage, selectedCategory, searchTerm);
        } catch (err) {
            toast.error("Decommissioning failure");
        }
    };

    const PolicyCard = ({ policy }) => {
        const IconComponent = ICON_MAP[policy.icon] || FileText;
        
        return (
            <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 hover:shadow-2xl hover:shadow-sky-500/10 transition-all cursor-pointer flex flex-col h-full"
                onClick={() => setSelectedPolicy(policy)}
            >
                <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        policy.isSystemGenerated ? 'bg-sky-500/10 text-sky-500' : 'bg-violet-500/10 text-violet-500'
                    }`}>
                        <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex gap-2">
                        {policy.isSystemGenerated && (
                            <span className="px-2 py-1 rounded-lg bg-sky-500/10 text-sky-500 text-[8px] font-black uppercase tracking-widest border border-sky-500/20">System</span>
                        )}
                        {isAdmin && !policy.isSystemGenerated && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setEditData(policy); setShowEditModal(true); }}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-sky-500 transition-all"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(policy.id); }}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1">
                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2 group-hover:text-sky-500 transition-colors line-clamp-2">
                        {policy.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-3 mb-4">
                        {policy.description || "Operational governance protocol ensuring structural compliance within the organization."}
                    </p>
                </div>

                <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between mt-auto">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{policy.category}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
                </div>
            </motion.div>
        );
    };

    return (
        <div className="p-6 md:p-10 max-w-[1700px] mx-auto space-y-10 animate-fade-in flex flex-col min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 shrink-0">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-8 bg-sky-500 rounded-full" />
                        <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">
                            Policy <span className="text-sky-500 italic">Hub</span>
                        </h2>
                    </div>
                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-sky-500" />
                        Tactical Governance & Compliance Index
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 xl:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Locate protocols (e.g., Leave, IT, Dress Code)..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:border-sky-500 transition-all text-xs font-bold shadow-sm outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {isAdmin && (
                        <button 
                            onClick={() => { setEditData({ title: '', content: '', description: '', category: 'General', icon: 'FileText' }); setShowEditModal(true); }}
                            className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all flex items-center gap-3 active:scale-95 uppercase tracking-[0.2em] text-[10px] hover:shadow-sky-500/20"
                        >
                            <Plus className="w-4 h-4" />
                            New Protocol
                        </button>
                    )}
                </div>
            </div>

            {/* Category Filter Bar */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                            selectedCategory === cat 
                            ? 'bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-500/20' 
                            : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-sky-500/50'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="flex-1">
                {loading && !policies.length ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1,2,3,4,5,6,7,8].map(i => (
                            <div key={i} className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence mode="popLayout">
                            {policies.map(policy => (
                                <PolicyCard key={policy.id} policy={policy} />
                            ))}
                        </AnimatePresence>
                        
                        {policies.length === 0 && (
                            <div className="col-span-full py-40 text-center space-y-4">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <XCircle className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No operational protocols detected</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Adjust filters or search parameters to locate governance data</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {meta.pages > 1 && (
                <div className="flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shrink-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                        INDEX <span className="text-sky-500">{Math.min(meta.total, (meta.currentPage - 1) * 12 + 1)}-{Math.min(meta.total, meta.currentPage * 12)}</span> / {meta.total}
                    </p>
                    <div className="flex gap-2">
                        <button 
                            disabled={meta.currentPage === 1}
                            onClick={() => fetchData(meta.currentPage - 1, selectedCategory, searchTerm)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:text-sky-500 transition-all shadow-sm"
                        >
                            <ChevronRight className="w-4 h-4 rotate-180" />
                        </button>
                        <button 
                            disabled={meta.currentPage >= meta.pages}
                            onClick={() => fetchData(meta.currentPage + 1, selectedCategory, searchTerm)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:text-sky-500 transition-all shadow-sm"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* View Modal */}
            <AnimatePresence>
                {selectedPolicy && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                            onClick={() => setSelectedPolicy(null)}
                        />
                        <motion.div 
                            layoutId={selectedPolicy.id}
                            className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-10 pb-6 flex justify-between items-start border-b border-slate-50 dark:border-slate-800">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                                            selectedPolicy.isSystemGenerated ? 'bg-sky-500/10 text-sky-500' : 'bg-violet-500/10 text-violet-500'
                                        }`}>
                                            {React.createElement(ICON_MAP[selectedPolicy.icon] || FileText, { className: 'w-7 h-7' })}
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-tight">
                                                {selectedPolicy.title}
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{selectedPolicy.category} PROTOCOL</p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedPolicy(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <XCircle className="w-8 h-8 text-slate-300" />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    <div 
                                        className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium"
                                        dangerouslySetInnerHTML={{ __html: selectedPolicy.content }}
                                    />
                                </div>

                                {selectedPolicy.isSystemGenerated && (
                                    <div className="mt-10 flex items-start gap-4 p-6 bg-sky-500/5 rounded-3xl border border-sky-500/10">
                                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
                                            <AlertCircle className="w-5 h-5 text-sky-500" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-sky-600 uppercase tracking-widest mb-1">System Intelligence Component</p>
                                            <p className="text-[10px] text-sky-500/80 font-bold uppercase leading-relaxed font-mono">
                                                This protocol is dynamically derived from tactical configuration indices (Shifts/Holidays). Any manual discrepancies should be corrected in core modules.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-10 pt-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        Last Updated: {new Date(selectedPolicy.updatedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setSelectedPolicy(null)}
                                    className="px-8 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                                >
                                    Dismiss Index
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit/Add Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => !isSubmitting && setShowEditModal(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh]"
                        >
                            <div className="p-10 pb-6 border-b border-slate-50 dark:border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                                        Protocol <span className="text-violet-500">{editData.id ? 'Refinement' : 'Indexing'}</span>
                                    </h3>
                                    <button onClick={() => setShowEditModal(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                                        <XCircle className="w-8 h-8" />
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Strategic Organizational Governance</p>
                            </div>

                            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Protocol Identity</label>
                                    <input 
                                        required
                                        className="w-full px-8 py-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 focus:border-violet-500 outline-none text-sm font-bold transition-all placeholder:text-slate-400"
                                        placeholder="e.g., Tactical Security Protocols, HR Extraction Standards"
                                        value={editData.title}
                                        onChange={(e) => setEditData({...editData, title: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Brief Abstract</label>
                                    <input 
                                        className="w-full px-8 py-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 focus:border-violet-500 outline-none text-[11px] font-medium transition-all"
                                        placeholder="Short summary for the index card..."
                                        value={editData.description}
                                        onChange={(e) => setEditData({...editData, description: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Category Segment</label>
                                        <select 
                                            className="w-full px-8 py-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 focus:border-violet-500 outline-none text-[10px] font-black uppercase transition-all"
                                            value={editData.category}
                                            onChange={(e) => setEditData({...editData, category: e.target.value})}
                                        >
                                            {CATEGORIES.slice(1).map(cat => (
                                                <option key={cat} value={cat}>{cat} HUB</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Symbol Designation</label>
                                        <select 
                                            className="w-full px-8 py-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 focus:border-violet-500 outline-none text-[10px] font-black uppercase transition-all"
                                            value={editData.icon}
                                            onChange={(e) => setEditData({...editData, icon: e.target.value})}
                                        >
                                            {Object.keys(ICON_MAP).map(icon => (
                                                <option key={icon} value={icon}>{icon}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Protocol Content</label>
                                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800">
                                        <ReactQuill 
                                            theme="snow"
                                            value={editData.content}
                                            onChange={(val) => setEditData({...editData, content: val})}
                                            placeholder="Detail the organizational protocol here. Formatting is strategically crucial."
                                            className="min-h-[300px]"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-6 rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Synchronizing Protocols...' : 'Authorize Governance Indexing'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{ __html: `
                .ql-container.ql-snow {
                    border: none !important;
                    font-family: inherit;
                    font-size: 13px;
                    color: inherit;
                }
                .ql-toolbar.ql-snow {
                    border: none !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                    background: #f8fafc;
                }
                .dark .ql-toolbar.ql-snow {
                    border-bottom: 1px solid #1e293b !important;
                    background: #0f172a;
                }
                .dark .ql-snow .ql-stroke {
                    stroke: #94a3b8;
                }
                .dark .ql-snow .ql-fill {
                    fill: #94a3b8;
                }
                .dark .ql-snow .ql-picker {
                    color: #94a3b8;
                }
                .ql-editor {
                    min-height: 300px;
                    padding: 2rem;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                }
            `}} />
        </div>
    );
};

export default Policies;
