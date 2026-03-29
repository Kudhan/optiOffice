import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import useAuth from '../hooks/useAuth';
import { 
  IconClock, 
  IconCheck, 
  IconAlertCircle,
  IconChevronRight,
  IconPlus
} from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isAgentOrAdmin = user?.role === 'agent' || user?.role === 'admin' || user?.role === 'super-admin';

    const fetchTicket = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/tickets/${id}`);
            setTicket(res.data);
        } catch (err) {
            console.error("Failed to fetch ticket", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            setIsSubmitting(true);
            await apiClient.post(`/tickets/${id}/comments`, {
                message: comment,
                isPrivate: isAgentOrAdmin ? isPrivate : false
            });
            setComment('');
            setIsPrivate(false);
            fetchTicket();
        } catch (err) {
            console.error("Failed to add comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            await apiClient.put(`/tickets/${id}`, { status: newStatus });
            fetchTicket();
        } catch (err) {
            console.error("Failed to update status");
        }
    };

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center animate-pulse text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">
            Decrypting Transmission...
        </div>
    );

    if (!ticket) return (
        <div className="p-10 text-center space-y-4">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Ticket <span className="text-rose-500 italic">Not Found</span></h2>
            <button onClick={() => navigate('/help-desk')} className="text-sky-500 font-bold uppercase tracking-widest text-[10px]">Back to Console</button>
        </div>
    );

    return (
        <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-12 animate-fade-in">
            
            {/* Header & Meta */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-slate-100 dark:border-slate-800 pb-12">
                <div className="space-y-4">
                    <button 
                        onClick={() => navigate('/help-desk')}
                        className="flex items-center gap-2 text-slate-400 hover:text-sky-500 transition-all font-black uppercase tracking-[0.2em] text-[9px]"
                    >
                        <IconChevronRight className="w-3 h-3 rotate-180" />
                        Back to Queue
                    </button>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="bg-sky-500/10 text-sky-500 text-[10px] font-black px-3 py-1 rounded-lg border border-sky-500/20 uppercase tracking-widest">
                                #{ticket.id?.slice(-6).toUpperCase()}
                            </span>
                            {ticket.dueDate && new Date(ticket.dueDate) < new Date() && ticket.status !== 'Resolved' && (
                                <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest animate-pulse">Overdue</span>
                            )}
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{ticket.subject}</h2>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    {isAgentOrAdmin && ticket.status !== 'Resolved' && (
                        <button 
                            onClick={() => handleStatusUpdate('Resolved')}
                            className="bg-emerald-500 text-white font-black px-6 py-3 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center gap-3 active:scale-95 transition-all text-[10px] uppercase tracking-widest"
                        >
                            <IconCheck className="w-4 h-4" />
                            Resolve Ticket
                        </button>
                    )}
                    {isAdmin && (
                        <select 
                            value={ticket.status}
                            onChange={(e) => handleStatusUpdate(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-3 font-black text-[10px] uppercase tracking-widest outline-none focus:border-sky-500 transition-all"
                        >
                            <option value="Open">Open</option>
                            <option value="In-Progress">In-Progress</option>
                            <option value="Pending">Pending</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Comments Console */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-6">
                        {/* Initial Description */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-[10px] font-black text-white uppercase">
                                    {ticket.createdBy?.full_name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{ticket.createdBy?.full_name}</p>
                                    <p className="text-[9px] font-bold text-slate-400">ORIGINAL TRANSMISSION</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">{ticket.description}</p>
                        </div>

                        {/* Thread */}
                        {ticket.comments?.map((c, i) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={i}
                                className={`p-8 rounded-[2rem] border transition-all ${
                                    c.isPrivate 
                                    ? 'bg-amber-500/5 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.05)]' 
                                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black uppercase ${c.isPrivate ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-sky-500'}`}>
                                            {c.sender?.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className={`text-xs font-black uppercase tracking-tight ${c.isPrivate ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                                                {c.sender?.full_name || 'System User'}
                                                {c.isPrivate && <span className="ml-2 text-[8px] bg-amber-500/10 px-2 py-0.5 rounded text-amber-500 tracking-widest">INTERNAL</span>}
                                            </p>
                                            <p className="text-[9px] font-bold text-slate-400 capitalize">{new Date(c.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <p className={`text-sm leading-relaxed ${c.isPrivate ? 'text-amber-700/80 italic font-medium' : 'text-slate-600 dark:text-slate-400 font-medium'}`}>
                                    {c.message}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Reply Interface */}
                    <div className="bg-slate-900 dark:bg-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                        
                        <form onSubmit={handleAddComment} className="space-y-6 relative z-10">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Secure Transmission</label>
                                {isAgentOrAdmin && (
                                    <button 
                                        type="button"
                                        onClick={() => setIsPrivate(!isPrivate)}
                                        className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border ${
                                            isPrivate 
                                            ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' 
                                            : 'bg-transparent text-slate-500 border-slate-700 dark:border-slate-200'
                                        }`}
                                    >
                                        {isPrivate ? 'Private Note ON' : 'Make Private'}
                                    </button>
                                )}
                            </div>
                            
                            <textarea 
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder={isPrivate ? "Draft internal note..." : "Compose support reply..."}
                                className={`w-full bg-slate-800/50 dark:bg-slate-100 rounded-2xl p-6 text-sm font-medium outline-none border-2 transition-all h-32 resize-none ${
                                    isPrivate 
                                    ? 'border-amber-500/30 text-amber-100 dark:text-amber-900 focus:border-amber-500' 
                                    : 'border-slate-700 dark:border-slate-200 text-white dark:text-slate-900 focus:border-sky-500'
                                }`}
                            />
                            
                            <button 
                                type="submit"
                                disabled={isSubmitting || !comment.trim()}
                                className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.25em] text-[10px] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 ${
                                    isPrivate ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-sky-500 text-white shadow-sky-500/20'
                                } shadow-xl`}
                            >
                                <IconPlus className="w-4 h-4" />
                                {isSubmitting ? 'Sending...' : 'Transmit Message'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    
                    {/* Status Card */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 space-y-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Operational Intel</p>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Category</span>
                                <span className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{ticket.category}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Priority</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${
                                    ticket.priority === 'Urgent' ? 'text-rose-500' : 'text-sky-500'
                                }`}>{ticket.priority}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Deadline</span>
                                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">
                                    {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>

                        <div className={`mt-6 p-4 rounded-2xl border flex items-center gap-4 ${
                            ticket.status === 'Resolved' 
                            ? 'bg-emerald-500/5 border-emerald-500/10' 
                            : 'bg-amber-500/5 border-amber-500/10'
                        }`}>
                            <div className={`w-2 h-2 rounded-full ${ticket.status === 'Resolved' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                            <div>
                                <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{ticket.status}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase">Current Status</p>
                            </div>
                        </div>
                    </div>

                    {/* Assignment Card */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 space-y-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Personnel Assigned</p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <IconClock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    {ticket.assignedTo?.full_name || 'System Queue'}
                                </p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Primary Handler</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
