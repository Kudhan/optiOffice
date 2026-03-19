import React, { useState } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const SecurityModal = ({ isOpen, onClose, user, onRefresh }) => {
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user?.role || 'employee');
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const handleStatusChange = async (action) => {
    try {
      const loadingToast = toast.loading(`${action}ing user lifecycle...`);
      await apiClient.patch(`users/${user._id}/status`, { action });
      toast.success(`User ${user.full_name} has been ${action === 'Block' ? 'Blocked' : 'Suspended'}.`, { id: loadingToast });
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || `Failed to ${action} user.`);
    }
  };

  const handleRoleChange = async () => {
    try {
      const loadingToast = toast.loading('Escalating authority...');
      await apiClient.patch(`users/${user._id}/authority`, { role: selectedRole });
      toast.success(`Authority updated: ${user.full_name} is now ${selectedRole}.`, { id: loadingToast });
      onRefresh();
      setShowConfirm(false);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update authority.');
    }
  };

  const handleTerminate = async () => {
    try {
      const loadingToast = toast.loading('Executing termination protocol...');
      await apiClient.delete(`users/${user._id}/terminate`);
      toast.success(`User ${user.full_name} and all data purged.`, { id: loadingToast });
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Termination failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Glassmorphic Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white/10 dark:bg-navy-950/40 backdrop-blur-2xl rounded-[3rem] border border-white/20 dark:border-slate-800/50 shadow-2xl overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="p-8 border-b border-white/10 dark:border-slate-800/50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tighter uppercase grayscale group-hover:grayscale-0">
                Secure Access Protocol
              </h3>
              <p className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">
                Asset: {user?.full_name} ({user?.role})
              </p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all">
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-10">
          
          {/* Section 1: Role Escalation */}
          <section className="space-y-4">
            <h4 className="text-xs font-black text-sky-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              Authority Controller
            </h4>
            
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-6">
              <div className="flex flex-wrap gap-2">
                {['Admin', 'Manager', 'Employee'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedRole === role 
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' 
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              {!showConfirm ? (
                <button 
                  onClick={() => setShowConfirm(true)}
                  disabled={selectedRole === user?.role}
                  className="w-full py-4 rounded-2xl bg-white text-navy-950 text-xs font-black uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Initiate Role Change
                </button>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest text-center">
                    ⚠️ Confirm Authority Escalation to {selectedRole}?
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleRoleChange}
                      className="flex-1 py-4 rounded-2xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                    >
                      Verify & Commit
                    </button>
                    <button 
                      onClick={() => setShowConfirm(false)}
                      className="px-8 py-4 rounded-2xl bg-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                    >
                      Abort
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section 2: Lifecycle Actions */}
          <section className="space-y-4">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Lifecycle Management
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleStatusChange('Block')}
                className="py-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-500 transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">🔒</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Block Access</span>
              </button>

              <button 
                onClick={() => handleStatusChange('Suspend')}
                className="py-6 rounded-3xl bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 text-yellow-500 transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">⏳</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Suspend Account</span>
              </button>
            </div>

            {/* Danger Zone */}
            <div className="pt-4">
              <div className="p-1 rounded-[2.2rem] bg-rose-500/10 border border-rose-500/30">
                <button 
                  onClick={() => {
                    if (window.confirm("CRITICAL: This action is irreversible. All user meta-data will be purged. Continue?")) {
                      handleTerminate();
                    }
                  }}
                  className="w-full py-6 rounded-[1.8rem] bg-rose-500 text-white text-[10px] font-black uppercase tracking-[0.25em] hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center gap-3 active:scale-95"
                >
                  <span>☢️</span>
                  Terminate User Lifecycle
                  <span>☢️</span>
                </button>
              </div>
              <p className="text-center text-[8px] text-rose-500/60 font-black uppercase tracking-[0.3em] mt-3 animate-pulse">
                Irreversible Data Removal Sequence
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default SecurityModal;
