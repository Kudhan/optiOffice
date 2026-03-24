import React, { useState, useEffect } from 'react';
import { 
  X, UserPlus, Search, AlertTriangle, 
  CheckCircle2, Users, ArrowRightLeft, ShieldAlert
} from 'lucide-react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const ManagerTransferModal = ({ isOpen, onClose, user, onRefresh }) => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManager, setSelectedManager] = useState(null);
  const [reassignTasks, setReassignTasks] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPotentialManagers();
    }
  }, [isOpen]);

  const fetchPotentialManagers = async () => {
    try {
      setLoading(true);
      // Backend now supports array role query: /users?role=admin&role=manager&role=hr
      const res = await apiClient.get('/users', { 
        params: { role: ['admin', 'manager', 'hr'] } 
      });
      
      // Filter out self and ensure only management roles are present (double-layered security)
      const list = res.data.filter(u => {
        const isSelf = (u.id || u._id) === (user?.id || user?._id);
        const isCommandRole = ['admin', 'manager', 'hr'].includes(u.role?.toLowerCase());
        return !isSelf && isCommandRole;
      });
      
      setManagers(list);
    } catch (err) {
      toast.error("Failed to load command hierarchy.");
    } finally {
      setLoading(false);
    }
  };

  const filteredManagers = managers.filter(m => 
    m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTransfer = async () => {
    if (!selectedManager) {
      toast.error("Please select a new Command Node (Manager).");
      return;
    }

    try {
      setSaving(true);
      await apiClient.patch(`/users/${user.id || user._id}/hierarchy`, {
        managerId: selectedManager.id || selectedManager._id,
        reassignTasks
      });
      
      toast.success(`Personnel Transfer Protocol Successful: ${user.username} -> ${selectedManager.username}`);
      onRefresh();
      onClose();
    } catch (err) {
      const detail = err.response?.data?.detail || "Transfer Failed: Hierarchy Loop Detected.";
      toast.error(detail, { duration: 5000 });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-xl" onClick={onClose} />
      
      <div className="bg-white dark:bg-navy-950 w-full max-w-2xl rounded-[3.5rem] shadow-2xl border border-border overflow-hidden flex flex-col animate-scale-in relative ring-1 ring-white/10">
        
        {/* Header */}
        <div className="p-10 border-b border-border bg-gradient-to-br from-primary-muted/20 to-transparent">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 shadow-inner">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <button onClick={onClose} className="p-3 rounded-2xl hover:bg-rose-500/10 hover:text-rose-500 transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
          <h2 className="text-3xl font-black text-content-main tracking-tighter mb-2">Personnel Transfer Protocol</h2>
          <p className="text-content-muted text-[10px] uppercase font-black tracking-widest leading-relaxed">
            Target Node: <span className="text-sky-500">{user.full_name}</span> | <span className="text-amber-500">Realigning Command Line</span>
          </p>
        </div>

        <div className="p-10 bg-white dark:bg-navy-950/50 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted group-focus-within:text-sky-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search for New Command Node (Manager)..."
              className="w-full bg-primary-muted/30 border border-border rounded-2.5xl py-4.5 pl-14 pr-8 text-[11px] font-black uppercase tracking-widest dark:text-white focus:ring-4 focus:ring-sky-500/10 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* List Area */}
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
            {loading ? (
              <div className="py-20 text-center font-black text-content-muted uppercase text-[10px] tracking-[0.3em] animate-pulse">Syncing Hierarchy...</div>
            ) : filteredManagers.length === 0 ? (
              <div className="py-20 text-center font-black text-rose-500 uppercase text-[10px] tracking-[0.3em]">No Valid Managers Detected</div>
            ) : (
              filteredManagers.map(m => (
                <button
                  key={m.id || m._id}
                  onClick={() => setSelectedManager(m)}
                  className={`w-full p-6 rounded-3xl border transition-all flex items-center justify-between group ${
                    (selectedManager?.id === (m.id || m._id) || selectedManager?._id === (m.id || m._id))
                      ? 'bg-sky-500 text-white border-sky-500 shadow-xl shadow-sky-500/20' 
                      : 'bg-primary-muted/20 border-border hover:border-sky-500/50 hover:bg-primary-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${
                      (selectedManager?.id === (m.id || m._id) || selectedManager?._id === (m.id || m._id)) ? 'bg-white text-sky-500' : 'bg-primary-muted text-content-muted'
                    }`}>
                      {m.full_name?.charAt(0)}
                    </div>
                    <div className="text-left leading-none">
                      <p className="font-black text-[13px] tracking-tight mb-1">{m.full_name}</p>
                      <p className={`text-[9px] font-black uppercase tracking-widest ${
                         (selectedManager?.id === (m.id || m._id) || selectedManager?._id === (m.id || m._id)) ? 'text-white/70' : 'text-content-muted'
                      }`}>{m.role} | {m.department}</p>
                    </div>
                  </div>
                  {(selectedManager?.id === (m.id || m._id) || selectedManager?._id === (m.id || m._id)) && <CheckCircle2 className="w-5 h-5 text-white" />}
                </button>
              ))
            )}
          </div>

          {/* Logic Toggles */}
          <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-[11px] font-black text-content-main uppercase tracking-widest">Bulk Reassign Objectives</h4>
                <p className="text-[10px] font-bold text-content-muted">Migrate all active tasks from old manager to new observer.</p>
              </div>
              <button 
                onClick={() => setReassignTasks(!reassignTasks)}
                className={`w-14 h-8 rounded-full transition-all relative ${reassignTasks ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${reassignTasks ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4">
            <button 
              onClick={handleTransfer}
              disabled={saving || !selectedManager}
              className="w-full py-5 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-navy-950 font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 dark:hover:text-white transition-all transform active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              {saving ? 'Executing Protocol...' : (
                <span className="flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4 group-hover:animate-bounce" />
                  Initiate Transfer Node
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerTransferModal;
