import React, { useState } from 'react';
import { 
    X, User, Shield, Zap, Search, 
    Radar, ShieldCheck, Mail, Cpu, LayoutGrid, 
    ChevronLeft, ChevronRight
} from 'lucide-react';

const DeptScopeModal = ({ isOpen, onClose, department, users }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  if (!isOpen || !department) return null;

  // Filter Logic
  const filteredUsers = users.filter(u => 
    (String(u.department_id) === String(department.id || department._id) || u.department === department.name) &&
    (u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.username?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  return (
    <div className="fixed inset-0 z-[110] flex justify-center items-start pt-20 p-4">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-xl animate-fade-in" onClick={onClose} />
      
      {/* Container - Reduced width and padding for a 'compact' look */}
      <div className="bg-white dark:bg-navy-950 w-full max-w-4xl rounded-[3rem] shadow-[0_0_100px_-20px_rgba(14,165,233,0.3)] border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col relative animate-scale-in">
        
        {/* Header - Compact */}
        <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-sky-500/5 to-indigo-500/10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 border border-sky-500/20 shadow-inner">
                  <Radar className="w-7 h-7 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                        Scope <span className="text-sky-500 underline decoration-sky-500/20 underline-offset-4">Inspection</span>
                    </h2>
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Unit: {department.name}</p>
                </div>
            </div>
            <button 
                onClick={onClose} 
                className="p-3.5 rounded-2xl bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-black text-[8px] uppercase tracking-widest flex items-center gap-2 group border border-rose-500/10"
            >
              <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
              Exit [ESC]
            </button>
          </div>
          
          <div className="flex items-center gap-6 pl-1">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Total: <span className="text-slate-900 dark:text-white">{filteredUsers.length}</span></span>
            </div>
            <div className="h-3 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Security Status: <span className="text-emerald-500">Verified</span></span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6 flex-1 overflow-hidden flex flex-col bg-slate-50/30 dark:bg-navy-950/20">
          {/* Search - Smaller */}
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            <input 
              type="text"
              placeholder="Query Personnel Intelligence..."
              className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 focus:border-sky-500/30 rounded-2xl py-4 pl-14 pr-8 text-xs font-bold text-slate-900 dark:text-white shadow-xl focus:ring-4 focus:ring-sky-500/5 outline-none transition-all placeholder:text-slate-400/50"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          {/* Personnel Ledger Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
            {paginatedUsers.length === 0 ? (
              <div className="py-20 text-center rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800/40 bg-white/50 dark:bg-transparent">
                <Cpu className="w-12 h-12 text-slate-200 dark:text-slate-800 animate-bounce mx-auto mb-4" />
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] opacity-40">Zero Results In This Scope</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paginatedUsers.map(user => (
                  <div key={user.id || user._id} className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-sky-500/40 hover:shadow-xl transition-all flex items-center gap-5 group shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-lg text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-all transform group-hover:scale-105 shadow-inner">
                      {(user.full_name || '??').charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 dark:text-white font-black text-sm tracking-tighter leading-none mb-1.5">{user.full_name}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[8px] font-black text-sky-500 uppercase tracking-widest bg-sky-500/5 px-2 py-0.5 rounded-md">@{user.username}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-2 py-0.5 rounded-md italic">{user.role}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 text-right">
                        <div className={`px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest border ${
                          user.status === 'active' || user.status === 'Active' || user.status === 'Clocked In' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {user.status || 'Active'}
                        </div>
                        <p className="text-[7px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">ID: {String(user.id || user._id).substring(0, 6)}</p>
                    </div>
                  </div>
                ))}
            </div>
            )}
          </div>
        </div>

        {/* Footer Bar - With Pagination */}
        <div className="px-8 py-5 bg-slate-50 dark:bg-navy-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-navy-950">
            <div className="flex items-center gap-3">
                <button 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-slate-500"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <span className="text-[10px] font-black text-sky-500">{currentPage}</span>
                    <span className="text-[10px] font-black text-slate-300 dark:text-slate-600">/</span>
                    <span className="text-[10px] font-black text-slate-500">{totalPages || 1}</span>
                </div>
                <button 
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-slate-500"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
            <div className="flex items-center gap-4">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] hidden sm:block">Structural Ledger v3.2</p>
                <div className="flex items-center gap-3 opacity-30">
                    <LayoutGrid className="w-3.5 h-3.5 text-sky-500" />
                    <Shield className="w-3.5 h-3.5 text-sky-500" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DeptScopeModal;
