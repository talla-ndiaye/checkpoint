import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, BarChart3 } from 'lucide-react';
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
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] left-[-20%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[100px]" style={{ animationDelay: '2s' }} />

        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

        <div className="relative z-10 flex flex-col justify-between items-start w-full p-16 text-primary-foreground h-full">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold tracking-wider uppercase">{t('common.access_management')}</span>
            </div>
            <h1 className="text-6xl font-extrabold mb-6 leading-tight tracking-tight">
              Secure<span className="text-accent italic">Access</span>
            </h1>
            <p className="text-xl text-primary-foreground/70 max-w-lg leading-relaxed animate-fade-in">
              {t('auth.branding_subtitle')}
            </p>
          </div>

          <div className="space-y-6 w-full max-w-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="group flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t('auth.feature_multisite')}</h3>
                <p className="text-sm text-primary-foreground/50">Gestion centralisée de tous vos sites.</p>
              </div>
            </div>
            <div className="group flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t('auth.feature_qrcodes')}</h3>
                <p className="text-sm text-primary-foreground/50">Accès sécurisé par QR Code unique.</p>
              </div>
            </div>
            <div className="group flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t('auth.feature_reports')}</h3>
                <p className="text-sm text-primary-foreground/50">Rapports et analyses en temps réel.</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-primary-foreground/30 font-medium tracking-widest">
            © 2026 SECUREACCESS TECHNOLOGY
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">SecureAccess</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">
              {isLogin ? t('auth.login_title') : t('auth.signup_title')}
            </h2>
            <p className="text-muted-foreground">
              {isLogin
                ? t('auth.login_desc')
                : t('auth.signup_desc')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('auth.first_name')}</Label>
                  <Input
                    id="firstName"
                    placeholder="Jean"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={!isLogin}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('auth.last_name')}</Label>
                  <Input
                    id="lastName"
                    placeholder="Dupont"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required={!isLogin}
                    className="h-12"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-primary hover:underline">
                  {t('auth.forgot_password')}
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t('common.loading')}
                </>
              ) : isLogin ? (
                t('auth.login_btn')
              ) : (
                t('auth.signup_btn')
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              {isLogin ? t('auth.no_account') : t('auth.have_account')}{' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-medium hover:underline"
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
