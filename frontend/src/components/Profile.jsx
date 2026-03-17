import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import EditProfileModal from './EditProfileModal';
import { 
    IconUsers, 
    IconMail, 
    IconBriefcase, 
    IconShield, 
    IconClock,
    IconActivity,
    IconZap,
    IconEdit,
    IconCalendar
} from './Icons';

const BentoCard = ({ children, className = "", glowColor = "transparent" }) => (
    <div 
        style={{ '--glow-color': glowColor }}
        className={`p-8 bg-primary-surface border border-border rounded-[2.5rem] shadow-sm relative overflow-hidden group transition-all duration-500 hover:border-sky-500/30 ${className}`}
    >
        <div className="absolute -inset-24 bg-[radial-gradient(circle_at_center,var(--glow-color),transparent_70%)] opacity-0 group-hover:opacity-20 transition-opacity duration-1000 pointer-events-none"></div>
        <div className="relative z-10 h-full">{children}</div>
    </div>
);

const StatWidget = ({ icon: Icon, label, value, subValue, colorClass }) => (
    <BentoCard className="flex flex-col justify-between">
        <div className={`p-3 rounded-2xl w-fit ${colorClass}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div className="mt-8">
            <h4 className="text-[10px] font-black text-content-muted uppercase tracking-widest mb-1">{label}</h4>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-content-main tracking-tighter">{value}</span>
                {subValue && <span className="text-xs font-bold text-content-muted">{subValue}</span>}
            </div>
        </div>
    </BentoCard>
);

function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Determine whose profile we're looking at
  const targetId = id || currentUser?.id;
  const isOwnProfile = currentUser?.id === targetId;
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    fetchProfileData();
  }, [targetId]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`users/profile/${targetId}`);
      setProfileData(response.data);
    } catch (err) {
      console.error("Failed to fetch profile data", err);
      toast.error("Data stitching failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
        await apiClient.put('users/profile', formData);
        toast.success("Identity Re-synchronized");
        fetchProfileData();
    } catch (err) {
        // Handled by interceptor
    }
  };

  if (isLoading) return <div className="p-10 animate-pulse">Synchronizing Data...</div>;
  if (!profileData) return <div className="p-10">Identity record not found.</div>;

  const { user, hierarchy, stats, task_overview, recent_activity } = profileData;
  const roleGlow = user.role === 'admin' ? 'rgba(99,102,241,0.15)' : 'rgba(14,165,233,0.15)';

  return (
    <div className="p-10 max-w-[1500px] mx-auto animate-fade-in space-y-10 pb-24">
      
      {/* HEADER BENTO: Identity Core */}
      <BentoCard className="lg:col-span-12 !p-0 overflow-hidden border-sky-500/10">
        <div className="bg-gradient-to-br from-primary-muted to-primary-surface p-12 flex flex-col lg:flex-row items-center gap-12 relative">
            <div className="relative">
                <div className={`absolute -inset-8 blur-3xl opacity-40 rounded-full transition-all duration-1000`} style={{ backgroundColor: user.role === 'admin' ? '#6366f1' : '#0ea5e9' }}></div>
                <div className="w-48 h-48 bg-primary-surface rounded-[3rem] border-4 border-white dark:border-navy-900 shadow-2xl flex items-center justify-center text-7xl font-black text-sky-500 relative z-10 overflow-hidden">
                    {user.profile_photo ? (
                        <img src={user.profile_photo} alt="" className="w-full h-full object-cover" />
                    ) : (user.full_name?.charAt(0) || 'U')}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full border-4 border-primary-surface z-20 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
            </div>

            <div className="flex-1 text-center lg:text-left space-y-4">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                    <h1 className="text-5xl font-black text-content-main tracking-tighter">{user.full_name}</h1>
                    <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                        user.role === 'admin' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-sky-500/10 text-sky-500 border-sky-500/20'
                    }`}>
                        {user.role} CORE
                    </span>
                </div>
                <p className="max-w-2xl text-content-muted font-medium text-lg leading-relaxed italic">
                    {user.bio || "No professional overview provided. This identity operates within the global OptiOffice infrastructure."}
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2">
                    <div className="flex items-center gap-2 text-content-muted font-bold text-sm">
                        <IconMail className="w-4 h-4" /> {user.email}
                    </div>
                    <div className="flex items-center gap-2 text-content-muted font-bold text-sm">
                        <IconBriefcase className="w-4 h-4" /> {user.designation || 'Specialist'}
                    </div>
                    <div className="flex items-center gap-2 text-content-muted font-bold text-sm">
                        <span className="text-sky-500 font-black">TENURE:</span> {user.tenure || 'NEW'}
                    </div>
                </div>
            </div>

            {(isOwnProfile || isAdmin) && (
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="absolute top-10 right-10 p-4 bg-primary-surface border border-border rounded-3xl hover:border-sky-500 transition-all shadow-sm group"
                >
                    <IconEdit className="w-6 h-6 text-content-muted group-hover:text-sky-500" />
                </button>
            )}
        </div>
      </BentoCard>

      {/* MID SECTION: Identity Grid & Stats */}
      <div className="grid grid-cols-12 gap-10">
        
        {/* Identity Context */}
        <div className="col-span-12 lg:col-span-4 space-y-10">
            <BentoCard glowColor={roleGlow} title="Strategic Location">
                <h3 className="text-[10px] font-black text-content-muted uppercase tracking-widest mb-6">Structural Positioning</h3>
                <div className="space-y-8">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl"><IconShield className="w-6 h-6" /></div>
                        <div>
                            <p className="text-[10px] font-black text-content-muted uppercase tracking-widest">Department</p>
                            <p className="text-lg font-black text-content-main tracking-tight uppercase">{user.department}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl"><IconUsers className="w-6 h-6" /></div>
                        <div>
                            <p className="text-[10px] font-black text-content-muted uppercase tracking-widest">Reporting To</p>
                            <p className="text-lg font-black text-content-main tracking-tight uppercase">
                                {hierarchy.manager?.full_name || 'Central Systems'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-indigo-500/10 text-indigo-500 rounded-2xl"><IconClock className="w-6 h-6" /></div>
                        <div>
                            <p className="text-[10px] font-black text-content-muted uppercase tracking-widest">Global Status</p>
                            <span className="inline-flex items-center gap-2 text-lg font-black text-content-main tracking-tight">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                {user.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </BentoCard>

            <BentoCard glowColor={roleGlow}>
                <h3 className="text-[10px] font-black text-content-muted uppercase tracking-widest mb-6">Recent Activity Log</h3>
                <div className="space-y-6">
                    {recent_activity.length > 0 ? recent_activity.map((act, i) => (
                        <div key={i} className="flex gap-4 group">
                            <div className="flex flex-col items-center">
                                <div className={`w-2 h-2 rounded-full mt-1.5 ${act.type === 'attendance' ? 'bg-sky-500' : 'bg-emerald-500'}`}></div>
                                {i !== recent_activity.length - 1 && <div className="w-px flex-1 bg-border my-1"></div>}
                            </div>
                            <div className="pb-4">
                                <p className="text-xs font-black text-content-main uppercase tracking-tight group-hover:text-sky-500 transition-colors">{act.title}</p>
                                <p className="text-[10px] font-bold text-content-muted mt-0.5">{act.description}</p>
                                <p className="text-[10px] font-medium text-content-muted/60 mt-1 uppercase">{new Date(act.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-xs font-bold text-content-muted italic">No recent logs detected.</p>
                    )}
                </div>
            </BentoCard>
        </div>

        {/* High Impact Stats */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-10">
            <StatWidget 
                icon={IconZap}
                label="Work Velocity"
                value={`${stats.task_velocity}%`}
                subValue={`Efficiency`}
                colorClass="bg-amber-500/10 text-amber-500"
            />
            <StatWidget 
                icon={IconActivity}
                label="Punctuality"
                value={`${stats.punctuality_score}%`}
                subValue="Consistency"
                colorClass="bg-emerald-500/10 text-emerald-500"
            />
            <StatWidget 
                icon={IconCalendar}
                label="Time Off"
                value={user.leave_balance}
                subValue="Days Left"
                colorClass="bg-rose-500/10 text-rose-500"
            />

            <BentoCard className="md:col-span-3 h-full bg-gradient-to-r from-sky-500/5 to-transparent flex items-center justify-between">
                <div>
                   <h3 className="text-2xl font-black text-content-main tracking-tighter">Mission Overview</h3>
                   <p className="text-sm font-bold text-content-muted uppercase tracking-widest mt-1">Pending Strategic Objectives</p>
                </div>
                <div className="flex gap-12">
                   <div className="text-center">
                       <p className="text-4xl font-black text-sky-500">{task_overview.pending}</p>
                       <p className="text-[10px] font-black text-content-muted uppercase mt-1">ACTIVE</p>
                   </div>
                   <div className="text-center">
                       <p className="text-4xl font-black text-emerald-500">{task_overview.completed}</p>
                       <p className="text-[10px] font-black text-content-muted uppercase mt-1">DONE</p>
                   </div>
                </div>
            </BentoCard>
        </div>

      </div>

      <EditProfileModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        onSave={handleUpdate}
        isAdminView={isAdmin && !isOwnProfile}
      />
    </div>
  );
}

export default Profile;
