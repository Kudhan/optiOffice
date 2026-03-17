import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

// Framer Motion is not in package.json, so I will implement a custom animated component using pure CSS transitions or simple React state.
// Since I cannot install new packages, I'll use standard CSS classes for animations.

function UserCard({ node, isRoot, onToggle, isExpanded }) {
  const hasChildren = node.children && node.children.length > 0;
  
  return (
    <div className={`relative flex flex-col items-center min-w-[280px] p-1 transition-all duration-500`}>
      {/* Connection Line (Top) */}
      {!isRoot && <div className="w-px h-8 bg-slate-700/50 mb-4" />}
      
      <div 
        onClick={() => hasChildren && onToggle(node.id)}
        className={`
          group relative w-full p-5 rounded-3xl cursor-pointer
          backdrop-blur-xl border transition-all duration-300
          ${isRoot 
            ? 'bg-indigo-500/10 border-indigo-500/40 shadow-[0_0_20px_-5px_rgba(79,70,229,0.4)]' 
            : 'bg-slate-800/40 border-slate-700/50 hover:border-sky-500/50 hover:bg-slate-800/60 shadow-xl'
          }
        `}
      >
        <div className="flex items-center gap-4">
          <div className={`
            w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black
            ${isRoot ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-sky-400'}
            transition-transform group-hover:scale-110 duration-300
          `}>
            {node.full_name?.charAt(0) || 'U'}
          </div>
          
          <div className="flex-1">
            <h3 className="text-slate-100 font-bold tracking-tight leading-none mb-1 text-base">
              {node.full_name}
            </h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              {node.designation || node.role}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase">
                {node.departmentName || 'General'}
              </span>
            </div>
          </div>

          {hasChildren && (
            <div className={`
              w-6 h-6 rounded-lg flex items-center justify-center border border-slate-700/50
              ${isExpanded ? 'bg-slate-700 text-white' : 'text-slate-500 group-hover:text-white'}
              transition-all duration-300
            `}>
              {isExpanded ? '−' : '+'}
            </div>
          )}
        </div>
        
        {/* Subtle Glow interaction */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>

      {/* Children Connection Line (Bottom) */}
      {hasChildren && isExpanded && <div className="w-px h-8 bg-slate-700/50" />}
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
        <div className="relative flex gap-12 items-start pt-4">
          {/* Horizontal Connection Line */}
          {node.children.length > 1 && (
            <div className="absolute top-0 left-[50%] -translate-x-1/2 h-px bg-slate-700/50" style={{ width: `calc(100% - 280px)` }} />
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
  const [activeTab, setActiveTab] = useState('tree'); // 'tree' or 'departments'
  const [deptStats, setDeptStats] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await apiClient.get('organization/tree');
      setTreeData(response.data);
      
      // Auto-expand root nodes
      const initialExpanded = {};
      response.data.forEach(node => initialExpanded[node.id] = true);
      setExpandedNodes(initialExpanded);
      
      // Calculate Dept Stats
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

  if (isLoading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-bold tracking-widest text-xs uppercase">Loading Authority Matrix...</p>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-[1600px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end mb-16">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
            Organization <span className="text-sky-500 italic">Hierarchy</span>
          </h1>
          <p className="text-slate-500 font-bold max-w-xl">
            Visualize the reporting structure and authority chains across your entire organization with real-time department analytics.
          </p>
        </div>

        <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-slate-700/50">
          <button 
            onClick={() => setActiveTab('tree')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'tree' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Tree View
          </button>
          <button 
            onClick={() => setActiveTab('departments')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'departments' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Dept Stats
          </button>
        </div>
      </div>

      {activeTab === 'tree' ? (
        <div className="overflow-x-auto pb-20 scrollbar-hide">
          <div className="flex flex-col items-center min-w-max pb-10">
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(deptStats).map(([name, stat]) => (
            <div key={name} className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-8 rounded-[2rem] hover:border-emerald-500/30 transition-all group">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-4 block">Department Matrix</span>
              <h3 className="text-2xl font-black text-white mb-6 group-hover:text-emerald-400 transition-colors">{name}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs font-bold text-slate-500 mb-1">Total Members</p>
                  <p className="text-2xl font-black text-white font-mono tracking-tighter">{stat.members}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs font-bold text-slate-500 mb-1">Leadership</p>
                  <p className="text-2xl font-black text-white font-mono tracking-tighter">{stat.managers}</p>
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
