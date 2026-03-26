import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  User, 
  X, 
  Shield,
  Monitor,
  Smartphone,
  Box,
  Cpu,
  Database,
  Wrench as Tool,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Pagination = ({ meta, onPageChange }) => {
    if (!meta || meta.pages <= 1) return null;
    return (
        <div className="flex justify-between items-center px-8 py-6 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-700/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                indexing <span className="text-sky-500">{Math.min(meta.total, (meta.currentPage - 1) * meta.limit + 1)}-{Math.min(meta.total, meta.currentPage * meta.limit)}</span> of {meta.total} nodes
            </p>
            <div className="flex gap-2">
                <button 
                    disabled={meta.currentPage === 1}
                    onClick={() => onPageChange(meta.currentPage - 1)}
                    className="px-6 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:text-sky-500 transition-all shadow-sm"
                >
                    Prev
                </button>
                <button 
                    disabled={meta.currentPage >= meta.pages}
                    onClick={() => onPageChange(meta.currentPage + 1)}
                    className="px-6 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:text-sky-500 transition-all shadow-sm"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

const Assets = () => {
  const { isAdmin, isManager } = useAuth();
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1, limit: 12 });
  
  // UI State
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editData, setEditData] = useState(null);

  const [formData, setFormData] = useState({
    name: '', category: 'Electronics', type: '', serial_number: '',
    condition: 'New', status: 'Available', assigned_to: '', value: 0,
    description: '', purchaseDate: '', warrantyExpiry: ''
  });

  const categories = ['Electronics', 'Furniture', 'Infrastructure', 'Software', 'Vehicles', 'Other'];
  const statuses = ['Available', 'Assigned', 'Maintenance', 'Retired', 'Lost'];
  const conditions = ['New', 'Excellent', 'Good', 'Fair', 'Poor', 'Damaged'];

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page, limit: 12, search, category: categoryFilter, status: statusFilter
      });
      
      const [assetsRes, statsRes, usersRes] = await Promise.all([
        apiClient.get(`/assets?${queryParams}`),
        apiClient.get('/assets/stats'),
        apiClient.get('/users')
      ]);
      
      setAssets(assetsRes.data.data || []);
      setPagination(assetsRes.data.pagination || { total: 0, pages: 1, currentPage: 1, limit: 12 });
      setStats(statsRes.data);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error("Asset system link failure");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(1);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, categoryFilter, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await apiClient.put(`/assets/${editData.id}`, formData);
        toast.success("Asset configuration updated");
      } else {
        await apiClient.post('/assets', formData);
        toast.success("New asset node initialized");
      }
      setShowForm(false);
      setEditData(null);
      fetchData(pagination.currentPage);
    } catch (err) {
      const msg = err.response?.data?.detail || "Asset synchronization failed";
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Commencing decommissioning protocol. Confirm deletion?")) return;
    try {
      await apiClient.delete(`/assets/${id}`);
      toast.success("Asset decommissioned successfully");
      fetchData(pagination.currentPage);
    } catch (err) {
      toast.error("Decommissioning protocol failure");
    }
  };

  const openEdit = (asset) => {
    setEditData(asset);
    setFormData({
      ...asset,
      assigned_to: asset.assigned_to?.id || asset.assigned_to?._id || '',
      purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
      warrantyExpiry: asset.warrantyExpiry ? asset.warrantyExpiry.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditData(null);
    setFormData({
      name: '', category: 'Electronics', type: '', serial_number: '', 
      condition: 'New', status: 'Available', assigned_to: '', value: 0,
      description: '', purchaseDate: '', warrantyExpiry: ''
    });
    setShowForm(false);
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Electronics': return <Monitor className="w-5 h-5 text-sky-500" />;
      case 'Infrastructure': return <Database className="w-5 h-5 text-emerald-500" />;
      case 'Vehicles': return <Smartphone className="w-5 h-5 text-amber-500" />;
      case 'Software': return <Cpu className="w-5 h-5 text-indigo-500" />;
      case 'Furniture': return <Box className="w-5 h-5 text-orange-500" />;
      default: return <Tool className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Assigned': return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
      case 'Maintenance': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Retired': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-[1700px] mx-auto space-y-10 animate-fade-in flex flex-col min-h-screen">
      
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 shrink-0">
        <div className="space-y-2">
            <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">
                Asset <span className="text-sky-500 italic">Intelligence</span>
            </h2>
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/50 w-fit">
                <Shield className="w-3.5 h-3.5 text-sky-500" />
                <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.25em]">
                    Enterprise Resource Monitoring Hub
                </p>
            </div>
        </div>

        {isAdmin && (
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="w-full xl:w-auto bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-[0.2em] text-[10px]"
          >
            <Plus className="w-4 h-4" />
            Provision New Node
          </button>
        )}
      </div>

      {/* Bento Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">Total Inventory</p>
              <h4 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter relative z-10">{stats?.overview?.total || 0}</h4>
              <Package className="absolute top-6 right-6 w-12 h-12 text-slate-100 dark:text-slate-700 group-hover:text-sky-500/10 transition-colors" />
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">Active Deployment</p>
              <h4 className="text-4xl font-black text-sky-500 uppercase tracking-tighter relative z-10">{stats?.overview?.assigned || 0}</h4>
              <User className="absolute top-6 right-6 w-12 h-12 text-slate-100 dark:text-slate-700 group-hover:text-sky-500/10 transition-colors" />
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">Maintenance Required</p>
              <h4 className="text-4xl font-black text-amber-500 uppercase tracking-tighter relative z-10">{stats?.overview?.maintenance || 0}</h4>
              <Tool className="absolute top-6 right-6 w-12 h-12 text-slate-100 dark:text-slate-700 group-hover:text-amber-500/10 transition-colors" />
          </div>
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group text-white">
              <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1 relative z-10">Valuation Ledger (Total)</p>
              <h4 className="text-4xl font-black uppercase tracking-tighter relative z-10">
                ₹{(stats?.overview?.totalValue || 0).toLocaleString()}
              </h4>
              <Shield className="absolute top-6 right-6 w-12 h-12 text-white/5" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-sky-500/20 rounded-full blur-[60px] -mr-16 -mb-16" />
          </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search by Node Name, Serial, or Type..."
            className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl py-5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm focus:border-sky-500 transition-all"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm focus:border-sky-500 transition-all"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-[3rem] border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Node</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial Number</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status / Condition</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {loading ? (
                <tr>
                   <td colSpan="6" className="py-20 text-center animate-pulse uppercase tracking-[0.4em] text-[10px] font-black text-slate-400">Indexing Tactical Assets...</td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                   <td colSpan="6" className="py-20 text-center uppercase tracking-[0.4em] text-[10px] font-black text-slate-300">
                     {isAdmin ? "No Asset Nodes Found in current sector" : "No Assets Allocated to your Strategic Node"}
                   </td>
                </tr>
              ) : assets.map(asset => (
                <tr key={asset.id} className="group hover:bg-sky-500/5 transition-all">
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        {getCategoryIcon(asset.category)}
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{asset.name}</h5>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{asset.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{asset.category}</span>
                  </td>
                  <td className="px-8 py-7">
                    <code className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600">
                      {asset.serial_number || 'N/A: UNTRACKED'}
                    </code>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex flex-col gap-2">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit ${getStatusColor(asset.status)}`}>
                         {asset.status}
                       </span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight ml-1">
                         Condition: <span className="text-slate-600 dark:text-slate-300">{asset.condition}</span>
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    {asset.assigned_to ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500 text-[10px] font-black uppercase">
                          {asset.assigned_to.full_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight leading-none mb-1">{asset.assigned_to.full_name}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{asset.assigned_to.department || 'General'}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-slate-300 uppercase italic">Unassigned Node</span>
                    )}
                  </td>
                  <td className="px-8 py-7 text-right">
                    {isAdmin && (
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEdit(asset)} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-sky-500 hover:text-white transition-all shadow-sm">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(asset.id)} className="p-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination meta={pagination} onPageChange={fetchData} />
      </div>

      {/* Asset Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-xl bg-slate-900/60 transition-all overflow-y-auto">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] w-full max-w-5xl shadow-2xl relative overflow-hidden"
             >
                <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                          {editData ? 'Configure' : 'Provision'} <span className="text-sky-500">Asset Node</span>
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Operational Parameter Calibration</p>
                    </div>
                    <button onClick={() => setShowForm(false)} className="p-4 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-rose-500 hover:text-white transition-all shadow-inner">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-12 space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Identity / Name</label>
                        <input 
                          type="text" required
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:border-sky-500 transition-all font-bold text-sm"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Node-E7 (Admin Laptop)"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category Classification</label>
                        <select 
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:border-sky-500 transition-all font-black text-[10px] uppercase tracking-widest"
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hardware / software Type</label>
                        <input 
                          type="text" required
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:border-sky-500 transition-all font-bold text-sm"
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          placeholder="MacBook Pro M2"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Serial Number / Unique ID</label>
                        <input 
                          type="text"
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:border-sky-500 transition-all font-mono text-xs font-bold"
                          value={formData.serial_number}
                          onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                          placeholder="SN: OPTI-XXXX-XXXX"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Status</label>
                        <select 
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:border-sky-500 transition-all font-black text-[10px] uppercase tracking-widest"
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Condition Index</label>
                        <select 
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:border-sky-500 transition-all font-black text-[10px] uppercase tracking-widest"
                          value={formData.condition}
                          onChange={(e) => setFormData({...formData, condition: e.target.value})}
                        >
                          {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Personnel Assignment</label>
                        <select 
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:border-sky-500 transition-all font-black text-[10px] uppercase tracking-widest"
                          value={formData.assigned_to}
                          onChange={(e) => setFormData({...formData, assigned_to: e.target.value, status: e.target.value ? 'Assigned' : 'Available'})}
                        >
                          <option value="">Unassigned</option>
                          {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>)}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Value (₹)</label>
                        <input 
                          type="number"
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:border-sky-500 transition-all font-bold text-sm"
                          value={formData.value}
                          onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Purchase Date</label>
                        <input 
                          type="date"
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 outline-none focus:border-sky-500 transition-all font-bold text-sm"
                          value={formData.purchaseDate}
                          onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                        />
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Strategic Overlays / Notes</label>
                      <textarea 
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-3xl px-8 py-6 outline-none focus:border-sky-500 transition-all font-medium text-sm min-h-[120px]"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Add secondary operational parameters or notes..."
                      />
                   </div>

                   <div className="flex gap-4 pt-6">
                      <button 
                        type="button"
                        onClick={resetForm}
                        className="flex-1 py-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                      >
                        Abort Protocol
                      </button>
                      <button 
                        type="submit"
                        className="flex-[2] py-5 rounded-2xl bg-sky-500 text-white shadow-2xl shadow-sky-500/30 text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        {editData ? 'Broadcast Modification' : 'Initiate Provisioning'}
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Assets;
