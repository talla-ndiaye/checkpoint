import { Link } from 'react-router-dom';
import { Shield, Building2, Users, QrCode, FileBarChart, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Building2,
    title: 'Gestion multi-sites',
    description: 'Gérez plusieurs bâtiments depuis une interface centralisée',
  },
  {
    icon: Users,
    title: 'Rôles utilisateurs',
    description: '5 niveaux de permissions pour une sécurité optimale',
  },
  {
    icon: QrCode,
    title: 'QR Codes sécurisés',
    description: 'Badges digitaux et invitations avec codes uniques',
  },
  {
    icon: FileBarChart,
    title: 'Rapports détaillés',
    description: 'Historiques et exports en PDF/CSV',
  },
];

const roles = [
  { name: 'Super Administrateur', color: 'role-super-admin' },
  { name: 'Gestionnaire de site', color: 'role-manager' },
  { name: 'Gardien', color: 'role-guardian' },
  { name: 'Admin Entreprise', color: 'role-company-admin' },
  { name: 'Employé', color: 'role-employee' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">SecureAccess</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg">
                Commencer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute top-1/4 -right-64 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Shield className="h-4 w-4" />
              Plateforme de gestion des accès
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 animate-slide-up">
              Sécurisez vos{' '}
              <span className="gradient-text">bâtiments</span>{' '}
              en toute simplicité
            </h1>
            <p className="text-xl text-muted-foreground mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Une solution complète pour gérer les accès, les invitations et les employés 
              de vos sites avec des QR codes sécurisés et des rapports détaillés.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/auth">
                <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-xl hover:shadow-2xl transition-all duration-300">
                  Démarrer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                Voir la démo
              </Button>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none"></div>
            <div className="glass-card rounded-2xl p-2 shadow-2xl">
              <div className="bg-sidebar rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-sidebar-border">
                  <div className="w-3 h-3 rounded-full bg-destructive/80"></div>
                  <div className="w-3 h-3 rounded-full bg-warning/80"></div>
                  <div className="w-3 h-3 rounded-full bg-success/80"></div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-24 rounded-lg bg-sidebar-accent/50 animate-pulse"></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 h-48 rounded-lg bg-sidebar-accent/50 animate-pulse"></div>
                    <div className="h-48 rounded-lg bg-sidebar-accent/50 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Une plateforme complète pour la gestion des accès de vos bâtiments
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                5 rôles pour une gestion complète
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Chaque utilisateur dispose d'un tableau de bord personnalisé avec les 
                fonctionnalités adaptées à son rôle.
              </p>
              <div className="space-y-4">
                {roles.map((role, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <Check className="h-5 w-5 text-success" />
                    <span className={`role-badge ${role.color}`}>{role.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-2xl p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <QrCode className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">QR Code unique</h4>
                    <p className="text-sm text-muted-foreground">Généré automatiquement</p>
                  </div>
                </div>
                <div className="qr-container mx-auto">
                  <div className="w-48 h-48 bg-gradient-to-br from-foreground to-foreground/80 rounded-lg flex items-center justify-center">
                    <div className="w-40 h-40 bg-background rounded grid grid-cols-7 grid-rows-7 gap-0.5 p-1">
                      {Array.from({ length: 49 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-sm ${Math.random() > 0.5 ? 'bg-foreground' : 'bg-transparent'}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-mono text-lg font-semibold tracking-widest">AB3X7K</p>
                  <p className="text-sm text-muted-foreground">Code sécurisé 6 caractères</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="container mx-auto px-6 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Prêt à sécuriser vos accès ?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Rejoignez les entreprises qui font confiance à SecureAccess pour la gestion de leurs bâtiments.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-semibold shadow-xl">
              Créer un compte gratuit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">SecureAccess</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 SecureAccess. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
