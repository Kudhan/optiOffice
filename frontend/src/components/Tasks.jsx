import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/client';
import useAuth from '../hooks/useAuth';
import { 
  IconPlus, 
  IconUsers, 
  IconClock, 
  IconCalendar, 
  IconCheck, 
  IconAlertCircle,
  IconChevronRight,
  IconSearch,
  IconFilter
} from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

const Tasks = () => {
    const { user, isAdmin } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filterPriority, setFilterPriority] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assigned_to: [],
        priority: 'Medium',
        due_date: '',
        status: 'To Do'
    });

    const columns = ['To Do', 'In Progress', 'Done'];

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksRes, usersRes] = await Promise.all([
                apiClient.get('/tasks'),
                apiClient.get('/users')
            ]);
            setTasks(tasksRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            console.error("Telemetry link fragmented", err);
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
            await apiClient.post('/tasks', newTask);
            setShowForm(false);
            setNewTask({
                title: '',
                description: '',
                assigned_to: [],
                priority: 'Medium',
                due_date: '',
                status: 'To Do'
            });
            fetchData();
        } catch (err) {
            console.error("Task crystallization failed");
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            if (!taskId) {
                console.error("Task ID is missing for status change");
                return;
            }
            await apiClient.put(`/tasks/${taskId}`, { status: newStatus });
            fetchData();
        } catch (err) {
            console.error("Status synchronization failed");
        }
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 task.description?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesPriority && matchesSearch;
        });
    }, [tasks, filterPriority, searchQuery]);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'Medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'Low': return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
            default: return 'bg-slate-500/10 text-slate-500';
        }
    };

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center animate-pulse text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">
            Synthesizing Strategic Objectives...
        </div>
    );

    return (
        <div className="p-6 md:p-10 max-w-[1700px] mx-auto space-y-10 animate-fade-in flex flex-col min-h-screen">
            
            {/* Header Strategy Bar */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 shrink-0">
                <div className="space-y-2">
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">
                        Strategy <span className="text-sky-500 italic">Board</span>
                    </h2>
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/50 w-fit">
                        <IconClock className="w-3.5 h-3.5 text-sky-500" />
                        <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.25em]">Tactical Objective Alignment</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 xl:w-72">
                        <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Find mission..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-sky-500 outline-none font-bold text-xs transition-all shadow-sm"
                        />
                    </div>

                    {/* Priority Filter */}
                    <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                        {['All', 'High', 'Medium', 'Low'].map(p => (
                            <button 
                                key={p}
                                onClick={() => setFilterPriority(p)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterPriority === p ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-sky-500'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all flex items-center gap-3 active:scale-95 uppercase tracking-[0.2em] text-[10px]"
                    >
                        <IconPlus className="w-4 h-4" />
                        Initialize Task
                    </button>
                </div>
            </div>

            {/* Task Creation Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xl flex items-start justify-center p-6 pt-20 overflow-y-auto custom-scrollbar"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-2xl p-10 w-full max-w-2xl space-y-8 mb-20"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Configure <span className="text-sky-500 italic">Objective</span></h3>
                                <button onClick={() => setShowForm(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white transition-all text-slate-500 font-bold">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Title</label>
                                        <input 
                                            required
                                            value={newTask.title}
                                            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-sky-500 outline-none font-bold text-xs"
                                            placeholder="Mission Critical Title"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Priority</label>
                                        <select 
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-sky-500 outline-none font-bold text-xs appearance-none cursor-pointer"
                                        >
                                            <option value="Low">Low Clearance</option>
                                            <option value="Medium">Medium Clearance</option>
                                            <option value="High">High Clearance (Priority)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Deadline</label>
                                        <input 
                                            type="date"
                                            value={newTask.due_date}
                                            onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-sky-500 outline-none font-bold text-xs"
                                        />
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Deployment (Assignees)</label>
                                        <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 min-h-[100px]">
                                            {users.map(u => {
                                                const isAssigned = newTask.assigned_to.includes(u.id);
                                                return (
                                                    <button
                                                        key={u.id}
                                                        type="button"
                                                        onClick={() => {
                                                            const current = [...newTask.assigned_to];
                                                            if (isAssigned) {
                                                                setNewTask({...newTask, assigned_to: current.filter(id => id !== u.id)});
                                                            } else {
                                                                setNewTask({...newTask, assigned_to: [...current, u.id]});
                                                            }
                                                        }}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-[10px] font-bold ${isAssigned ? 'bg-sky-500 text-white border-transparent' : 'bg-white dark:bg-slate-700 text-slate-500 border-slate-200 dark:border-slate-600 hover:border-sky-500'}`}
                                                    >
                                                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden flex items-center justify-center text-[8px] font-black">
                                                            {u.profile_photo ? <img src={u.profile_photo} alt="" /> : u.full_name?.charAt(0)}
                                                        </div>
                                                        {u.full_name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Briefing</label>
                                        <textarea 
                                            value={newTask.description}
                                            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-sky-500 outline-none font-bold text-xs h-32 resize-none"
                                            placeholder="Detailed tactical instructions..."
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-5 rounded-2xl bg-sky-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-sky-500/20 active:scale-95 transition-all">Crystalize Task</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 flex-1 overflow-hidden min-h-[600px]">
                {columns.map((col, idx) => (
                    <div key={col} className="flex flex-col gap-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 p-6 shadow-inner animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                        <div className="flex items-center justify-between px-4 pt-2 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${col === 'Done' ? 'bg-emerald-500' : col === 'In Progress' ? 'bg-amber-500' : 'bg-sky-500'} animate-pulse shadow-[0_0_10px_rgba(14,165,233,0.5)]`} />
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{col}</h3>
                            </div>
                            <span className="bg-white dark:bg-slate-800 text-[10px] font-black px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-700 text-slate-400">
                                {filteredTasks.filter(t => t.status === col).length} Tasks
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 px-2 pb-10">
                            <AnimatePresence>
                                {filteredTasks.filter(t => t.status === col).map(task => (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={task.id}
                                        className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-sky-500/5 transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-sky-500/10 transition-colors" />
                                        
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.1em] border ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                            {task.due_date && (
                                                <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[9px] uppercase tracking-tighter">
                                                    <IconCalendar className="w-3 h-3" />
                                                    {new Date(task.due_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>

                                        <h4 className="text-slate-900 dark:text-white font-black tracking-tight mb-2 pr-4">{task.title}</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-6 font-medium leading-relaxed">{task.description}</p>
                                        
                                        {/* Assignee Avatar Stack */}
                                        <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-700/50">
                                            <div className="flex items-center">
                                                <div className="flex -space-x-3 overflow-hidden">
                                                    {task.assigned_to?.map((assignee, idx) => (
                                                        <div 
                                                            key={assignee.id || idx}
                                                            className="inline-block h-8 w-8 rounded-full ring-4 ring-white dark:ring-slate-800 bg-slate-100 dark:bg-slate-700 overflow-hidden"
                                                            title={assignee.full_name || 'Assignee'}
                                                        >
                                                            {assignee.profile_photo ? (
                                                                <img className="h-full w-full object-cover" src={assignee.profile_photo} alt="" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center text-[10px] font-black text-sky-500">
                                                                    {assignee.full_name?.charAt(0) || 'U'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {task.assigned_to?.length === 0 && (
                                                        <div className="h-8 w-8 rounded-full ring-4 ring-white dark:ring-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                            <IconUsers className="w-4 h-4 text-slate-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                {task.assigned_to?.length > 3 && (
                                                    <span className="text-[9px] font-black text-slate-400 ml-3 uppercase tracking-tighter">+{task.assigned_to.length - 3} Units</span>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                {col !== 'To Do' && (
                                                    <button 
                                                        onClick={() => handleStatusChange(task.id, col === 'Done' ? 'In Progress' : 'To Do')}
                                                        className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-400"
                                                    >
                                                        <IconChevronRight className="w-4 h-4 rotate-180" />
                                                    </button>
                                                )}
                                                {col !== 'Done' && (
                                                    <button 
                                                        onClick={() => handleStatusChange(task.id, col === 'To Do' ? 'In Progress' : 'Done')}
                                                        className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all"
                                                    >
                                                        <IconChevronRight className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tasks;

