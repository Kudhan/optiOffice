import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { 
  IconSettings, 
  IconClock, 
  IconCalendar, 
  IconZap, 
  IconShield, 
  IconCheck, 
  IconAlertCircle,
  IconPlus,
  IconTrash
} from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [org, setOrg] = useState(null);
  const [config, setConfig] = useState({
    workingHours: { start: '09:00', end: '18:00' },
    weeklyOffs: [0, 6],
    lateThreshold: 15,
    leaveClassifications: ['EL', 'SL', 'CL', 'PL']
  });

  const [newLeaveType, setNewLeaveType] = useState({ title: '', code: '', days: '', isDeductible: true });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await apiClient.get('/organization');
      const organization = data[0];
      setOrg(organization);
      if (organization.configuration) {
        setConfig(organization.configuration);
      }
    } catch (error) {
       toast.error('Tactical Error: Failed to retrieve system parameters.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/organization/${org.id}`, {
        configuration: config
      });
      toast.success('System Configuration Synchronized');
    } catch (error) {
      toast.error('Sync Refused: Authorization or Network Failure.');
    } finally {
      setSaving(false);
    }
  };

  const toggleWeeklyOff = (day) => {
    const updated = config.weeklyOffs.includes(day)
      ? config.weeklyOffs.filter(d => d !== day)
      : [...config.weeklyOffs, day].sort();
    setConfig({ ...config, weeklyOffs: updated });
  };

  const addLeaveType = () => {
    const { title, code, days, isDeductible } = newLeaveType;
    if (!title.trim() || !code.trim()) return toast.error('Title and Code are mandatory.');
    
    const upperCode = code.trim().toUpperCase();
    if ((config.leaveClassifications || []).find(l => l.code === upperCode)) {
        return toast.error('Classification Code already exists.');
    }
    
    setConfig({
      ...config,
      leaveClassifications: [...(config.leaveClassifications || []), { 
        title: title.trim(), 
        code: upperCode, 
        days: parseInt(days) || 0,
        isDeductible
      }]
    });
    setNewLeaveType({ title: '', code: '', days: '', isDeductible: true });
  };

  const removeLeaveType = (code) => {
    setConfig({
      ...config,
      leaveClassifications: config.leaveClassifications.filter(l => l.code !== code)
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
          <p className="text-content-muted font-bold tracking-widest text-xs uppercase">Initializing Configuration Nodes...</p>
        </div>
      </div>
    );
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <div>
          <h1 className="text-4xl font-black text-content-main tracking-tight flex items-center gap-3">
            <IconSettings className="w-10 h-10 text-sky-500" />
            Project Settings
          </h1>
          <p className="text-content-muted font-medium mt-1">Configure global organizational protocols and operational thresholds.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-sky-600 hover:bg-sky-500 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-sky-600/20 hover:shadow-sky-500/40 transition-all active:scale-95 flex items-center gap-2 group disabled:opacity-50"
        >
          {saving ? 'Syncing...' : (
            <>
              <IconCheck className="w-4 h-4 group-hover:scale-125 transition-transform" />
              Save Configuration
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Work Hours & Late Threshold */}
        <section className="bg-primary-surface border border-border rounded-[2.5rem] p-8 shadow-2xl space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-500">
              <IconClock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-content-main">Standard Work Duration</h3>
              <p className="text-xs text-content-muted font-bold uppercase tracking-wider">Target Operational Hours</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-content-main">Expected Daily Hours</h4>
                <p className="text-xs text-content-muted font-medium">Global target for personnel without fixed shifts.</p>
              </div>
              <span className="text-2xl font-black text-sky-500">{config.expectedHours || 8}h</span>
            </div>
            <div className="relative group/hours max-w-[200px]">
                <input 
                  type="number" 
                  min="1"
                  max="24"
                  step="0.5"
                  value={config.expectedHours || 8}
                  onChange={(e) => setConfig({ ...config, expectedHours: parseFloat(e.target.value) })}
                  className="w-full bg-primary border border-border rounded-xl px-4 py-3 text-content-main font-bold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-sky-500 uppercase">Hrs / Day</span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-content-main">Late Mark Threshold</h4>
                <p className="text-xs text-content-muted font-medium">Global grace period allowed after shift start (in minutes).</p>
              </div>
              <span className="text-2xl font-black text-sky-500">{config.lateThreshold || 0}m</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="120" 
              step="5"
              value={config.lateThreshold || 0}
              onChange={(e) => setConfig({ ...config, lateThreshold: parseInt(e.target.value) })}
              className="w-full h-2 bg-primary rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-content-muted px-1">
              <span>Strict (0m)</span>
              <span>Generous (120m)</span>
            </div>
          </div>

          <div className="bg-sky-500/5 border border-sky-500/10 p-4 rounded-2xl flex gap-3 mt-4">
            <IconAlertCircle className="w-5 h-5 text-sky-500 shrink-0" />
            <p className="text-[11px] font-bold text-sky-600/80 leading-relaxed">
              Timings are managed via **Shifts**. This threshold sets the default grace period for all shifts unless specified otherwise.
            </p>
          </div>
        </section>

        {/* Weekly Off Protocols */}
        <section className="bg-primary-surface border border-border rounded-[2.5rem] p-8 shadow-2xl space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
              <IconCalendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-content-main">Weekly Off Protocol</h3>
              <p className="text-xs text-content-muted font-bold uppercase tracking-wider">Fixed Non-Working Days</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {days.map((day, idx) => {
              const isActive = config.weeklyOffs.includes(idx);
              return (
                <button
                  key={day}
                  onClick={() => toggleWeeklyOff(idx)}
                  className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    isActive 
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                      : 'bg-primary border border-border text-content-muted hover:border-amber-500/50'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex gap-3">
            <IconAlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[11px] font-bold text-amber-600/80 leading-relaxed">
              Personnel clock-ins will be automatically blocked or flagged on weekends based on these selections. This acts as the global safety relay unless a shift overrides.
            </p>
          </div>
        </section>

        {/* Leave Classification Management */}
        <section className="bg-primary-surface border border-border rounded-[2.5rem] p-8 shadow-2xl space-y-8 lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
              <IconZap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-content-main">Leave Classifications</h3>
              <p className="text-xs text-content-muted font-bold uppercase tracking-wider">Manage system-wide leave categories</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3 p-6 bg-primary rounded-3xl border border-border shadow-inner space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-content-muted ml-1">Leave Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Marriage Leave"
                    value={newLeaveType.title}
                    onChange={(e) => setNewLeaveType({ ...newLeaveType, title: e.target.value })}
                    className="w-full bg-primary-surface border border-border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-content-muted ml-1">Code</label>
                    <input 
                      type="text" 
                      placeholder="e.g. ML"
                      value={newLeaveType.code}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, code: e.target.value })}
                      className="w-full bg-primary-surface border border-border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-[10px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-content-muted ml-1">Days (Annual)</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={newLeaveType.days}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, days: e.target.value })}
                      className="w-full bg-primary-surface border border-border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group bg-primary-surface/50 p-4 rounded-xl border border-dashed border-border hover:border-sky-500/50 transition-all">
                  <div className="relative">
                    <input 
                      type="checkbox"
                      checked={newLeaveType.isDeductible}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, isDeductible: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-sky-500 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-content-main leading-none mb-1">Deduct from Balance</p>
                    <p className="text-[8px] font-bold text-content-muted leading-tight">If off, usage won't affect PTO quota.</p>
                  </div>
                </label>

                <button 
                  onClick={addLeaveType}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 font-black text-[10px] uppercase tracking-widest active:scale-95"
                >
                  <IconPlus className="w-4 h-4" />
                  Define Classification
                </button>
              </div>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                  {(config.leaveClassifications || []).map((type) => (
                    <motion.div
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      key={type.code}
                      className="group relative bg-primary-muted border-2 border-border rounded-[1.5rem] p-5 flex items-center gap-4 hover:border-indigo-500 transition-all cursor-default"
                    >
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-500 font-black text-xs shadow-sm shadow-indigo-500/5">
                        {type.code}
                      </div>
                       <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-black text-content-main uppercase truncate">{type.title}</h5>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] font-black text-sky-500">{type.days} <span className="opacity-50 tracking-tight">Days / Yr</span></p>
                            {type.isDeductible === false && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[7px] font-black uppercase tracking-widest border border-amber-500/20">
                                Duty Only
                              </span>
                            )}
                          </div>
                       </div>
                      
                      <button 
                        onClick={() => removeLeaveType(type.code)}
                        className="opacity-0 group-hover:opacity-100 w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center transition-all hover:bg-rose-500 hover:text-white"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {(!config.leaveClassifications || config.leaveClassifications.length === 0) && (
                <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3 py-10">
                  <IconAlertCircle className="w-10 h-10" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No Classifications Defined</p>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>

    </div>
  );
};

export default GlobalSettings;
