import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Shield, Lock, CheckCircle2, XCircle, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import '../App.css'; // Corrected path

const SetupPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Password validation state
  const validationRules = [
    { label: 'Minimum 8 characters', test: (p) => p.length >= 8 },
    { label: 'At least one uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { label: 'At least one lowercase letter', test: (p) => /[a-z]/.test(p) },
    { label: 'At least one number', test: (p) => /\d/.test(p) },
    { label: 'At least one special character (@$!%*?&)', test: (p) => /[@$!%*?&]/.test(p) },
  ];

  const allRulesMet = validationRules.every(rule => rule.test(password));
  const passwordsMatch = password && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allRulesMet) {
      toast.error('Please meet all password requirements');
      return;
    }
    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/auth/setup-password', {
        token,
        password
      });

      if (response.data.success) {
        toast.success('Security Protocol Established! Redirecting to Login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to establish security protocol');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      
      <div className="max-w-md w-full px-6 py-12 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 mb-6 group">
            <Shield className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Setup Security Credentials</h1>
          <p className="text-gray-400 text-sm">Initialize your OptiFlow node by establishing a robust administrative password.</p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">New password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Confirm password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`block w-full pl-11 pr-4 py-3.5 bg-black/40 border rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all text-sm ${
                    passwordsMatch ? 'border-green-500/50 focus:ring-green-500/30' : 
                    confirmPassword ? 'border-red-500/50 focus:ring-red-500/30' : 'border-white/10 focus:ring-blue-500/50'
                  }`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Validation Checklist */}
            <div className="bg-black/20 rounded-2xl p-4 space-y-2.5 border border-white/5">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Requirements</div>
              {validationRules.map((rule, idx) => {
                const isMet = rule.test(password);
                return (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    {isMet ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-600 shrink-0" />
                    )}
                    <span className={isMet ? 'text-gray-300' : 'text-gray-500'}>{rule.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !allRulesMet || !passwordsMatch}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm tracking-wide transition-all shadow-lg ${
                loading || !allRulesMet || !passwordsMatch
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 active:scale-[0.98] border border-blue-400/20'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Initializating...
                </>
              ) : (
                <>
                  Activate Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <p className="mt-8 text-center text-[11px] text-gray-600 uppercase tracking-[0.2em]">
          Powered by OptiFlow Security Framework v2.4
        </p>
      </div>
    </div>
  );
};

export default SetupPassword;
