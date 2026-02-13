import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, BarChart3, ArrowRight, CheckCircle2, Globe, LockKeyhole, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen flex bg-[#fcfcfd] selection:bg-primary/10">
      {/* Left Panel - Branding (Premium Light Theme) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-50 border-r border-border/50">
        {/* Subtle Background Effects */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[100px]" />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <div className="relative z-10 flex flex-col justify-between w-full h-full p-16">
          <div className="space-y-10 animate-fade-in">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">SECURE<span className="text-primary italic">ACCESS</span></h2>
            </Link>

            <div className="space-y-6 max-w-lg">
              <h1 className="text-6xl font-black tracking-tight leading-[1.1] text-slate-900 uppercase">
                {isLogin ? t('auth.welcome_back') : t('auth.start_journey')}
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed font-medium">
                {t('auth.branding_subtitle')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 max-w-sm animate-slide-up" style={{ animationDelay: '300ms' }}>
            {[
              { icon: Globe, label: t('auth.multisite_management'), desc: t('auth.centralize_operations'), color: 'bg-blue-500' },
              { icon: LockKeyhole, label: t('auth.encrypted_security'), desc: t('auth.high_level_protocols'), color: 'bg-emerald-500' },
              { icon: BarChart3, label: t('auth.realtime_dashboard'), desc: t('auth.advanced_statistics'), color: 'bg-purple-500' },
              { icon: CheckCircle2, label: t('auth.total_compliance'), desc: t('auth.full_audit_trail'), color: 'bg-amber-500' }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-all duration-300">
                <div className={`h-10 w-10 rounded-xl ${feature.color} flex items-center justify-center shrink-0 shadow-sm`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm tracking-tight">{feature.label}</h4>
                  <p className="text-xs text-slate-500 font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
            <span>Production v2.4.0</span>
            <span>© 2026 SecureAccess Technology</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form (Clean & Focused) */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-10 animate-fade-in" style={{ animationDelay: '100ms' }}>

          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors mb-4 group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Retour
            </Link>
            <h3 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
              {isLogin ? t('auth.login_title') : t('auth.signup_title')}
            </h3>
            <p className="text-slate-500 font-medium">
              {isLogin ? t('auth.login_desc') : t('auth.signup_desc')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t('auth.first_name')}</Label>
                  <Input
                    id="firstName"
                    placeholder="Jean"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={!isLogin}
                    className="h-14 rounded-2xl bg-white border-border focus:border-primary/50 shadow-sm transition-all font-bold px-6"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t('auth.last_name')}</Label>
                  <Input
                    id="lastName"
                    placeholder="Dupont"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required={!isLogin}
                    className="h-14 rounded-2xl bg-white border-border focus:border-primary/50 shadow-sm transition-all font-bold px-6"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{t('auth.email')}</Label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@entreprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 pl-14 rounded-2xl bg-white border-border focus:border-primary/50 shadow-sm transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('auth.password')}</Label>
                {isLogin && (
                  <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:opacity-80 transition-opacity">
                    {t('auth.forgot_password')}
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 pl-14 pr-14 rounded-2xl bg-white border-border focus:border-primary/50 shadow-sm transition-all font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-[0.2em] bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
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
            <p className="text-slate-500 font-medium">
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
