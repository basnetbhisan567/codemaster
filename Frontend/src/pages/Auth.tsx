import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Github,
  Chrome,
  Phone,
  AlertTriangle,
  Clock,
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

export default function Auth() {
  const navigate = useNavigate();

  // Input refs
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  // Timer refs
  const passwordTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockoutIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auth state
  const [authStep, setAuthStep] = useState<AuthStep>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isCapsActive, setIsCapsActive] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState<FormDataState>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isLocked = useMemo(() => {
    if (!lockoutUntil) return false;
    return new Date() < lockoutUntil;
  }, [lockoutUntil]);

  // ---------- Helpers ----------

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const getLockoutRemaining = (): string => {
    if (!lockoutUntil) return '';
    const remaining = Math.ceil((lockoutUntil.getTime() - Date.now()) / 1000);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return { label: '', color: 'bg-transparent', width: '0%' };

    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const levels = [
      { label: 'Very Weak', color: 'bg-red-500', width: '20%' },
      { label: 'Weak', color: 'bg-orange-500', width: '40%' },
      { label: 'Fair', color: 'bg-yellow-500', width: '60%' },
      { label: 'Good', color: 'bg-blue-500', width: '80%' },
      { label: 'Strong', color: 'bg-green-500', width: '100%' },
    ];

    return levels[Math.min(score, 4)];
  };

  const getEmailHint = (): string => {
    const val = formData.email.trim();
    if (!val || val.includes('@')) return '';
    return `${val}@codemaster.com`;
  };

  // ---------- Effects ----------

  useEffect(() => {
    if (!lockoutUntil) return;

    lockoutIntervalRef.current = setInterval(() => {
      if (new Date() >= lockoutUntil) {
        setLockoutUntil(null);
        setFailedAttempts(0);
      }
    }, 1000);

    return () => {
      if (lockoutIntervalRef.current) {
        clearInterval(lockoutIntervalRef.current);
        lockoutIntervalRef.current = null;
      }
    };
  }, [lockoutUntil]);

  useEffect(() => {
    if (showPassword) {
      if (passwordTimeoutRef.current) clearTimeout(passwordTimeoutRef.current);
      passwordTimeoutRef.current = setTimeout(() => setShowPassword(false), 10000);
    }

    return () => {
      if (passwordTimeoutRef.current) {
        clearTimeout(passwordTimeoutRef.current);
        passwordTimeoutRef.current = null;
      }
    };
  }, [showPassword]);

  useEffect(() => {
    return () => {
      if (passwordTimeoutRef.current) clearTimeout(passwordTimeoutRef.current);
      if (lockoutIntervalRef.current) clearInterval(lockoutIntervalRef.current);
    };
  }, []);

  // ---------- Handlers ----------

  const handleChange = (field: keyof FormDataState, value: string) => {
    const normalized = field === 'email' ? value.trim().toLowerCase() : value;
    setFormData(prev => ({ ...prev, [field]: normalized }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleBlur = (field: keyof FormDataState) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const checkCapsLock = (e: React.KeyboardEvent) => {
    setIsCapsActive(e.getModifierState('CapsLock'));
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (nextRef?.current) nextRef.current.focus();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (authStep === 'register') {
      if (!formData.name.trim()) newErrors.name = 'Full name is required';
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+?[\d\s\-()]{7,18}$/.test(formData.phone.trim())) {
        newErrors.phone = 'Enter a valid phone number';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (authStep !== 'forgot-password') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (authStep === 'register') {
        if (formData.password.length < 8) {
          newErrors.password = 'At least 8 characters required';
        } else if (!/[A-Z]/.test(formData.password)) {
          newErrors.password = 'Need at least one uppercase letter';
        } else if (!/[a-z]/.test(formData.password)) {
          newErrors.password = 'Need at least one lowercase letter';
        } else if (!/[0-9]/.test(formData.password)) {
          newErrors.password = 'Need at least one number';
        }
      }

      if (authStep === 'register' && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (authStep === 'register') {
        authService.logout();
        await authService.register({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          username: formData.email.split('@')[0],
        });
        if (rememberMe) localStorage.setItem('persist_session', 'true');
        navigate('/', { replace: true });
        return;
      }

      if (authStep === 'login') {
        await authService.login({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        });
        if (rememberMe) localStorage.setItem('persist_session', 'true');
        else sessionStorage.setItem('session_only', 'true');
        setFailedAttempts(0);
        navigate('/', { replace: true });
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1200));
      setAuthStep('login');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setErrors({});
    } catch (err: any) {
      if (authStep === 'login') {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          setLockoutUntil(new Date(Date.now() + 15 * 60 * 1000));
          setErrors({ form: 'Account temporarily locked. Try again in 15 minutes.' });
        } else {
          setErrors({ form: `Invalid email or password. ${5 - nextAttempts} attempts remaining.` });
        }
      } else {
        setErrors({ form: err?.message || 'Registration failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoadingGithub(true);
    setErrors({});
    try {
      await authService.loginWithGithub();
      // authService.loginWithGithub should redirect to GitHub OAuth, then back to this page with token
    } catch (err: any) {
      setErrors({ form: err?.message || 'GitHub login failed. Please try again.' });
    } finally {
      setIsLoadingGithub(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    setErrors({});
    try {
      await authService.loginWithGoogle();
    } catch (err: any) {
      setErrors({ form: err?.message || 'Google login failed. Please try again.' });
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const strength = getPasswordStrength();

  // ---------- Render ----------

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center p-4 bg-[#0a0e17] relative"
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            CodeMaster
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {authStep === 'login' && 'Welcome back to your coding journey'}
            {authStep === 'register' && 'Create your developer account'}
            {authStep === 'forgot-password' && 'Reset your password'}
          </p>
        </div>

        <Card variant="glass" className="p-6 border-primary/20">
          <AnimatePresence mode="wait">
            {authStep === 'register' && (
              <motion.div
                key="register-step"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-center gap-2 mb-6"
              >
                {[1, 2].map(step => (
                  <div
                    key={step}
                    className={`w-8 h-1 rounded-full ${step === 1 ? 'bg-primary' : 'bg-white/20'}`}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isLocked && (
              <motion.div
                key="lockout-banner"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3"
              >
                <Clock className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-400 font-medium">Account temporarily locked</p>
                  <p className="text-xs text-red-300/80">Try again in {getLockoutRemaining()}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {errors.form && (
              <motion.div
                key="form-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <p className="text-sm text-yellow-400">{errors.form}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {authStep === 'register' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      ref={nameRef}
                      type="text"
                      value={formData.name}
                      onChange={e => handleChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      onKeyDown={e => handleKeyDown(e, phoneRef)}
                      placeholder="John Smith"
                      autoComplete="name"
                      className={`pl-10 ${errors.name && touched.name ? 'border-red-500' : ''}`}
                      disabled={isLoading || isLocked}
                    />
                  </div>
                  {errors.name && touched.name && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {authStep === 'register' && (
                <motion.div
                  key="phone-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      ref={phoneRef}
                      type="tel"
                      value={formData.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                      onBlur={() => handleBlur('phone')}
                      onKeyDown={e => handleKeyDown(e, emailRef)}
                      placeholder="+1 (555) 000-0000"
                      autoComplete="tel"
                      className={`pl-10 ${errors.phone && touched.phone ? 'border-red-500' : ''}`}
                      disabled={isLoading || isLocked}
                    />
                  </div>
                  {errors.phone && touched.phone && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={emailRef}
                  type="email"
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  onKeyDown={e =>
                    handleKeyDown(
                      e,
                      authStep === 'forgot-password' ? undefined : passwordRef,
                    )
                  }
                  placeholder="you@example.com"
                  autoComplete="username"
                  className={`pl-10 ${errors.email && touched.email ? 'border-red-500' : ''}`}
                  disabled={isLoading || isLocked}
                />
                {validateEmail(formData.email) && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                )}
              </div>
              {!formData.email.includes('@') && formData.email.length > 2 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Press Tab to complete:{' '}
                  <span className="text-primary">{getEmailHint()}</span>
                </p>
              )}
              {errors.email && touched.email && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {authStep !== 'forgot-password' && (
              <div>
                <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    ref={passwordRef}
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    onKeyDown={e => {
                      checkCapsLock(e);
                      handleKeyDown(e, authStep === 'register' ? confirmPasswordRef : undefined);
                    }}
                    placeholder="••••••••"
                    autoComplete={authStep === 'register' ? 'new-password' : 'current-password'}
                    className={`pl-10 pr-10 ${errors.password && touched.password ? 'border-red-500' : ''}`}
                    disabled={isLoading || isLocked}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {isCapsActive && (
                    <motion.p
                      key="caps-warning"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-yellow-400 mt-1 flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      Caps Lock is on
                    </motion.p>
                  )}
                </AnimatePresence>

                {authStep === 'register' && formData.password && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} rounded-full transition-all duration-300`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Strength: {strength.label}</p>
                  </div>
                )}

                {errors.password && touched.password && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>
            )}

            <AnimatePresence mode="wait">
              {authStep === 'register' && (
                <motion.div
                  key="confirm-password-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-sm font-medium mb-1.5 block text-muted-foreground">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      ref={confirmPasswordRef}
                      type="password"
                      value={formData.confirmPassword}
                      onChange={e => handleChange('confirmPassword', e.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      onKeyDown={e => handleKeyDown(e)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={`pl-10 ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}`}
                      disabled={isLoading || isLocked}
                    />
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {authStep === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-transparent accent-primary"
                  />
                  <span className="text-xs text-muted-foreground">Keep me signed in</span>
                </label>
                <button
                  type="button"
                  onClick={() => setAuthStep('forgot-password')}
                  className="text-xs text-primary hover:underline"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" disabled={isLoading || isLocked} className="w-full gap-2" size="lg">
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
              disabled={isLoading || isLoadingGithub || isLocked}
              onClick={handleGithubLogin}
            >
              <Github className="w-4 h-4" />
              {isLoadingGithub ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              GitHub
            </Button>

            <Button
              variant="outline"
              className="gap-2"
              size="sm"
              disabled={isLoading || isLoadingGoogle || isLocked}
              onClick={handleGoogleLogin}
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
              onClick={() => {
                setAuthStep(authStep === 'login' ? 'register' : 'login');
                setErrors({});
                setTouched({});
                setFailedAttempts(0);
                setLockoutUntil(null);
              }}
              className="text-primary hover:underline font-medium"
              disabled={isLoading}
            >
              {authStep === 'login'
                ? 'Sign Up'
                : authStep === 'forgot-password'
                  ? 'Sign In'
                  : 'Sign In'}
            </button>
          </p>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Shield className="w-3 h-3 inline text-blue-400" /> Protected by CodeMaster Security
          {failedAttempts > 0 && authStep === 'login' && !isLocked && (
            <span className="ml-2 text-yellow-400">{5 - failedAttempts} attempts remaining</span>
          )}
        </p>
      </motion.div>
    </motion.div>
  );
}

