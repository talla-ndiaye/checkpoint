import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, BarChart3, ArrowRight, CheckCircle2, Globe, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

export default function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({
          title: t('auth.login_success'),
          description: t('auth.welcome_msg'),
        });
        navigate('/dashboard');
      } else {
        const { error } = await signUp(email, password, firstName, lastName);
        if (error) throw error;
        toast({
          title: t('auth.account_created'),
          description: t('auth.account_created_desc'),
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: t('auth.error'),
        description: error.message || t('common.error'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050810] selection:bg-primary/30 selection:text-white">
      {/* Left Panel - Branding (Premium Dark Mode) */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        {/* Deep background with premium effects */}
        <div className="absolute inset-0 bg-[#050810]" />

        {/* Moving Aurora-like effects */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '4s' }} />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        <div className="relative z-10 flex flex-col justify-between w-full h-full p-20">
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent p-0.5 shadow-glow">
                <div className="h-full w-full rounded-[14px] bg-[#050810] flex items-center justify-center">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-black tracking-tighter text-white">SECURE<span className="text-primary italic">ACCESS</span></h2>
            </div>

            <div className="space-y-6 max-w-xl">
              <h1 className="text-7xl font-black tracking-tight leading-[0.9] text-white">
                {isLogin ? t('auth.welcome_back') : t('auth.start_journey')}
              </h1>
              <p className="text-xl text-white/50 leading-relaxed font-medium">
                {t('auth.branding_subtitle')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 max-w-2xl animate-slide-up" style={{ animationDelay: '300ms' }}>
            {[
              { icon: Globe, label: t('auth.multisite_management'), desc: t('auth.centralize_operations') },
              { icon: LockKeyhole, label: t('auth.encrypted_security'), desc: t('auth.high_level_protocols') },
              { icon: BarChart3, label: t('auth.realtime_dashboard'), desc: t('auth.advanced_statistics') },
              { icon: CheckCircle2, label: t('auth.total_compliance'), desc: t('auth.full_audit_trail') }
            ].map((feature, i) => (
              <div key={i} className="glass-card p-6 rounded-[28px] border-white/5 hover:border-white/10 group transition-all duration-500">
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-black text-white text-lg tracking-tight mb-1">{feature.label}</h4>
                <p className="text-sm text-white/40 font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
            <span>v2.0 Release</span>
            <span>© 2026 SecureAccess Technology</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form (Clean & Focused) */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-20 relative">
        {/* Background blobs for mobile/subtle effect */}
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] pointer-events-none lg:hidden" />

        <div className="w-full max-w-md space-y-12 relative animate-fade-in" style={{ animationDelay: '200ms' }}>
          {/* Header Mobile Only */}
          <div className="lg:hidden flex flex-col items-center gap-4 text-center">
            <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-4xl font-black gradient-text tracking-tighter uppercase">SecureAccess</h2>
          </div>

          <div className="space-y-4">
            <h3 className="text-4xl font-black tracking-tight text-white lg:text-foreground">
              {isLogin ? t('auth.login_title') : t('auth.signup_title')}
            </h3>
            <p className="text-muted-foreground font-medium italic">
              {isLogin ? t('auth.login_desc') : t('auth.signup_desc')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-black uppercase tracking-[0.2em] ml-1">{t('auth.first_name')}</Label>
                  <Input
                    id="firstName"
                    placeholder="Jean"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={!isLogin}
                    className="h-14 rounded-2xl bg-white/5 border-white/10 lg:bg-muted/50 lg:border-muted-foreground/20 focus:border-primary/50 transition-all font-bold px-6"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-black uppercase tracking-[0.2em] ml-1">{t('auth.last_name')}</Label>
                  <Input
                    id="lastName"
                    placeholder="Dupont"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required={!isLogin}
                    className="h-14 rounded-2xl bg-white/5 border-white/10 lg:bg-muted/50 lg:border-muted-foreground/20 focus:border-primary/50 transition-all font-bold px-6"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-[0.2em] ml-1">{t('auth.email')}</Label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 pl-14 rounded-2xl bg-white/5 border-white/10 lg:bg-muted/50 lg:border-muted-foreground/20 focus:border-primary/50 transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-[0.2em]">{t('auth.password')}</Label>
                {isLogin && (
                  <button type="button" className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity">
                    {t('auth.forgot_password')}
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 pl-14 pr-14 rounded-2xl bg-white/5 border-white/10 lg:bg-muted/50 lg:border-muted-foreground/20 focus:border-primary/50 transition-all font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-[0.2em] bg-gradient-to-r from-primary to-primary/80 hover:scale-[1.02] transition-all shadow-glow flex items-center justify-center gap-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  {isLogin ? t('auth.login_btn') : t('auth.signup_btn')}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 text-center">
            <p className="text-muted-foreground font-medium italic">
              {isLogin ? t('auth.no_account') : t('auth.have_account')}{' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-black uppercase tracking-widest ml-2 hover:underline select-none"
              >
                {isLogin ? t('auth.signup') : t('auth.login')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
