import React, { useState, useEffect } from 'react';
import { 
  X, Search, CheckCircle2, Building2, 
  ArrowRightLeft, ShieldAlert, LayoutGrid
} from 'lucide-react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const DepartmentShiftModal = ({ isOpen, onClose, user, onRefresh }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/departments');
      setDepartments(res.data);
      
      // Pre-select current department if found
      const current = res.data.find(d => d.name === user?.department || d.id === user?.department_id);
      if (current) setSelectedDept(current);
    } catch (err) {
      toast.error("Failed to load organizational units.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDepts = departments.filter(d => 
    d.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShift = async () => {
    if (!selectedDept) {
      toast.error("Please select a target organizational unit.");
      return;
    }

    if (selectedDept.name === user?.department) {
      toast.error("Target node is identical to current deployment base.");
      return;
    }

    try {
      setSaving(true);
      await apiClient.patch(`/users/${user.id || user._id}/department`, {
        departmentId: selectedDept.id || selectedDept._id
      });
      
      toast.success(`Personnel Deployment Successful: ${user.username} -> ${selectedDept.name}`);
      onRefresh();
      onClose();
    } catch (err) {
      const detail = err.response?.data?.detail || "Deployment Protocol Failed.";
      toast.error(detail);
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
        <div className="p-10 border-b border-border bg-gradient-to-br from-indigo-500/10 to-transparent">
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner border border-indigo-500/20">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <button onClick={onClose} className="p-3 rounded-2xl hover:bg-rose-500/10 hover:text-rose-500 transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
          <h2 className="text-3xl font-black text-content-main tracking-tighter mb-2">Personnel Shifting Protocol</h2>
          <p className="text-content-muted text-[10px] uppercase font-black tracking-widest leading-relaxed">
            Target Node: <span className="text-indigo-500">{user.full_name}</span> | <span className="text-indigo-500/60">Current Base: {user.department}</span>
          </p>
        </div>

        <div className="p-10 bg-white dark:bg-navy-950/50 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="Locate Target Organizational Unit..."
              className="w-full bg-primary-muted/30 border border-border rounded-2.5xl py-4.5 pl-14 pr-8 text-[11px] font-black uppercase tracking-widest dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* List Area */}
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
            {loading ? (
              <div className="py-20 text-center font-black text-content-muted uppercase text-[10px] tracking-[0.3em] animate-pulse">Scanning Neural Network...</div>
            ) : filteredDepts.length === 0 ? (
              <div className="py-20 text-center font-black text-rose-500 uppercase text-[10px] tracking-[0.3em]">No Accessible Units Found</div>
            ) : (
              filteredDepts.map(d => (
                <button
                  key={d.id || d._id}
                  onClick={() => setSelectedDept(d)}
                  className={`w-full p-6 rounded-3xl border transition-all flex items-center justify-between group ${
                    (selectedDept?.id === (d.id || d._id) || selectedDept?._id === (d.id || d._id))
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-500/20' 
                      : 'bg-primary-muted/20 border-border hover:border-indigo-500/50 hover:bg-primary-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${
                      (selectedDept?.id === (d.id || d._id) || selectedDept?._id === (d.id || d._id)) ? 'bg-white text-indigo-600' : 'bg-primary-muted text-content-muted'
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="text-left leading-none">
                      <p className="font-black text-[13px] tracking-tight mb-1">{d.name}</p>
                      <p className={`text-[9px] font-black uppercase tracking-widest ${
                         (selectedDept?.id === (d.id || d._id) || selectedDept?._id === (d.id || d._id)) ? 'text-white/70' : 'text-content-muted'
                      }`}>Status: System Active</p>
                    </div>
                  </div>
                  {(selectedDept?.id === (d.id || d._id) || selectedDept?._id === (d.id || d._id)) && <CheckCircle2 className="w-5 h-5 text-white" />}
                </button>
              ))
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-border/50">
            <button 
              onClick={handleShift}
              disabled={saving || !selectedDept || selectedDept.name === user?.department}
              className="w-full py-5 rounded-3xl bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition-all transform active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
            >
              <ShieldAlert className="w-4 h-4 group-hover:animate-bounce" />
              {saving ? 'Transmitting Data...' : 'Initiate Unit Deployment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentShiftModal;
