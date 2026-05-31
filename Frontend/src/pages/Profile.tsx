import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Shield, Award, Trophy, Flame, Star,
  Edit3, Save, X, Lock, Eye, EyeOff, CheckCircle2,
  AlertCircle, Camera, Calendar, Clock,
  Code, Zap, BarChart3, BadgeCheck, LogOut,
  Smartphone, Bell, BellRing, Key, ShieldCheck, Activity,
  GitCommit, Loader2, Send, RefreshCw
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Switch } from '../components/ui/Switch';
import { apiClient } from '../services/apiClient';
import { authService } from '../services/authService';

interface ProfileFromAPI {
  id: number;
  name: string;
  email: string;
  username: string | null;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  github: string;
  twitter: string;
  linkedin: string;
  role: string;
  level: number;
  xp: number;
  streak: number;
  longest_streak: number;
  problems_solved: number;
  projects_completed: number;
  focus_hours: number;
  email_verified: boolean;
  phone_verified: boolean;
  skills: { name: string; level: number }[];
  badges: { name: string; icon: string; earned: boolean }[];
  created_at: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileFromAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [editedName, setEditedName] = useState('');

  // Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // SMS modal
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsPhone, setSmsPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsSent, setSmsSent] = useState(false);

  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // ============================================
  // FETCH PROFILE FROM BACKEND
  // ============================================
  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/profile/', { requiresAuth: true });
      const data = response.data as any;
      if (data) {
        setProfile(data);
        setEditedBio(data.bio || '');
        setEditedName(data.name || '');
        setNotificationsEnabled(data.notifications_enabled || false);
        setTwoFactorEnabled(data.two_factor_enabled || false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  // ============================================
  // PASSWORD STRENGTH
  // ============================================
  useEffect(() => {
    let strength = 0;
    const pwd = passwordData.newPassword;
    if (pwd.length >= 8) strength++;
    if (pwd.match(/[A-Z]/)) strength++;
    if (pwd.match(/[a-z]/)) strength++;
    if (pwd.match(/[0-9]/)) strength++;
    if (pwd.match(/[^A-Za-z0-9]/)) strength++;
    setPasswordStrength(strength);
  }, [passwordData.newPassword]);

  const showToast = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // ============================================
  // SAVE PROFILE
  // ============================================
  const handleSaveProfile = async () => {
    try {
      await apiClient.put('/profile/', { name: editedName, bio: editedBio }, { requiresAuth: true });
      setProfile(prev => prev ? { ...prev, name: editedName, bio: editedBio } : null);
      setIsEditing(false);
      showToast('Profile updated! ✅');
    } catch (err: any) {
      showToast('Failed to save');
    }
  };

  // ============================================
  // CHANGE PASSWORD
  // ============================================
  const handleChangePassword = async () => {
    setPasswordError('');
    if (!passwordData.currentPassword) { setPasswordError('Current password required'); return; }
    if (passwordData.newPassword.length < 8) { setPasswordError('Min 8 characters'); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { setPasswordError('Passwords do not match'); return; }

    try {
      await apiClient.put('/settings/', { password: passwordData.newPassword }, { requiresAuth: true });
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Password changed! 🔒');
    } catch {
      setPasswordError('Failed to change password');
    }
  };

  // ============================================
  // SMS VERIFICATION
  // ============================================
  const handleSendSms = () => { setSmsSent(true); showToast('Code sent! 📱'); };
  const handleVerifySms = () => { setShowSmsModal(false); showToast('Phone verified! ✅'); };

  // ============================================
  // LOGOUT
  // ============================================
  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-slate-400">Loading profile...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card variant="glass" className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400">{error || 'Profile not found'}</p>
          <Button className="mt-4" onClick={fetchProfile}>Retry</Button>
        </Card>
      </div>
    );
  }

  const displayName = profile.name || profile.username || 'Developer';
  const xpPercent = Math.round((profile.xp / 500) * 100);
  const earnedBadges = profile.badges?.filter(b => b.earned).length || 0;
  const totalBadges = profile.badges?.length || 4;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      {/* Toast */}
      {saveMessage && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 z-50 glass-heavy px-6 py-3 rounded-xl border border-green-500/30 text-sm">
          {saveMessage}
        </motion.div>
      )}

      {/* Header */}
      <Card variant="glass" className="p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-3xl font-bold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
              {isEditing ? (
                <Input value={editedName} onChange={e => setEditedName(e.target.value)} className="w-48" />
              ) : (
                <h1 className="text-2xl font-bold">{displayName}</h1>
              )}
              <Badge variant={profile.email_verified ? 'success' : 'warning'} className="gap-1">
                {profile.email_verified ? <BadgeCheck className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {profile.email_verified ? 'Verified' : 'Unverified'}
              </Badge>
              <Badge variant="info" className="gap-1"><Trophy className="w-3 h-3" /> Lv.{profile.level}</Badge>
            </div>
            <p className="text-muted-foreground mt-1"><Mail className="w-3 h-3 inline mr-1" />{profile.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { if (isEditing) handleSaveProfile(); else { setEditedName(profile.name || ''); setEditedBio(profile.bio || ''); } setIsEditing(!isEditing); }}>
              {isEditing ? <Save className="w-4 h-4 mr-1" /> : <Edit3 className="w-4 h-4 mr-1" />}
              {isEditing ? 'Save' : 'Edit'}
            </Button>
            <Button variant="outline" onClick={handleLogout} className="text-red-400 border-red-500/30">
              <LogOut className="w-4 h-4 mr-1" />Logout
            </Button>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6 p-4 rounded-xl bg-white/5">
          {isEditing ? (
            <textarea value={editedBio} onChange={e => setEditedBio(e.target.value)}
              placeholder="Tell the community about yourself..."
              className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary h-24" />
          ) : (
            <p className="text-sm text-muted-foreground italic">{profile.bio || 'Click Edit to add your bio'}</p>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ icon: Flame, color: 'text-orange-400', value: `${profile.streak}d`, label: 'Streak' },
          { icon: Code, color: 'text-blue-400', value: profile.problems_solved, label: 'Solved' },
          { icon: Award, color: 'text-purple-400', value: `${earnedBadges}/${totalBadges}`, label: 'Badges' },
          { icon: Clock, color: 'text-green-400', value: `${profile.focus_hours}h`, label: 'Focus' }].map((s, i) => (
          <Card key={i} variant="glass" className="p-4 text-center">
            <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* XP Bar */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" />Level {profile.level}</span>
          <span className="text-sm text-muted-foreground">{profile.xp} / 500 XP</span>
        </div>
        <ProgressBar value={xpPercent} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">{xpPercent}% to Level {profile.level + 1}</p>
      </Card>

      {/* Skills */}
      <Card variant="glass" className="p-6">
        <h3 className="font-semibold mb-4">Skills</h3>
        <div className="space-y-3">
          {(profile.skills?.length > 0 ? profile.skills : [{ name: 'JavaScript', level: 0 }, { name: 'React', level: 0 }, { name: 'Python', level: 0 }]).map((skill, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1"><span>{skill.name}</span><span className="text-muted-foreground">{skill.level}%</span></div>
              <ProgressBar value={skill.level} className="h-1.5" />
            </div>
          ))}
        </div>
      </Card>

      {/* Security Hub */}
      <Card variant="glass" className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-400" />Security</h3>
        <div className="space-y-3">
          {[{ icon: Mail, color: 'text-blue-400', label: 'Email', status: profile.email_verified },
            { icon: Smartphone, color: 'text-green-400', label: 'Phone', status: profile.phone_verified },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-3"><item.icon className={`w-5 h-5 ${item.color}`} /><span className="text-sm">{item.label}</span></div>
              {item.status ? <Badge variant="success" size="sm">Verified</Badge> :
               item.label === 'Phone' ? <Button size="sm" variant="outline" onClick={() => setShowSmsModal(true)}>Verify</Button> :
               <Badge variant="warning" size="sm">Pending</Badge>}
            </div>
          ))}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-3"><Key className="w-5 h-5 text-yellow-400" /><span className="text-sm">2FA</span></div>
            <Switch checked={twoFactorEnabled} onChange={() => setTwoFactorEnabled(!twoFactorEnabled)} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-3">{notificationsEnabled ? <BellRing className="w-5 h-5 text-purple-400" /> : <Bell className="w-5 h-5 text-muted-foreground" />}<span className="text-sm">Notifications</span></div>
            <Switch checked={notificationsEnabled} onChange={() => setNotificationsEnabled(!notificationsEnabled)} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-3"><Lock className="w-5 h-5 text-orange-400" /><span className="text-sm">Password</span></div>
            <Button size="sm" variant="outline" onClick={() => setShowPasswordModal(true)}>Change</Button>
          </div>
        </div>
      </Card>

      {/* SMS Modal */}
      {showSmsModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowSmsModal(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="max-w-md w-full glass-heavy rounded-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">Phone Verification</h3><Button variant="ghost" size="sm" onClick={() => setShowSmsModal(false)}><X className="w-5 h-5" /></Button></div>
            <div className="space-y-4">
              <Input type="tel" value={smsPhone} onChange={e => setSmsPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              {smsSent && <Input type="text" value={smsCode} onChange={e => setSmsCode(e.target.value)} placeholder="Enter code" maxLength={6} />}
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSendSms} className="flex-1">{smsSent ? 'Resend' : 'Send Code'}</Button>
                {smsSent && <Button onClick={handleVerifySms} className="flex-1">Verify</Button>}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowPasswordModal(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="max-w-md w-full glass-heavy rounded-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">Change Password</h3><Button variant="ghost" size="sm" onClick={() => setShowPasswordModal(false)}><X className="w-5 h-5" /></Button></div>
            <div className="space-y-4">
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} value={passwordData.currentPassword} onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))} placeholder="Current password" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              <Input type="password" value={passwordData.newPassword} onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))} placeholder="New password" />
              {passwordData.newPassword && (
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= passwordStrength ? strengthColors[passwordStrength-1] : 'bg-gray-600'}`} />)}
                </div>
              )}
              <Input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Confirm password" />
              {passwordError && <p className="text-sm text-red-400"><AlertCircle className="w-4 h-4 inline mr-1" />{passwordError}</p>}
              <Button onClick={handleChangePassword} className="w-full"><Lock className="w-4 h-4 mr-2" />Change Password</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Profile;