import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { IconUsers, IconCalendar, IconPlus, IconSearch, IconChevronRight, IconActivity } from './Icons';

/**
 * Tasks Component: Premium Kanban Strategy Board
 * Upgraded to support multi-person assignments and role-based scope.
 */
function Tasks({ token }) {
  const [tasks, setTasks] = useState([]);
  const [assignees, setAssignees] = useState([]); // Potential people to assign to
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newTask, setNewTask] = useState({
    title: '', 
    description: '', 
    assigned_to: [], // Array of User ObjectIds
    priority: 'Medium', 
    due_date: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchAssignees();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await apiClient.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const fetchAssignees = async () => {
    try {
      const response = await apiClient.get('/users'); // Uses getScope to filter Admin/Manager lists
      setAssignees(response.data);
    } catch (err) {
      console.error("Failed to fetch potential assignees", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/tasks', newTask);
      fetchTasks();
      setShowForm(false);
      setNewTask({ title: '', description: '', assigned_to: [], priority: 'Medium', due_date: '' });
    } catch (err) {
      alert("Failed to create task");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await apiClient.put(`/tasks/${id}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const toggleAssignee = (userId) => {
    setNewTask(prev => {
        const isAssigned = prev.assigned_to.includes(userId);
        if (isAssigned) {
            return { ...prev, assigned_to: prev.assigned_to.filter(id => id !== userId) };
        } else {
            return { ...prev, assigned_to: [...prev.assigned_to, userId] };
        }
    });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="p-10 max-w-[1700px] mx-auto min-h-[85vh] animate-fade-in flex flex-col space-y-10">
      
      {/* Header Intelligence */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-10">
        <div>
          <h2 className="text-5xl font-black text-content-main tracking-tighter uppercase italic leading-none">
            Strategy <span className="text-sky-500">Board.</span>
          </h2>
          <p className="text-content-muted font-bold mt-4 uppercase tracking-widest text-[10px]">
            Agile Operations / Multi-Node Resource Assignment
          </p>
        </div>
        
        <button 
          className={`flex items-center gap-2 font-black py-4 px-10 rounded-2xl transition-all shadow-xl active:scale-95 ${
            showForm ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-sky-500 text-white shadow-sky-500/20 hover:brightness-110'
          }`} 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'CANCEL PROTOCOL' : <><IconPlus className="w-5 h-5" /> NEW OBJECTIVE</>}
        </button>
      </div>

      {showForm && (
        <form className="bg-primary-surface border border-border rounded-[2.5rem] p-10 shadow-2xl animate-slide-up" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Primary Details */}
            <div className="lg:col-span-8 space-y-8">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.2em] ml-2">Objective Title</label>
                    <input 
                        className="w-full px-8 py-5 rounded-2xl border border-border bg-primary-muted/30 focus:bg-primary-surface focus:ring-2 focus:ring-sky-500/50 transition-all outline-none text-lg font-bold text-content-main placeholder:opacity-30" 
                        name="title" 
                        placeholder="Define the task name..." 
                        value={newTask.title} 
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})} 
                        required 
                    />
                </div>
                
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.2em] ml-2">Contextual Data</label>
                    <textarea 
                        className="w-full px-8 py-5 rounded-2xl border border-border bg-primary-muted/30 focus:bg-primary-surface focus:ring-2 focus:ring-sky-500/50 transition-all outline-none resize-none h-40 text-sm font-medium text-content-main placeholder:opacity-30" 
                        placeholder="Add technical requirements or description..." 
                        value={newTask.description} 
                        onChange={(e) => setNewTask({...newTask, description: e.target.value})} 
                    />
                </div>
            </div>

            {/* Assignment & Metadata */}
            <div className="lg:col-span-4 space-y-8">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.2em] ml-2">Assign Personnel (Multi)</label>
                    <div className="bg-primary-muted/30 border border-border rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-sky-500/50 transition-all max-h-[300px] flex flex-col">
                        <div className="p-4 border-b border-border bg-primary-surface/50 flex items-center gap-2">
                             <IconSearch className="w-4 h-4 text-content-muted" />
                             <input 
                                type="text"
                                placeholder="Filter personnel..."
                                className="bg-transparent text-xs font-bold text-content-main outline-none w-full"
                                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                             />
                        </div>
                        <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {assignees
                                .filter(u => u.full_name?.toLowerCase().includes(searchQuery) || u.username?.toLowerCase().includes(searchQuery))
                                .map(user => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => toggleAssignee(user.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                                        newTask.assigned_to.includes(user.id) 
                                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' 
                                        : 'hover:bg-primary-muted text-content-main'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border ${
                                        newTask.assigned_to.includes(user.id) ? 'bg-white/20 border-white/30' : 'bg-primary-surface border-border'
                                    }`}>
                                        {getInitials(user.full_name)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-black uppercase leading-none truncate">{user.full_name}</p>
                                        <p className={`text-[9px] mt-0.5 font-bold truncate ${newTask.assigned_to.includes(user.id) ? 'text-white/60' : 'text-content-muted'}`}>@{user.username}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.2em] ml-2">Priority</label>
                        <div className="relative">
                            <select 
                                className="w-full px-6 py-4 rounded-2xl border border-border bg-primary-muted/30 focus:bg-primary-surface focus:ring-2 focus:ring-sky-500/50 transition-all outline-none text-xs font-black uppercase cursor-pointer appearance-none" 
                                name="priority" 
                                value={newTask.priority} 
                                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                            <IconChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 rotate-90 opacity-30 pointer-events-none" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-content-muted uppercase tracking-[0.2em] ml-2">Deadline</label>
                        <input 
                            className="w-full px-6 py-4 rounded-2xl border border-border bg-primary-muted/30 focus:bg-primary-surface focus:ring-2 focus:ring-sky-500/50 transition-all outline-none text-xs font-black uppercase" 
                            type="date" 
                            value={newTask.due_date} 
                            onChange={(e) => setNewTask({...newTask, due_date: e.target.value})} 
                        />
                    </div>
                </div>
            </div>
          </div>
          
          <div className="mt-10 flex justify-end">
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 px-12 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 uppercase tracking-widest text-xs">
                Authorize Objective
            </button>
          </div>
        </form>
      )}

      {/* Kanban Environment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 flex-1">
        {['To Do', 'In Progress', 'Done'].map(status => (
          <div key={status} className="flex flex-col h-full bg-primary-muted/20 rounded-[3rem] border border-border overflow-hidden">
            <div className="flex items-center justify-between p-8 border-b border-border bg-primary-muted/30">
               <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${status === 'Done' ? 'bg-emerald-500' : status === 'In Progress' ? 'bg-sky-500' : 'bg-content-muted'}`}></div>
                    <h3 className="font-black text-content-main text-lg uppercase tracking-tighter italic">{status}</h3>
               </div>
               <span className="bg-primary-surface text-content-main border border-border font-black text-[10px] py-1.5 px-4 rounded-full shadow-inner">
                 {tasks.filter(t => t.status === status).length} NODE{tasks.filter(t => t.status === status).length !== 1 ? 'S' : ''}
               </span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              {tasks.filter(t => t.status === status).length === 0 ? (
                 <div className="h-40 flex items-center justify-center border-2 border-dashed border-border rounded-[2.5rem] opacity-20">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Active Nodes</p>
                 </div>
              ) : (
                tasks.filter(t => t.status === status).map(task => (
                  <div key={task.id} className="bg-primary-surface rounded-[2rem] p-8 border border-border shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                    {/* Priority Accent */}
                    <div className={`absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full opacity-10 blur-2xl transition-all group-hover:opacity-30 ${
                        task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-sky-500'
                    }`}></div>
                    
                    <div className="flex justify-between items-start mb-6">
                      <span className={`inline-block px-4 py-1.5 text-[9px] font-black uppercase rounded-full border tracking-widest ${
                        task.priority === 'High' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                        task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                        'bg-sky-500/10 text-sky-500 border-sky-500/20'
                        }`}>
                        {task.priority} LEVEL
                      </span>
                      {task.due_date && (
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-content-muted">
                            <IconCalendar className="w-3 h-3" />
                            <span className="uppercase">{new Date(task.due_date).toLocaleDateString('default', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      )}
                    </div>
                    
                    <h4 className="font-black text-content-main text-xl mb-1 tracking-tighter leading-tight group-hover:text-sky-500 transition-colors uppercase italic">{task.title}</h4>
                    <p className="text-sky-500 text-[10px] font-black uppercase tracking-widest mb-3 opacity-80 decoration-sky-500/30 underline">
                        {task.assigned_to?.map(u => u.full_name.split(' ')[0]).join(' & ') || 'Pending Assignment'}
                    </p>
                    <p className="text-content-muted text-[11px] font-medium line-clamp-2 mb-8 leading-relaxed opacity-70">
                        {task.description || "Standard operation parameters enforced."}
                    </p>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-border">
                        {/* Multi-Avatar Stack */}
                        <div className="flex -space-x-3">
                            {task.assigned_to && task.assigned_to.length > 0 ? (
                                task.assigned_to.map((person, idx) => (
                                    <div 
                                        key={person.id || person._id || idx} 
                                        className="w-9 h-9 rounded-xl bg-primary-muted border-2 border-primary-surface flex items-center justify-center text-[10px] font-black text-content-main shadow-md group-hover:scale-110 transition-transform cursor-help"
                                        title={person.full_name}
                                    >
                                        {person.profile_photo ? <img src={person.profile_photo} className="w-full h-full rounded-xl object-cover" /> : getInitials(person.full_name)}
                                    </div>
                                ))
                            ) : (
                                <div className="w-9 h-9 rounded-xl bg-primary-muted border-2 border-dashed border-border flex items-center justify-center text-[10px] font-black text-content-muted">?</div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <select
                                    value={task.status}
                                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                    className="text-[10px] font-black text-content-muted bg-primary-muted/50 border border-border rounded-xl py-2 px-4 cursor-pointer outline-none hover:bg-sky-500/10 hover:text-sky-500 transition-all uppercase tracking-widest appearance-none"
                                >
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                                <IconChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rotate-90 text-content-muted opacity-30 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Status */}
      <div className="flex justify-center opacity-20">
         <div className="flex flex-col items-center gap-2">
            <IconActivity className="w-6 h-6 text-sky-500" />
            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-content-muted">Task Core Protocol v2.5</span>
         </div>
      </div>
    </div>
  );
}

export default Tasks;
