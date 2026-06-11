import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Github,
  Chrome,
  Phone,
  AlertTriangle,
} from 'lucide-react';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/card';
import { authService } from '../services/authService';

type AuthStep = 'login' | 'register' | 'forgot-password';

type FormDataState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type Errors = Partial<Record<keyof FormDataState | 'form', string>>;

export default function Auth() {
  const navigate = useNavigate();

  const [authStep, setAuthStep] = useState<AuthStep>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormDataState, boolean>>>({});

  const [formData, setFormData] = useState<FormDataState>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { label: '', width: '0%', color: 'bg-transparent' };

    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const levels = [
      { label: 'Very Weak', width: '20%', color: 'bg-red-500' },
      { label: 'Weak', width: '40%', color: 'bg-orange-500' },
      { label: 'Fair', width: '60%', color: 'bg-yellow-500' },
      { label: 'Good', width: '80%', color: 'bg-blue-500' },
      { label: 'Strong', width: '100%', color: 'bg-green-500' },
    ];

    return levels[Math.min(score - 1, 4)] ?? levels[0];
  }, [formData.password]);

  const resetStepState = (step: AuthStep) => {
    setAuthStep(step);
    setErrors({});
    setTouched({});
    setShowPassword(false);
    setFormData(prev => ({
      ...prev,
      password: '',
      confirmPassword: '',
    }));
  };

  const handleChange = (field: keyof FormDataState, value: string) => {
    const normalized = field === 'email' ? value.trim().toLowerCase() : value;
    setFormData(prev => ({ ...prev, [field]: normalized }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleBlur = (field: keyof FormDataState) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = () => {
    const nextErrors: Errors = {};

    if (authStep === 'register') {
      if (!formData.name.trim()) nextErrors.name = 'Full name is required';
      if (!formData.phone.trim()) nextErrors.phone = 'Phone number is required';
      if (formData.phone.trim() && !/^\+?[\d\s\-()]{7,18}$/.test(formData.phone.trim())) {
        nextErrors.phone = 'Enter a valid phone number';
      }
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (authStep === 'login') {
      if (!formData.password) nextErrors.password = 'Password is required';
    }

    if (authStep === 'register') {
      if (!formData.password) nextErrors.password = 'Password is required';
      else if (formData.password.length < 8) nextErrors.password = 'At least 8 characters required';
      else if (!/[A-Z]/.test(formData.password)) nextErrors.password = 'Need one uppercase letter';
      else if (!/[a-z]/.test(formData.password)) nextErrors.password = 'Need one lowercase letter';
      else if (!/[0-9]/.test(formData.password)) nextErrors.password = 'Need one number';

      if (!formData.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password';
      else if (formData.password !== formData.confirmPassword) {
        nextErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(nextErrors);
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (authStep === 'login') {
         await authService.login({
          email: formData.email,
          password: formData.password,
        });
        await new Promise(resolve=>setTimeout(resolve,200));
        if (rememberMe) localStorage.setItem('persist_session', 'true');
        else sessionStorage.setItem('session_only', 'true');

        navigate('/', { replace: true });
        return;
      }

      if (authStep === 'register') {
        await authService.register({
          name: formData.name.trim(),
          email: formData.email,
          phone: formData.phone.trim(),
          password: formData.password,
          username: formData.email.split('@')[0],
        });

        navigate('/', { replace: true });
        return;
      }

      await authService.requestPasswordReset({ email: formData.email });
      setErrors({ form: 'Reset link sent to your email.' });
    } catch (err: any) {
      setErrors({
        form: err?.message || 'Authentication failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    setErrors({});
    try {
      if (provider === 'github') {
        setIsLoadingGithub(true);
        await authService.loginWithGithub();
      } else {
        setIsLoadingGoogle(true);
        await authService.loginWithGoogle();
      }
    } catch (err: any) {
      setErrors({ form: err?.message || `${provider} login failed.` });
    } finally {
      setIsLoadingGithub(false);
      setIsLoadingGoogle(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center p-4 bg-[#0a0e17]"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">CodeMaster</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {authStep === 'login' && 'Welcome back'}
            {authStep === 'register' && 'Create your account'}
            {authStep === 'forgot-password' && 'Reset your password'}
          </p>
        </div>

        <Card variant="glass" className="p-6 border-primary/20">
          {errors.form && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <p className="text-sm text-yellow-400">{errors.form}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authStep === 'register' && (
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    placeholder="John Smith"
                    className={`pl-10 ${errors.name && touched.name ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.name && touched.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
              </div>
            )}

            {authStep === 'register' && (
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    placeholder="+1 (555) 000-0000"
                    className={`pl-10 ${errors.phone && touched.phone ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.phone && touched.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@example.com"
                  className={`pl-10 ${errors.email && touched.email ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {validateEmail(formData.email) && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                )}
              </div>
              {errors.email && touched.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            {authStep !== 'forgot-password' && (
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 ${errors.password && touched.password ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {authStep === 'register' && formData.password && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} rounded-full`}
                        style={{ width: passwordStrength.width }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Strength: {passwordStrength.label}</p>
                  </div>
                )}
                {errors.password && touched.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
              </div>
            )}

            {authStep === 'register' && (
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={e => handleChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="••••••••"
                    className={`pl-10 ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {authStep === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                  />
                  <span className="text-xs text-muted-foreground">Keep me signed in</span>
                </label>
                <button
                  type="button"
                  onClick={() => resetStepState('forgot-password')}
                  className="text-xs text-primary hover:underline"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {authStep === 'forgot-password' && (
              <p className="text-xs text-muted-foreground">
                Enter your email and we’ll send a password reset link.
              </p>
            )}

            <Button type="submit" disabled={isLoading} className="w-full gap-2" size="lg">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {isLoading
                ? 'Please wait...'
                : authStep === 'login'
                  ? 'Sign In'
                  : authStep === 'register'
                    ? 'Create Account'
                    : 'Send Reset Link'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-background text-muted-foreground">or</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="gap-2"
              size="sm"
              disabled={isLoading || isLoadingGithub}
              onClick={() => handleOAuth('github')}
            >
              <Github className="w-4 h-4" />
              {isLoadingGithub ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              GitHub
            </Button>

            <Button
              variant="outline"
              className="gap-2"
              size="sm"
              disabled={isLoading || isLoadingGoogle}
              onClick={() => handleOAuth('google')}
            >
              <Chrome className="w-4 h-4" />
              {isLoadingGoogle ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Google
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {authStep === 'login' && "Don't have an account? "}
            {authStep === 'register' && 'Already have an account? '}
            {authStep === 'forgot-password' && 'Remember your password? '}
            <button
              onClick={() => resetStepState(authStep === 'login' ? 'register' : 'login')}
              className="text-primary hover:underline font-medium"
              disabled={isLoading}
            >
              {authStep === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </Card>
      </motion.div>
    </motion.div>
  );
}