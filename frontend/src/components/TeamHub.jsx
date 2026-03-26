import React, { useState, useEffect, useMemo } from 'react';
import { 
    Users, Search, Radar, Clock, 
    Shield, Briefcase, Globe, Cpu, Landmark,
    Mail, Phone, Calendar, Info
} from 'lucide-react';
import apiClient from '../api/client';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { CardSkeleton } from './Skeleton';

const EmployeeCard = ({ employee }) => {
    const isClockedIn = employee.status === 'Clocked In' || employee.status === 'Online';
    const initials = employee.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';

    return (
        <div className="group relative bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-[2.5rem] p-8 hover:border-sky-500/40 transition-all duration-500 shadow-sm hover:shadow-2xl overflow-hidden flex flex-col h-full">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-sky-500/10 transition-colors"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
                {/* Avatar Section */}
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-100 dark:bg-slate-700/50 border-4 border-white dark:border-slate-800 flex items-center justify-center text-3xl font-black text-slate-400 dark:text-slate-300 shadow-xl group-hover:scale-105 transition-transform duration-500">
                        {initials}
                    </div>
                    {isClockedIn && (
                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500 border-4 border-white dark:border-slate-800"></span>
                        </div>
                    )}
                </div>

                {/* Identity info */}
                <div className="space-y-1 mb-6 w-full">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none group-hover:text-sky-500 transition-colors truncate px-2">
                        {employee.full_name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        {employee.designation || employee.role}
                    </p>
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-2 gap-3 w-full mb-8">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col items-center">
                        <Briefcase className="w-3.5 h-3.5 text-sky-500 mb-2 opacity-60" />
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate w-full">
                            {employee.department_id?.name || 'General'}
                        </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col items-center">
                        <Clock className={`w-3.5 h-3.5 mb-2 opacity-60 ${isClockedIn ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <span className={`text-[9px] font-black uppercase tracking-widest truncate w-full ${isClockedIn ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {isClockedIn ? 'Operational' : 'Off-Grid'}
                        </span>
                    </div>
                </div>

                {/* Quick Contact Footer */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700/30 w-full flex justify-between items-center text-slate-400 group-hover:text-sky-500 transition-colors">
                    <div className="flex gap-4">
                        <Mail className="w-4 h-4 opacity-40 hover:opacity-100 cursor-pointer transition-opacity" title={employee.email} />
                        <Phone className="w-4 h-4 opacity-40 hover:opacity-100 cursor-pointer transition-opacity" title={employee.phone || 'No phone set'} />
                    </div>
                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[8px] font-black uppercase tracking-widest">
                        Node v{Math.floor(Math.random() * 9)}.{Math.floor(Math.random() * 9)}
                    </div>
                </div>
            </div>
        </div>
    );
};

function TeamHub() {
    const { user } = useAuth();
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTeam = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('organization/direct-reports');
            setTeam(response.data);
        } catch (err) {
            toast.error('Strategic Sync Failed: Could not retrieve team assets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const filteredTeam = useMemo(() => {
        return team.filter(member => 
            member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.designation?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [team, searchQuery]);

    const activeAssets = team.filter(m => m.status === 'Clocked In' || m.status === 'Online').length;

    return (
        <div className="p-6 lg:p-12 max-w-[1600px] mx-auto animate-fade-in pb-32">
            {/* Header Section */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500">Security Clearance: Manager</span>
                    </div>
                    <h2 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                        Strategic <span className="italic text-sky-500 underline decoration-sky-500/20 underline-offset-8">Team Hub.</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-lg tracking-tight max-w-xl">
                        A high-fidelity overview of your direct reports and their current operational status within the organization.
                    </p>
                </div>

                {/* Team Stats Summary */}
                <div className="flex bg-white/50 dark:bg-navy-950/30 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 gap-8 shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Assets</span>
                        <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">{team.length}</span>
                    </div>
                    <div className="w-px bg-slate-200 dark:bg-slate-800"></div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Now</span>
                        <span className="text-3xl font-black text-emerald-500 font-mono">{activeAssets}</span>
                    </div>
                </div>
            </header>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row gap-6 mb-12 items-center">
                <div className="relative group flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                    <input 
                        type="text"
                        placeholder="Scan for specific personnel..."
                        className="w-full bg-white dark:bg-navy-950/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] py-5 pl-14 pr-8 text-sm font-bold dark:text-white focus:ring-4 focus:ring-sky-500/5 outline-none transition-all shadow-xl dark:shadow-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-4 text-slate-400 px-6 py-4 bg-slate-100 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700/50">
                    <Info className="w-4 h-4 text-sky-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Read-only Perspective Active</span>
                </div>
            </div>

            {/* Personnel Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
                </div>
            ) : (
                <>
                    {filteredTeam.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                            {filteredTeam.map(employee => (
                                <EmployeeCard key={employee.id || employee._id} employee={employee} />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-20 text-center py-40 bg-slate-50 dark:bg-navy-950/20 rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-slate-800">
                            <Radar className="w-20 h-20 text-slate-300 dark:text-slate-700 animate-pulse mx-auto mb-8" />
                            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Negative Identification.</h3>
                            <p className="text-slate-500 font-bold mt-4 uppercase tracking-widest text-xs">Adjust your scanners and try again.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default TeamHub;
