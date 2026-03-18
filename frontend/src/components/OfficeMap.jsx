import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { IconUsers, IconBriefcase, IconPlus, IconShield } from './Icons';

const OfficeMap = () => {
    const { isAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const mapRef = useRef(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [floorRes, deptRes] = await Promise.all([
                apiClient.get('office/floor-data'),
                apiClient.get('departments')
            ]);
            setUsers(floorRes.data);
            setDepartments(deptRes.data);
        } catch (err) {
            toast.error("Map Synchronization Failed 🛰️");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDragEnd = async (event, info, userId) => {
        if (!isAdmin || !mapRef.current) return;

        const rect = mapRef.current.getBoundingClientRect();
        const x = ((info.point.x - rect.left) / rect.width) * 100;
        const y = ((info.point.y - rect.top) / rect.height) * 100;

        // Constraint check
        if (x < 0 || x > 100 || y < 0 || y > 100) return;

        try {
            await apiClient.post('office/desks', {
                assignments: [{
                    userId,
                    desk: { x, y, floor: 1, seatNumber: "AUTO" }
                }]
            });
            toast.success("Desk Assigned 🛋️");
            fetchData();
        } catch (err) {}
    };

    const unassignedUsers = useMemo(() => 
        users.filter(u => (!u.desk || (u.desk.x === 0 && u.desk.y === 0))), 
    [users]);

    const assignedUsers = useMemo(() => 
        users.filter(u => u.desk && (u.desk.x !== 0 || u.desk.y !== 0)), 
    [users]);

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] overflow-hidden bg-primary p-4 gap-4 animate-fade-in">
            {/* Sidebar: Unassigned Assets */}
            <div className="w-full lg:w-80 bg-primary-surface rounded-[2.5rem] border border-border p-6 flex flex-col shadow-sm">
                <div className="mb-6">
                    <h3 className="text-xl font-black text-content-main tracking-tighter">Unassigned <span className="text-sky-500 italic">Personnel</span></h3>
                    <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest mt-1">Pending Deployment ({unassignedUsers.length})</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {unassignedUsers.map(u => (
                        <motion.div 
                            key={u._id}
                            drag={isAdmin}
                            dragConstraints={mapRef}
                            onDragEnd={(e, info) => handleDragEnd(e, info, u._id)}
                            className={`p-4 bg-primary-muted rounded-2xl border border-transparent hover:border-sky-500/30 transition-all flex items-center gap-4 cursor-grab active:cursor-grabbing group ${isAdmin ? '' : 'cursor-default'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center font-black text-sky-500 text-xs">
                                {u.full_name?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-black text-content-main truncate">{u.full_name}</p>
                                <p className="text-[9px] font-bold text-content-muted uppercase tracking-tight">{u.department || 'Float'}</p>
                            </div>
                            {isAdmin && <span className="ml-auto opacity-0 group-hover:opacity-100 text-[10px]">📍</span>}
                        </motion.div>
                    ))}
                    {unassignedUsers.length === 0 && (
                        <div className="text-center py-20 opacity-40">
                             <span className="text-4xl block mb-2">✅</span>
                             <p className="text-[10px] font-black uppercase">All Personnel Deployed</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Map: Interactive Floor */}
            <div className="flex-1 bg-primary-surface rounded-[3rem] border border-border relative overflow-hidden shadow-inner group/canvas" ref={mapRef}>
                {/* Visual Grid Layer */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                {/* Department Zones (Overlay Layer) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {departments.map(dept => dept.zone && dept.zone.length > 0 && (
                        <polygon 
                            key={dept.id}
                            points={dept.zone.map(p => `${p.x},${p.y}`).join(' ')}
                            fill={dept.name === 'Engineering' ? 'rgba(14, 165, 233, 0.05)' : 'rgba(168, 85, 247, 0.05)'}
                            stroke={dept.name === 'Engineering' ? 'rgba(14, 165, 233, 0.1)' : 'rgba(168, 85, 247, 0.1)'}
                            strokeWidth="2"
                            strokeDasharray="10 5"
                        />
                    ))}
                </svg>

                {/* Legend / Status */}
                <div className="absolute top-8 left-8 bg-white/50 dark:bg-navy-950/50 backdrop-blur-md p-6 rounded-3xl border border-border z-10">
                    <h4 className="text-xs font-black text-content-main uppercase tracking-widest mb-4">Floor Objective</h4>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-[10px] font-bold text-content-muted uppercase">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active Presence</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-content-muted uppercase">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span>System Offline</span>
                        </div>
                    </div>
                </div>

                {/* Deployed Avatars */}
                <AnimatePresence>
                    {assignedUsers.map(u => (
                        <motion.div
                            key={u._id}
                            layoutId={u._id}
                            initial={false}
                            drag={isAdmin}
                            dragMomentum={false}
                            onDragEnd={(e, info) => handleDragEnd(e, info, u._id)}
                            style={{ 
                                left: `${u.desk.x}%`, 
                                top: `${u.desk.y}%`, 
                                position: 'absolute',
                                transform: 'translate(-50%, -50%)' 
                            }}
                            className={`z-20 group/avatar cursor-grab active:cursor-grabbing hover:z-30 transition-transform hover:scale-110`}
                        >
                            <div className="relative">
                                {/* Pulse Effect for Online Users */}
                                {u.currentStatus === 'Clocked In' && (
                                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping -z-10" />
                                )}
                                
                                <div className={`w-12 h-12 rounded-full border-4 shadow-xl flex items-center justify-center font-black text-sm relative transition-all duration-300 ${
                                    u.currentStatus === 'Clocked In' 
                                    ? 'bg-white dark:bg-slate-800 border-emerald-500 text-slate-900 dark:text-white' 
                                    : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-400'
                                }`}>
                                    {u.full_name?.charAt(0)}

                                    {/* Tooltip on Hover */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-slate-900 text-white text-[9px] font-black rounded-lg opacity-0 group-hover/avatar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl uppercase tracking-tighter">
                                        {u.full_name} <span className="mx-1 opacity-40">•</span> {u.department || 'General'}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Admin Design Mode Badge */}
                {isAdmin && (
                    <div className="absolute bottom-8 right-8 bg-sky-500 text-white px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl animate-bounce">
                        Interactive Design Mode Active 🏗️
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfficeMap;
