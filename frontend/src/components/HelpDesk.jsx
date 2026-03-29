import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import useAuth from '../hooks/useAuth';
import { 
  IconPlus, 
  IconHelp, 
  IconClock, 
  IconCheck, 
  IconAlertCircle,
  IconSearch,
  IconFilter,
  IconChevronRight
} from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

const HelpDesk = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [newTicket, setNewTicket] = useState({
        subject: '',
        description: '',
        category: 'IT',
        priority: 'Medium'
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/tickets');
            setTickets(res.data);
        } catch (err) {
            console.error("Failed to fetch tickets", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/tickets', newTicket);
            setShowForm(false);
            setNewTicket({
                subject: '',
                description: '',
                category: 'IT',
                priority: 'Medium'
            });
            fetchData();
        } catch (err) {
            console.error("Ticket submission failed");
        }
    };

    const stats = useMemo(() => {
        if (!tickets || !user) return { active: 0, myAssignments: 0, resolvedToday: 0 };
        const active = tickets.filter(t => t.status === 'Open' || t.status === 'In-Progress' || t.status === 'Pending').length;
        
        const myAssignments = tickets.filter(t => {
            const assignee = t.assignedTo;
            if (!assignee) return false;
            const assigneeId = (typeof assignee === 'object') ? (assignee._id || assignee.id) : assignee;
            const myId = user.id || user._id;
            return assigneeId?.toString() === myId?.toString();
        }).length;

        const resolvedToday = tickets.filter(t => t.status === 'Resolved' && new Date(t.updatedAt).toDateString() === new Date().toDateString()).length;
        return { active, myAssignments, resolvedToday };
    }, [tickets, user]);

    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
            const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 t.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [tickets, filterCategory, searchQuery]);

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'Urgent': return 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
            case 'High': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'Medium': return 'bg-sky-500/10 text-sky-500 border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.2)]';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center animate-pulse text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">
            Syncing Support Channels...
        </div>
    );

    return (
        <div className="p-6 md:p-10 max-w-[1700px] mx-auto space-y-12 animate-fade-in">
            
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                <div className="space-y-2">
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">
                        Help <span className="text-sky-500 italic">Desk</span>
                    </h2>
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/50 w-fit">
                        <IconHelp className="w-3.5 h-3.5 text-sky-500" />
                        <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.25em]">Multi-Tenant Support Engine</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 xl:w-72">
                        <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search tickets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-sky-500 outline-none font-bold text-xs shadow-sm transition-all"
                        />
                    </div>
                    <button 
                        onClick={() => setShowForm(true)}
                        className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all flex items-center gap-3 active:scale-95 uppercase tracking-[0.2em] text-[10px]"
                    >
                        <IconPlus className="w-4 h-4" />
                        New Ticket
                    </button>
                </div>
            </div>

            {/* Stats Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Active Tickets', value: stats.active, color: 'bg-sky-500', icon: <IconPlus /> },
                    { label: 'My Assignments', value: stats.myAssignments, color: 'bg-indigo-500', icon: <IconClock /> },
                    { label: 'Resolved Today', value: stats.resolvedToday, color: 'bg-emerald-500', icon: <IconCheck /> }
                ].map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color}/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:${stat.color}/10 transition-all`} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
                            <div className={`w-12 h-12 rounded-2xl ${stat.color}/10 flex items-center justify-center text-${stat.color.split('-')[1]}-500`}>
                                {stat.icon}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Ticket List Table */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Support <span className="text-sky-500 italic">Queue</span></h3>
                    
                    <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-600/50">
                        {['All', 'IT', 'HR', 'Finance', 'Maintenance'].map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-sky-500'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/20 text-[10px] uppercase font-black tracking-widest text-slate-400">
                                <th className="px-8 py-6">Subject</th>
                                <th className="px-8 py-6">Category</th>
                                <th className="px-8 py-6">Priority</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6">Created By</th>
                                <th className="px-8 py-6 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                            {filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((ticket) => (
                                <tr key={ticket.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-all cursor-pointer" onClick={() => navigate(`/help-desk/${ticket.id}`)}>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="font-black text-slate-900 dark:text-white text-sm tracking-tight">{ticket.subject}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className={`text-[10px] font-black ${
                                                        ticket.status !== 'Resolved' && ticket.status !== 'Closed' && ticket.dueDate && new Date(ticket.dueDate) < new Date() 
                                                        ? 'text-rose-500 animate-pulse' 
                                                        : 'text-slate-400'
                                                    }`}>
                                                        #{ticket.id?.slice(-6).toUpperCase() || 'REF'}
                                                    </p>
                                                    {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && ticket.dueDate && new Date(ticket.dueDate) < new Date() && (
                                                        <span className="bg-rose-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Overdue</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                                            {ticket.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${getPriorityStyle(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${ticket.status === 'Resolved' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">
                                                {ticket.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-sky-500">
                                                {ticket.createdBy?.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{ticket.createdBy?.full_name || 'User'}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-all shadow-sm">
                                            <IconChevronRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredTickets.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-bold text-sm tracking-widest uppercase">No tickets identified in this sector.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 border-t border-slate-50 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of {filteredTickets.length} Entries
                    </p>
                    <div className="flex gap-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-sky-500 disabled:opacity-30 transition-all shadow-sm"
                        >
                            <IconChevronRight className="w-4 h-4 rotate-180" />
                        </button>
                        <button 
                            disabled={currentPage * itemsPerPage >= filteredTickets.length}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-sky-500 disabled:opacity-30 transition-all shadow-sm"
                        >
                            <IconChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* New Ticket Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-2xl p-10 w-full max-w-2xl space-y-8"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Initialize Support <span className="text-sky-500 italic">Ticket</span></h3>
                                <button onClick={() => setShowForm(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white transition-all text-slate-500 font-bold">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Subject</label>
                                    <input 
                                        required
                                        value={newTicket.subject}
                                        onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-sky-500 outline-none font-bold text-xs"
                                        placeholder="Brief summary of the issue..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category</label>
                                        <select 
                                            value={newTicket.category}
                                            onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-sky-500 outline-none font-bold text-xs cursor-pointer"
                                        >
                                            <option value="IT">IT Support</option>
                                            <option value="HR">Human Resources</option>
                                            <option value="Finance">Finance / Billing</option>
                                            <option value="Maintenance">Maintenance</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Priority</label>
                                        <select 
                                            value={newTicket.priority}
                                            onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-sky-500 outline-none font-bold text-xs cursor-pointer"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Description</label>
                                    <textarea 
                                        required
                                        value={newTicket.description}
                                        onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-sky-500 outline-none font-bold text-xs h-40 resize-none shadow-inner"
                                        placeholder="Describe the technical or administrative bottleneck..."
                                    />
                                </div>

                                <button type="submit" className="w-full py-5 rounded-2xl bg-sky-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-sky-500/20 active:scale-95 transition-all">Submit Resource Request</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HelpDesk;
