import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

// Framer Motion is not in package.json, so I will implement a custom animated component using pure CSS transitions or simple React state.
// Since I cannot install new packages, I'll use standard CSS classes for animations.

function UserCard({ node, isRoot, onToggle, isExpanded }) {
  const hasChildren = node.children && node.children.length > 0;
  
  return (
    <div className={`relative flex flex-col items-center min-w-[280px] p-2 transition-all duration-500`}>
      {/* Connection Line (Top) */}
      {!isRoot && <div className="w-px h-10 bg-slate-300 dark:bg-slate-700/50 mb-2" />}
      
      <div 
        onClick={() => hasChildren && onToggle(node.id)}
        className={`
          group relative w-full p-6 rounded-[2.5rem] cursor-pointer
          backdrop-blur-xl border transition-all duration-500
          ${isRoot 
            ? 'bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/30 shadow-[0_10px_30px_-10px_rgba(79,70,229,0.2)] dark:shadow-[0_0_20px_-5px_rgba(79,70,229,0.4)]' 
            : 'bg-white/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 hover:border-sky-500/40 hover:bg-white/90 dark:hover:bg-slate-800/60 shadow-sm dark:shadow-none'
          }
        `}
      >
        {/* Subtle radial glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-sky-500/10 transition-colors"></div>

        <div className="relative z-10 flex items-center gap-5">
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black
            ${isRoot ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-sky-500 dark:text-sky-400'}
            transition-all group-hover:scale-110 group-hover:rotate-3 duration-500 shadow-inner
          `}>
            {node.full_name?.charAt(0) || 'U'}
          </div>
          
          <div className="flex-1">
            <h3 className="text-slate-900 dark:text-white font-black tracking-tight leading-none mb-1.5 text-lg">
              {node.full_name}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.15em]">
              {node.designation || node.role}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/20">
                {node.departmentName || 'General'}
              </span>
            </div>
          </div>

          {hasChildren && (
            <div className={`
              w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-500
              ${isExpanded 
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent rotate-180' 
                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700/50 group-hover:border-sky-500 group-hover:text-sky-500'
              }
            `}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={isExpanded ? "M20 12H4" : "M12 4v16m8-8H4"} />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Children Connection Line (Bottom) */}
      {hasChildren && isExpanded && <div className="w-px h-10 bg-slate-300 dark:bg-slate-700/50" />}
    </div>
  );
}

function RecursiveTree({ node, expandedNodes, toggleNode, isRoot = false }) {
  const isExpanded = expandedNodes[node.id];
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <UserCard 
        node={node} 
        isRoot={isRoot} 
        onToggle={toggleNode} 
        isExpanded={isExpanded} 
      />
      
      {hasChildren && isExpanded && (
        <div className="relative flex gap-12 items-start pt-6">
          {/* Horizontal Connection Line */}
          {node.children.length > 1 && (
            <div className="absolute top-0 left-[50%] -translate-x-1/2 h-px bg-slate-300 dark:bg-slate-700/50" style={{ width: `calc(100% - 280px)` }} />
          )}
          
          {node.children.map(child => (
            <RecursiveTree 
              key={child.id} 
              node={child} 
              expandedNodes={expandedNodes} 
              toggleNode={toggleNode} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Hierarchy() {
  const [treeData, setTreeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [activeTab, setActiveTab] = useState('tree');
  const [deptStats, setDeptStats] = useState({});
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await apiClient.get('organization/tree');
      setTreeData(response.data);
      
      const initialExpanded = {};
      response.data.forEach(node => initialExpanded[node.id] = true);
      setExpandedNodes(initialExpanded);
      
      calculateStats(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to fetch hierarchy", err);
      setIsLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = {};
    const traverse = (nodes) => {
      nodes.forEach(node => {
        const dept = node.departmentName || 'General';
        if (!stats[dept]) stats[dept] = { members: 0, managers: 0 };
        stats[dept].members++;
        if (node.children?.length > 0) stats[dept].managers++;
        if (node.children) traverse(node.children);
      });
    };
    traverse(data);
    setDeptStats(stats);
  };

  const toggleNode = (id) => {
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleZoom = (type) => {
    if (type === 'in') setZoom(prev => Math.min(prev + 0.1, 1.5));
    if (type === 'out') setZoom(prev => Math.max(prev - 0.1, 0.5));
    if (type === 'reset') setZoom(1);
  };

  if (isLoading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin border-4 border-sky-500 border-t-transparent rounded-full w-16 h-16 shadow-[0_0_20px_rgba(14,165,233,0.3)]"></div>
        <p className="mt-8 text-slate-500 font-black tracking-[0.2em] text-[10px] uppercase">Mapping Authority Matrix</p>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-[1600px] mx-auto animate-in fade-in duration-700 space-y-12 relative">
      {/* Header aligned with Roles.jsx */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">Authority Structure.</h2>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Visualize reporting lines and department logistics</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <button 
            onClick={() => setActiveTab('tree')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'tree' ? 'bg-sky-500 text-white shadow-[0_5px_15px_rgba(14,165,233,0.3)]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Visual Tree
          </button>
          <button 
            onClick={() => setActiveTab('departments')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'departments' ? 'bg-sky-500 text-white shadow-[0_5px_15px_rgba(14,165,233,0.3)]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Dept Matrix
          </button>
        </div>
      </header>

      {activeTab === 'tree' ? (
        <div className="relative group/hierarchy">
          {/* Zoom Controls */}
          <div className="absolute top-0 right-0 z-20 flex flex-col gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl opacity-0 group-hover/hierarchy:opacity-100 transition-opacity duration-500">
            <button 
              onClick={() => handleZoom('in')}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white transition-all text-slate-600 dark:text-slate-400"
              title="Zoom In"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            </button>
            <button 
              onClick={() => handleZoom('reset')}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white transition-all text-[10px] font-black"
              title="Reset Zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button 
              onClick={() => handleZoom('out')}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white transition-all text-slate-600 dark:text-slate-400"
              title="Zoom Out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" /></svg>
            </button>
          </div>

          <div 
            className="overflow-x-auto pb-24 scrollbar-hide mask-fade-edges"
            style={{ minHeight: '600px' }}
          >
            <div 
              className="flex flex-col items-center min-w-max pb-10 transition-transform duration-500 ease-out origin-top"
              style={{ transform: `scale(${zoom})` }}
            >
              {treeData.map(rootNode => (
                <RecursiveTree 
                  key={rootNode.id} 
                  node={rootNode} 
                  expandedNodes={expandedNodes} 
                  toggleNode={toggleNode} 
                  isRoot={true}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(deptStats).map(([name, stat]) => (
            <div key={name} className="group relative bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-[2.5rem] p-10 hover:border-sky-500/30 transition-all duration-500 overflow-hidden shadow-sm dark:shadow-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-sky-500/10 transition-colors"></div>
              
              <div className="relative z-10 space-y-8">
                <div>
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-6 inline-block">
                    Department Unit
                  </span>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-bold tracking-tight uppercase tracking-[0.1em]">Functional Cluster Analytics</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors group-hover:bg-white dark:group-hover:bg-slate-900">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Workspace Members</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">{stat.members}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors group-hover:bg-white dark:group-hover:bg-slate-900">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Leadership Nodes</p>
                    <p className="text-4xl font-black text-sky-500 font-mono tracking-tighter">{stat.managers}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-700/30 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Operational Status: Active</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Hierarchy;
