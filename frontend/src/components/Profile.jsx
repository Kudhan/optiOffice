import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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

const BentoCard = ({ children, className = "" }) => (
    <div className={`p-8 bg-primary-surface border border-border rounded-[2.5rem] shadow-sm relative overflow-hidden ${className}`}>
        <div className="relative z-10 h-full">{children}</div>
    </div>
);

const StatWidget = ({ icon: Icon, label, value, subValue, colorClass }) => (
    <BentoCard className="flex flex-col h-full">
        <div className={`p-3 rounded-2xl w-fit ${colorClass}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div className="mt-8">
            <h4 className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] mb-2 leading-none opacity-60">{label}</h4>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-content-main tracking-tighter leading-none">{value}</span>
                {subValue && <span className="text-[10px] font-bold text-content-muted uppercase tracking-tight opacity-50">{subValue}</span>}
            </div>
        </div>
        <div className="mt-auto pt-6">
            <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                    style={{ width: typeof value === 'string' && value.includes('%') ? value : '60%' }}
                    className={`h-full ${colorClass.split(' ')[1].replace('text-', 'bg-')}`}
                />
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

  const rawId = id === "undefined" ? undefined : id;
  const targetId = rawId || currentUser?.id || currentUser?._id;
  const isOwnProfile = (currentUser?.id === targetId) || (currentUser?._id === targetId) || !rawId;
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (targetId && targetId !== "undefined") {
        fetchProfileData();
    }
  }, [targetId]);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('edit') === 'true' && profileData) {
        setIsModalOpen(true);
    }
  }, [location.search, profileData]);

  const fetchProfileData = async () => {
    if (!targetId || targetId === "undefined") return;
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
        await apiClient.put('users/profile', { ...formData, userId: targetId });
        toast.success("Identity Re-synchronized");
        fetchProfileData();
    } catch (err) {
    }
  };

  if (isLoading) return <div className="p-10 text-content-muted font-bold tracking-widest text-center py-32 uppercase">Synchronizing Secure Uplink...</div>;
  if (!profileData) return <div className="p-10 text-center py-32 font-bold text-rose-500 uppercase tracking-widest">Identity record not found.</div>;

  const { user, hierarchy, stats, task_overview, recent_activity } = profileData;

  return (
    <>
      <div className="relative min-h-screen bg-primary-muted/10 pb-24 font-sans">
        <div className="p-6 lg:p-12 max-w-[1700px] mx-auto relative z-10 space-y-12">
          
          {/* HEADER BENTO */}
          <BentoCard className="!p-0 overflow-hidden border-border bg-primary-surface shadow-md">
            <div className="p-8 lg:p-20 flex flex-col lg:flex-row items-center gap-16 relative">
              <div className="relative shrink-0">
                <div className="w-48 h-48 lg:w-72 lg:h-72 bg-primary-surface rounded-[5rem] border-[8px] border-slate-100 dark:border-slate-800 flex items-center justify-center text-9xl font-black text-sky-500 relative z-10 overflow-hidden shadow-lg">
                  {user.profile_photo ? (
                    <img src={user.profile_photo} alt="" className="w-full h-full object-cover" />
                  ) : (user.full_name?.charAt(0) || 'U')}
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-emerald-500 rounded-3xl border-4 border-primary-surface z-20 flex items-center justify-center shadow-lg">
                  <IconZap className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="flex-1 text-center lg:text-left space-y-8">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                  <h1 className="text-5xl lg:text-8xl font-black text-content-main tracking-tighter leading-none">{user.full_name}</h1>
                  <span className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] border shadow-sm ${
                    user.role === 'admin' ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-sky-500 text-white border-sky-600'
                  }`}>
                    {user.role} PERSPECTIVE
                  </span>
                </div>
                <p className="max-w-4xl text-content-muted font-bold text-xl leading-relaxed italic opacity-80">
                  {user.bio || "Secure identity profile active. This operative is awaiting secondary briefing documentation."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-wrap items-center justify-center lg:justify-start gap-x-12 gap-y-6 pt-8 border-t border-border">
                  <div className="flex items-center gap-4 text-content-muted font-black text-xs uppercase tracking-[0.2em]">
                    <IconMail className="w-4 h-4 text-sky-500" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-4 text-content-muted font-black text-xs uppercase tracking-[0.2em]">
                    <IconBriefcase className="w-4 h-4 text-sky-500" />
                    {user.designation || 'Specialized Tactical Unit'}
                  </div>
                  <div className="flex items-center gap-4 text-content-muted font-black text-xs uppercase tracking-[0.2em]">
                    <span className="text-sky-500 font-black">TENURE:</span> {user.tenure || 'ACTIVE'}
                  </div>
                </div>
              </div>

              {(isOwnProfile || isAdmin) && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="lg:absolute top-12 right-12 p-6 bg-primary-surface border border-border rounded-[2.5rem] shadow-md hover:bg-primary-muted"
                >
                  <IconEdit className="w-7 h-7 text-content-muted" />
                </button>
              )}
            </div>
          </BentoCard>

          <div className="grid grid-cols-12 gap-10 lg:gap-16">
            <div className="col-span-12 lg:col-span-4 space-y-12">
              <BentoCard>
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-[11px] font-black text-content-muted uppercase tracking-[0.3em] opacity-60">Structural Location</h3>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                </div>
                <div className="space-y-10">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl shadow-sm">
                      <IconShield className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-content-muted uppercase tracking-[0.25em] opacity-60">Division</p>
                      <p className="text-lg font-black text-content-main tracking-tight uppercase leading-none mt-2">{user.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl shadow-sm">
                      <IconUsers className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-content-muted uppercase tracking-[0.25em] opacity-60">Reporting Authority</p>
                      <p className="text-lg font-black text-content-main tracking-tight uppercase leading-none mt-2">{hierarchy.manager?.full_name || 'Central Command'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-sky-500/10 text-sky-500 rounded-2xl shadow-sm">
                      <IconClock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-content-muted uppercase tracking-[0.25em] opacity-60">Protocol Status</p>
                      <span className="inline-flex items-center gap-3 text-lg font-black text-content-main tracking-tight uppercase leading-none mt-2">
                        {user.status}
                        <div className="w-2 h-2 rounded-full bg-sky-500" />
                      </span>
                    </div>
                  </div>
                </div>
              </BentoCard>

              <BentoCard>
                <h3 className="text-[11px] font-black text-content-muted uppercase tracking-[0.3em] mb-10 opacity-60">Chronological Activity</h3>
                <div className="space-y-8">
                  {recent_activity.length > 0 ? recent_activity.map((act, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full mt-2 shadow-sm ${act.type === 'attendance' ? 'bg-sky-500' : 'bg-emerald-500'}`} />
                        {i !== recent_activity.length - 1 && <div className="w-px flex-1 bg-border my-3 border-dashed" />}
                      </div>
                      <div className="pb-6">
                        <p className="text-sm font-black text-content-main uppercase tracking-tight leading-none">{act.title}</p>
                        <p className="text-xs font-bold text-content-muted mt-3 opacity-70 leading-relaxed">{act.description}</p>
                        <p className="text-[9px] font-black text-content-muted/30 mt-3 uppercase tracking-[0.2em]">{new Date(act.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                      <IconActivity className="w-12 h-12" />
                      <p className="text-xs font-black uppercase tracking-[0.3em]">Zero Activity Nodes</p>
                    </div>
                  )}
                </div>
              </BentoCard>
            </div>

            <div className="col-span-12 lg:col-span-8 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <StatWidget icon={IconZap} label="Work Velocity" value={`${stats.task_velocity}%`} subValue="LIFETIME" colorClass="bg-amber-500/10 text-amber-500" />
                <StatWidget icon={IconActivity} label="Punctuality" value={`${stats.punctuality_score}%`} subValue="CONSISTENCY" colorClass="bg-emerald-500/10 text-emerald-500" />
                <StatWidget icon={IconCalendar} label="Leave Nodes" value={user.leave_balance} subValue="UNLOCKED" colorClass="bg-rose-500/10 text-rose-500" />
              </div>

              <BentoCard className="bg-primary-surface flex flex-col md:flex-row items-center justify-between p-10 lg:p-16 border-border shadow-md">
                <div className="space-y-6 text-center md:text-left">
                  <div className="p-4 bg-sky-500 rounded-[1.5rem] w-fit mx-auto md:mx-0 shadow-lg text-white">
                    <IconBriefcase className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-4xl lg:text-5xl font-black text-content-main tracking-tighter uppercase leading-none">Strategic Objectives</h3>
                    <p className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] mt-3 italic opacity-60">Real-time Tactical Pulse</p>
                  </div>
                </div>
                <div className="flex gap-16 lg:gap-28">
                  <div className="text-center relative">
                    <p className="text-6xl lg:text-9xl font-black text-sky-500 tracking-tighter leading-none">{task_overview.pending}</p>
                    <p className="text-[11px] font-black text-content-muted uppercase tracking-[0.25em] mt-4 opacity-60">Target Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-6xl lg:text-9xl font-black text-emerald-500 tracking-tighter leading-none">{task_overview.completed}</p>
                    <p className="text-[11px] font-black text-content-muted uppercase tracking-[0.25em] mt-4 opacity-60">Success Ops</p>
                  </div>
                </div>
              </BentoCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <BentoCard className="bg-primary-muted/20 border-dashed border-2 p-8 border-border relative overflow-hidden">
                  <h4 className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] mb-4 opacity-60">Efficiency Core</h4>
                  <p className="text-content-muted font-bold text-sm leading-relaxed italic relative z-10">
                    "Precision is the foundation of structural integrity. Every objective achieved strengthens the organization's mission profile."
                  </p>
                </BentoCard>
                <BentoCard className="bg-primary-muted/20 border-dashed border-2 p-8 border-border relative overflow-hidden">
                  <h4 className="text-[10px] font-black text-content-muted uppercase tracking-[0.3em] mb-4 opacity-60">Security Protocol</h4>
                  <p className="text-content-muted font-bold text-sm leading-relaxed italic relative z-10">
                    Access identity verified. Clearance: {user.role === 'admin' ? 'ALPHA-ONE EXECUTIVE' : 'GAMMA-NINER OPERATIVE'}. All interactions logged.
                  </p>
                </BentoCard>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EditProfileModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        onSave={handleUpdate}
        isAdminView={isAdmin && !isOwnProfile}
      />
    </>
  );
}

export default Profile;
