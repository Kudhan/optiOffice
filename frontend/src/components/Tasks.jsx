import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

function Tasks({ token }) {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '', description: '', assigned_to: '', priority: 'Medium', due_date: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await apiClient.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/tasks', newTask);
      fetchTasks();
      setShowForm(false);
      setNewTask({ title: '', description: '', assigned_to: '', priority: 'Medium', due_date: '' });
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

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-[85vh] animate-fade-in flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Task Board</h2>
          <p className="text-slate-500 mt-1">Manage project sprints and daily assignments.</p>
        </div>
        <button 
          className="bg-action hover:bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow active:scale-95" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'New Task'}
        </button>
      </div>

      {showForm && (
        <form className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-slate-200 mb-8 animate-fade-in shrink-0" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <input className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-action transition-all outline-none" name="title" placeholder="Task Title" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} required />
            <input className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-action transition-all outline-none" name="assigned_to" placeholder="Assign To (Username)" value={newTask.assigned_to} onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})} />
            <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-action transition-all outline-none cursor-pointer" name="priority" value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <input className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-action transition-all outline-none" type="date" value={newTask.due_date} onChange={(e) => setNewTask({...newTask, due_date: e.target.value})} />
            <textarea className="w-full lg:col-span-4 px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-action transition-all outline-none resize-none h-24" placeholder="Task Description" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} />
          </div>
          <div className="mt-5 flex justify-end">
            <button type="submit" className="bg-success hover:bg-emerald-600 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow active:scale-95">Create Task</button>
          </div>
        </form>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        {['To Do', 'In Progress', 'Done'].map(status => (
          <div key={status} className="bg-slate-100/50 backdrop-blur-sm rounded-3xl p-4 border border-slate-200/60 flex flex-col h-full overflow-hidden shadow-inner">
            <div className="flex items-center justify-between mb-4 px-2 pt-2 shrink-0">
               <h3 className="font-bold text-slate-700 text-lg">{status}</h3>
               <span className="bg-slate-200 text-slate-600 font-bold text-xs py-1 px-3 rounded-full">
                 {tasks.filter(t => t.status === status).length}
               </span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-4 flex flex-col gap-4">
              {tasks.filter(t => t.status === status).length === 0 ? (
                 <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl m-2">
                   No tasks
                 </div>
              ) : (
                tasks.filter(t => t.status === status).map(task => (
                  <div key={task.id} className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)] transition-all duration-300 group flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ${task.priority === 'High' ? 'bg-red-100 text-red-700' : task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {task.priority}
                      </span>
                      {task.due_date && <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">{new Date(task.due_date).toLocaleDateString()}</span>}
                    </div>
                    
                    <h4 className="font-bold text-slate-800 text-base mb-1 pr-2">{task.title}</h4>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">{task.description}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {task.assigned_to ? task.assigned_to.charAt(0).toUpperCase() : '?'}
                        </div>
                        <span className="text-xs font-semibold text-slate-500 truncate max-w-[80px]">
                            {task.assigned_to || 'Unassigned'}
                        </span>
                      </div>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="text-xs font-bold text-slate-600 bg-slate-100 border-none rounded py-1 px-2 cursor-pointer focus:ring-0 outline-none hover:bg-slate-200 transition-colors"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tasks;
