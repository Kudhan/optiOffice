import React, { useState, useEffect } from 'react';
import { 
  X, Activity, ClipboardList, Clock, Shield, 
  Lock, LogOut, CheckCircle2, AlertCircle, TrendingUp,
  ChevronRight, Calendar, User as UserIcon, Edit
} from 'lucide-react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import EditProfileModal from './EditProfileModal';
import AttendanceCalendar from './AttendanceCalendar';
import { motion, AnimatePresence } from 'framer-motion';

const DossierModal = ({ isOpen, onClose, user, onRefresh, departments = [] }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [fullUser, setFullUser] = useState(null);
  const [attendanceViewMode, setAttendanceViewMode] = useState('list'); // 'list' | 'calendar'

  useEffect(() => {
    if (isOpen && user) {
      fetchDossier();
    }
  }, [isOpen, user]);

  const fetchDossier = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/users/${user.id || user._id}/dossier`);
      setStats(res.data.stats);
      setFullUser(res.data.user);
    } catch (err) {
      toast.error("Failed to load dossier data.");
    } finally {
      setLoading(false);
    }
  };

  const handleKillSwitch = async (action) => {
    if (!window.confirm(`Execute protocol: ${action.toUpperCase()} on ${user.username}?`)) return;
    try {
      await apiClient.post(`/users/${user.id || user._id}/kill-switch`, { action });
      toast.success(`Protocol ${action} executed successfully.`);
      onRefresh();
      if (action === 'freeze' || action === 'unfreeze') fetchDossier();
    } catch (err) {
      toast.error("Security protocol execution failed.");
    }
  };

  const handleAdminSave = async (updatedData) => {
    try {
      await apiClient.patch(`/users/${user.id || user._id}`, updatedData);
      toast.success("Identity Override Successful");
      fetchDossier();
      onRefresh();
    } catch (err) {
      toast.error("Override Protocol Failed");
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'Overview', icon: Activity },
    { id: 'Performance', icon: ClipboardList },
    { id: 'Attendance', icon: Clock },
    { id: 'Security', icon: Shield },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="bg-white dark:bg-navy-950 w-full max-w-5xl h-[85vh] rounded-[3rem] shadow-2xl border border-border overflow-hidden flex flex-col animate-scale-in relative">
        {/* Header */}
        <div className="p-8 border-b border-border flex justify-between items-center bg-primary-muted/30">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 font-black text-2xl">
              {user.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-black text-content-main tracking-tighter">{user.full_name}</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-content-muted">Identity Node: {user.username} | {user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsEditOpen(true)}
              className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-sky-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 active:scale-95"
            >
              <Edit className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Edit Dossier
            </button>
            <button onClick={onClose} className="p-3 rounded-2xl hover:bg-rose-500/10 hover:text-rose-500 transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 border-r border-border bg-primary-muted/10 p-4 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' 
                    : 'text-content-muted hover:bg-primary-muted hover:text-content-main'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.id}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-white dark:bg-navy-950">
            {loading ? (
              <div className="flex items-center justify-center h-full text-content-muted font-bold animate-pulse uppercase tracking-widest">Synchronizing Dossier...</div>
            ) : (
              <div className="animate-fade-in">
                {activeTab === 'Overview' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-primary-muted/20 p-8 rounded-[2rem] border border-border">
                        <TrendingUp className="w-8 h-8 text-emerald-500 mb-4" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-content-muted mb-2">Performance Quotient</h4>
                        <p className="text-4xl font-black text-content-main tracking-tighter">
                          {(stats?.performance || 0).toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-primary-muted/20 p-8 rounded-[2rem] border border-border">
                        <ClipboardList className="w-8 h-8 text-sky-500 mb-4" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-content-muted mb-2">Active Objectives</h4>
                        <p className="text-4xl font-black text-content-main tracking-tighter">{stats?.totalTasks - stats?.completedTasks}</p>
                      </div>
                      <div className="bg-primary-muted/20 p-8 rounded-[2rem] border border-border">
                        <Activity className="w-8 h-8 text-amber-500 mb-4" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-content-muted mb-2">Health Pulse</h4>
                        <p className="text-4xl font-black text-content-main tracking-tighter">
                          {stats?.lastPulse || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Identity Dossier */}
                      <div className="bg-navy-50 dark:bg-navy-900/50 p-8 rounded-[2.5rem] border border-border h-full">
                         <h3 className="text-xl font-black text-content-main mb-6 flex items-center gap-3">
                           <Shield className="w-5 h-5 text-sky-500" /> Identity Dossier
                         </h3>
                         <div className="grid grid-cols-1 gap-6 text-[11px] font-bold">
                            <div className="flex justify-between items-center border-b border-border/50 pb-3">
                              <span className="text-content-muted uppercase tracking-widest text-[9px]">Legal Entity</span>
                              <p className="text-content-main font-black underline decoration-sky-500/30 underline-offset-4">{user.privateIdentity?.legalName || user.full_name}</p>
                            </div>
                            <div className="flex justify-between items-center border-b border-border/50 pb-3">
                              <span className="text-content-muted uppercase tracking-widest text-[9px]">Tax Node (TID)</span>
                              <p className="text-sky-500 font-black uppercase tracking-tighter">{user.privateIdentity?.taxId || 'UNREGISTERED'}</p>
                            </div>
                            <div className="flex justify-between items-center border-b border-border/50 pb-3">
                              <span className="text-content-muted uppercase tracking-widest text-[9px]">Passport Serial</span>
                              <p className="text-content-main font-black tracking-widest">{user.privateIdentity?.passportNumber || 'N/A'}</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-content-muted uppercase tracking-widest text-[9px]">Financial Node</span>
                              <p className="text-emerald-500 font-black italic">{user.secureVault?.bankDetails?.bankName ? 'VAULT ACTIVE' : 'NO VAULT DATA'}</p>
                            </div>
                         </div>
                      </div>

                      {/* Administrative Context */}
                      <div className="bg-navy-50 dark:bg-navy-900/50 p-8 rounded-[2.5rem] border border-border h-full">
                         <h3 className="text-xl font-black text-content-main mb-6 flex items-center gap-3">
                           <UserIcon className="w-5 h-5 text-sky-500" /> Administrative Context
                         </h3>
                         <div className="grid grid-cols-1 gap-6 text-[11px] font-bold">
                            <div className="flex justify-between items-center border-b border-border/50 pb-3">
                              <span className="text-content-muted uppercase tracking-widest text-[9px]">Department</span>
                              <p className="text-content-main font-black underline decoration-sky-500/30 underline-offset-4">{user.department}</p>
                            </div>
                            <div className="flex justify-between items-center border-b border-border/50 pb-3">
                              <span className="text-content-muted uppercase tracking-widest text-[9px]">Role Clearance</span>
                              <p className="text-sky-500 font-black uppercase tracking-tighter">{user.role}</p>
                            </div>
                            <div className="flex justify-between items-center border-b border-border/50 pb-3">
                              <span className="text-content-muted uppercase tracking-widest text-[9px]">Lifecycle Status</span>
                              <p className={`font-black uppercase tracking-tighter ${user.status === 'active' ? 'text-emerald-500' : 'text-amber-500'}`}>{user.status}</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-content-muted uppercase tracking-widest text-[9px]">Reporting To</span>
                              <p className="text-content-main font-black italic text-sky-500/80">{user.manager?.full_name || 'Direct to Board'}</p>
                            </div>
                         </div>
                      </div>
                    </div>

                    <div className="bg-sky-500/5 p-8 rounded-[2.5rem] border border-sky-500/10">
                       <h3 className="text-xl font-black text-content-main mb-6 flex items-center gap-3">
                         <Activity className="w-5 h-5 text-sky-500" /> Recent Pulse Log
                       </h3>
                       <div className="space-y-3">
                          {!stats?.attendanceLogs?.slice(0, 3).length ? (
                            <p className="text-[10px] font-black text-content-muted uppercase tracking-widest text-center py-10 opacity-40">No Recent Cycles</p>
                          ) : (
                            stats.attendanceLogs.slice(0, 3).map((log) => (
                              <div key={log.id || log._id} className="flex items-center justify-between p-3.5 bg-white dark:bg-navy-950/50 rounded-2xl border border-border/50 group hover:border-sky-500/30 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <span className="text-[11px] font-black text-content-main">{log.date}</span>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-sky-500 opacity-80">{log.status}</span>
                              </div>
                            ))
                          )}
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Performance' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-black text-content-main tracking-tight">Active Operations Ledger</h3>
                      <span className="px-4 py-1.5 rounded-full bg-primary-muted/30 border border-border text-[10px] font-black uppercase tracking-widest text-content-muted">
                        Total Records: {stats?.recentTasks?.length || 0}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {(stats?.recentTasks?.length || 0) === 0 ? (
                        <div className="bg-primary-muted/20 rounded-[2rem] border border-border p-4 flex flex-col items-center justify-center py-20">
                          <ClipboardList className="w-12 h-12 text-content-muted opacity-20 mb-4" />
                          <p className="text-content-muted font-bold uppercase text-[10px] tracking-widest text-center">No Active Objectives Detected in Pipeline</p>
                        </div>
                      ) : (
                        stats.recentTasks.map(task => (
                          <div key={task.id || task._id} className="bg-primary-muted/10 p-6 rounded-[2rem] border border-border hover:border-sky-500/30 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-6">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${
                                task.status?.toLowerCase().includes('completed') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-sky-500/10 text-sky-500'
                              }`}>
                                {task.title?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-content-main font-black text-base tracking-tight mb-1">{task.title}</p>
                                <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest flex items-center gap-2">
                                  <span className={task.status?.toLowerCase().includes('completed') ? 'text-emerald-500' : 'text-sky-500'}>
                                    {task.status}
                                  </span>
                                  | Priority: {task.priority}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black uppercase tracking-widest text-content-muted mb-1 opacity-60">Due Transmission</p>
                              <p className="text-[11px] font-bold text-content-main">{task.due_date || 'Ongoing'}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'Attendance' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-black text-content-main tracking-tight">Transmission Pulse Frequency</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex p-1 bg-primary-muted rounded-xl border border-border shadow-inner">
                          <button 
                            onClick={() => setAttendanceViewMode('list')}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${attendanceViewMode === 'list' ? 'bg-white shadow-sm text-sky-500' : 'text-content-muted hover:text-content-main'}`}
                          >
                            Logs
                          </button>
                          <button 
                            onClick={() => setAttendanceViewMode('calendar')}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${attendanceViewMode === 'calendar' ? 'bg-white shadow-sm text-sky-500' : 'text-content-muted hover:text-content-main'}`}
                          >
                            Map
                          </button>
                        </div>
                        <button className="bg-sky-500 text-white font-black px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all">
                          Admin Audit
                        </button>
                      </div>
                    </div>
                    
                    <AnimatePresence mode="wait">
                      {attendanceViewMode === 'calendar' ? (
                        <motion.div 
                          key="calendar" 
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <AttendanceCalendar records={stats?.attendanceLogs || []} />
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="list" 
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, y: -10 }}
                          className="grid grid-cols-1 gap-3"
                        >
                          {(stats?.attendanceLogs?.length || 0) === 0 ? (
                            <div className="bg-primary-muted/20 rounded-[2rem] border border-border p-4 flex flex-col items-center justify-center py-20">
                              <Clock className="w-12 h-12 text-content-muted opacity-20 mb-4" />
                              <p className="text-content-muted font-bold uppercase text-[10px] tracking-widest text-center">No Transmission Cycles Registered</p>
                            </div>
                          ) : (
                            stats.attendanceLogs.map(log => (
                              <div key={log.id || log._id} className="bg-primary-muted/5 p-6 rounded-[2rem] border border-border/50 hover:bg-primary-muted/10 transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-6">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                    log.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                  }`}>
                                    <Calendar className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <p className="text-content-main font-black text-base tracking-tight mb-1">{log.date}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-content-muted">
                                      Status: <span className={log.status === 'Present' ? 'text-emerald-500' : 'text-amber-500 font-black'}>{log.status}</span>
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-8 text-right">
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-content-muted mb-1 opacity-60">Sync In</p>
                                    <p className="text-[11px] font-black text-content-main">{new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-content-muted mb-1 opacity-60">Sync Out</p>
                                    <p className="text-[11px] font-black text-content-main">{log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}</p>
                                  </div>
                                  <div className="w-12 h-12 rounded-xl bg-primary-muted/30 flex flex-col items-center justify-center">
                                    <p className="text-[8px] font-black text-content-muted leading-none mb-1">UNIT</p>
                                    <p className="text-[10px] font-black text-sky-500 leading-none">{log.workHours?.toFixed(1) || '0.0'}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {activeTab === 'Security' && (
                  <div className="space-y-8">
                    <h3 className="text-2xl font-black text-content-main">Kill-Switch Suite</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-rose-500/5 p-8 rounded-[2.5rem] border border-rose-500/20 group hover:bg-rose-500/10 transition-all">
                        <LogOut className="w-10 h-10 text-rose-500 mb-6" />
                        <h4 className="text-lg font-black text-content-main mb-2 tracking-tight">Force Terminal Invalidation</h4>
                        <p className="text-content-muted text-[11px] font-semibold mb-6">Immediately invalidates all active session tokens for this node across all interfaces.</p>
                        <button 
                          onClick={() => handleKillSwitch('logout')}
                          className="w-full py-4 rounded-2xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          Execute Force Logout
                        </button>
                      </div>

                      <div className="bg-amber-500/5 p-8 rounded-[2.5rem] border border-amber-500/20 group hover:bg-amber-500/10 transition-all">
                        <Lock className="w-10 h-10 text-amber-500 mb-6" />
                        <h4 className="text-lg font-black text-content-main mb-2 tracking-tight">Neural Freeze Loop</h4>
                        <p className="text-content-muted text-[11px] font-semibold mb-6">Suspends all operational capabilities for this node until HR intervention.</p>
                        <button 
                          onClick={() => handleKillSwitch(user.status === 'frozen' ? 'unfreeze' : 'freeze')}
                          className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg transition-all hover:scale-[1.02] active:scale-95 ${
                            user.status === 'frozen' 
                              ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                              : 'bg-amber-500 text-white shadow-amber-500/20'
                          }`}
                        >
                          {user.status === 'frozen' ? 'Initiate Unfreeze' : 'Initiate Freeze'}
                        </button>
                      </div>
                    </div>

                    <div className="bg-primary-muted/10 p-10 rounded-[3rem] border border-border flex items-center justify-between gap-8 mt-12">
                       <div className="flex items-center gap-6">
                          <CheckCircle2 className="w-10 h-10 text-sky-500" />
                          <div>
                            <p className="text-content-main font-black text-xl mb-1 tracking-tight">Access Impersonation</p>
                            <p className="text-content-muted text-xs font-bold italic">Simulate dashboard perspective as this node.</p>
                          </div>
                       </div>
                       <button 
                         className="bg-primary-surface border border-border text-content-muted font-black px-10 py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] cursor-not-allowed opacity-40"
                         disabled
                       >
                         Stub: Operational Soon
                       </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <EditProfileModal 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={fullUser || user}
        onSave={handleAdminSave}
        isAdminView={true}
        isViewerAdmin={true}
        departments={departments}
      />
    </div>
  );
};

export default DossierModal;
