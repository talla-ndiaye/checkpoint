import { Link } from 'react-router-dom';
import { Shield, Building2, Users, QrCode, FileBarChart, ArrowRight, Check, Zap, Globe, Lock, ShieldCheck, Activity, Smartphone, Server, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Building2,
    title: 'Gestion multi-sites',
    description: 'Centralisez le contrôle de tous vos périmètres depuis un centre de commandement unique.',
    color: 'bg-blue-500'
  },
  {
    icon: Shield,
    title: 'Sécurité Maximale',
    description: 'Protocoles de cryptage industriels et traçabilité totale de chaque mouvement.',
    color: 'bg-emerald-500'
  },
  {
    icon: QrCode,
    title: 'Accès sans Contact',
    description: 'Badges digitaux dynamiques et invitations sécurisées par QR Codes intelligents.',
    color: 'bg-amber-500'
  },
  {
    icon: FileBarChart,
    title: 'Analytiques Stratégiques',
    description: 'Visualisez les flux en temps réel et générez des rapports d\'audit automatiques.',
    color: 'bg-purple-500'
  },
];

const roles = [
  {
    name: 'Super Administrateur',
    role: 'super_admin',
    desc: 'Vision globale du réseau national',
    details: ['Gestion des sites', 'Audit global', 'Gestion des managers']
  },
  {
    name: 'Gestionnaire de site',
    role: 'manager',
    desc: 'Administration de votre infrastructure locale',
    details: ['Gestion entreprises', 'Contrôle gardiens', 'Rapports locaux']
  },
  {
    name: 'Gardien',
    role: 'guardian',
    desc: 'Vérification et opérations de terrain',
    details: ['Scan QR codes', 'Scanner CNI', 'Sorties groupées']
  },
  {
    name: 'Admin Entreprise',
    role: 'company_admin',
    desc: 'Gestion autonome de votre personnel',
    details: ['Ajout employés', 'Suivi invitations', 'Analytics staff']
  },
  {
    name: 'Employé / Visiteur',
    role: 'employee',
    desc: 'Expérience d\'accès fluide',
    details: ['Génération de QR', 'Invitations invités', 'Historique perso']
  },
];

const testimonials = [
  {
    quote: "La transition vers SecureAccess a réduit nos temps d'attente à l'accueil de 70%. La fonction de scan CNI est une révolution pour nos gardiens.",
    author: "Marc Lefebvre",
    role: "Directeur de la Sécurité, Groupe Industriel",
    avatar: "ML"
  },
  {
    quote: "Enfin une plateforme qui comprend les enjeux du multi-site. Je supervise 12 entrepôts depuis une interface unique sans aucune friction.",
    author: "Sophie Durand",
    role: "Facility Manager Regional",
    avatar: "SD"
  },
  {
    quote: "Le système d'invitations QR est si simple que nos employés l'ont adopté en une journée. Plus de badges perdus ou de registres papier illisibles.",
    author: "Jean-Baptiste Alix",
    role: "Responsable RH, Tech Corp",
    avatar: "JA"
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: "199",
    desc: "Idéal pour un site unique avec un flux modéré.",
    features: ["1 Site physique", "Jusqu'à 500 accès/mois", "Gestion des Gardiens", "Rapports basiques", "Support email"],
    popular: false
  },
  {
    name: "Professional",
    price: "499",
    desc: "Le choix standard pour les entreprises multi-sites.",
    features: ["Jusqu'à 5 Sites", "Accès illimités", "Analytics temps réel", "API Rest access", "Support prioritaire 24/7"],
    popular: true
  },
  {
    name: "Enterprise",
    price: "Sur devis",
    desc: "Sécurité maximale pour les organisations complexes.",
    features: ["Sites illimités", "Audit trail complet", "SSO & LDAP Intégration", "On-premise option", "Account Manager dédié"],
    popular: false
  }
];

export default function Index() {
  return (
    <div className="min-h-screen bg-[#fcfcfd] text-foreground selection:bg-primary/10">
      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden h-screen w-screen z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-10%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 transition-all">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">SECURE<span className="text-primary italic">ACCESS</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/auth" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
              Solution
            </Link>
            <Link to="/contact" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
              Contact
            </Link>
            <div className="h-4 w-px bg-border" />
            <Link to="/auth" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors px-4">
              Connexion
            </Link>
            <Link to="/auth">
              <Button className="rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-md">
                Essayer gratuitement
              </Button>
            </Link>
          </div>

          <Link to="/auth" className="md:hidden">
            <Button size="sm" className="rounded-lg font-bold bg-primary">Connexion</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-20 overflow-hidden z-10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-wider animate-fade-in">
              <Zap className="h-3 w-3 fill-primary" />
              La nouvelle norme de sécurité physique
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight text-slate-900">
              Maîtrisez vos accès d'un seul <span className="text-primary italic">Regard.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
              Plateforme unifiée pour la gestion multi-sites. Sécurisez vos entrées,
              automatisez les flux et auditez vos sites en temps réel avec une précision chirurgicale.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/auth" className="w-full sm:w-auto">
                <Button className="w-full sm:h-16 h-14 sm:px-12 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
                  Déployer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto sm:h-16 h-14 sm:px-10 rounded-2xl text-lg font-bold border-2 hover:bg-slate-50">
                Visualiser la démo
              </Button>
            </div>

            <div className="pt-8 flex items-center justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
              <span className="font-bold text-sm tracking-widest uppercase">Trusted by</span>
              <div className="flex gap-6 items-center">
                <div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Premium UI Mockup */}
          <div className="mt-20 relative animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-accent/10 rounded-[40px] blur-3xl -z-10" />
            <div className="bg-white rounded-[32px] p-3 shadow-2xl border border-border/50 max-w-6xl mx-auto">
              <div className="bg-slate-50 rounded-[24px] overflow-hidden border border-border/80 aspect-[16/10] flex flex-col">
                {/* Mock Header */}
                <div className="h-10 bg-white border-b border-border flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  </div>
                  <div className="flex-1 max-w-sm h-5 bg-slate-100 rounded-md mx-auto" />
                </div>

                {/* Mock Dashboard Content */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Sidebar */}
                  <div className="w-48 bg-slate-900 p-4 space-y-4">
                    <div className="h-4 w-2/3 bg-white/10 rounded-full" />
                    <div className="space-y-2 pt-4">
                      <div className="h-8 w-full bg-primary/20 rounded-lg" />
                      <div className="h-8 w-full bg-white/5 rounded-lg" />
                      <div className="h-8 w-full bg-white/5 rounded-lg" />
                      <div className="h-8 w-full bg-white/5 rounded-lg" />
                    </div>
                  </div>

                  {/* Main */}
                  <div className="flex-1 p-8 space-y-8 bg-[#f8fafc]">
                    <div className="flex justify-between items-end">
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-slate-200 rounded-full" />
                        <div className="h-8 w-64 bg-slate-300 rounded-full" />
                      </div>
                      <div className="h-10 w-32 bg-primary rounded-xl" />
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <div className="h-28 bg-white border border-border shadow-sm rounded-2xl p-4 flex flex-col justify-between">
                        <div className="h-4 w-12 bg-blue-100 rounded-full" />
                        <div className="h-6 w-20 bg-slate-200 rounded-full" />
                      </div>
                      <div className="h-28 bg-white border border-border shadow-sm rounded-2xl p-4 flex flex-col justify-between">
                        <div className="h-4 w-12 bg-emerald-100 rounded-full" />
                        <div className="h-6 w-20 bg-slate-200 rounded-full" />
                      </div>
                      <div className="h-28 bg-white border border-border shadow-sm rounded-2xl p-4 flex flex-col justify-between">
                        <div className="h-4 w-12 bg-amber-100 rounded-full" />
                        <div className="h-6 w-20 bg-slate-200 rounded-full" />
                      </div>
                    </div>

                    <div className="flex-1 bg-white border border-border shadow-sm rounded-3xl p-6">
                      <div className="h-4 w-40 bg-slate-200 rounded-full mb-6" />
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-12 w-full bg-slate-50 border border-border rounded-xl flex items-center px-4 gap-4">
                            <div className="h-8 w-8 bg-slate-200 rounded-lg" />
                            <div className="h-3 w-32 bg-slate-200 rounded-full" />
                            <div className="ml-auto h-5 w-16 bg-success/10 rounded-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white border-y border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 uppercase">Une solution complète.</h2>
            <p className="text-lg text-slate-500 font-medium">L'intégralité de votre chaîne de sécurité dans un seul outil.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-[32px] bg-slate-50 border border-border hover:border-primary/20 hover:bg-white hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`h-14 w-14 rounded-2xl ${feature.color} flex items-center justify-center mb-8 shadow-lg shadow-black/5`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 tracking-tight text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles / Explanatory Section */}
      <section className="py-32 bg-[#fcfcfd]">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest">
                  Granularité totale
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">
                  Conçu pour chaque <br />
                  <span className="text-primary italic">maillon de la chaîne.</span>
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed font-medium">
                  De la supervision nationale à l'employé final, SecureAccess propose une interface dédiée
                  optimisée pour chaque rôle.
                </p>
              </div>

              <div className="space-y-4">
                {roles.map((role, index) => (
                  <div key={index} className="flex gap-4 p-5 rounded-[24px] bg-white border border-border hover:shadow-md transition-all group">
                    <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-border group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{role.name}</h4>
                      <p className="text-sm text-slate-500 mb-2 font-medium">{role.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {role.details.map((detail, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold uppercase tracking-wider">
                            {detail}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-[40px] p-10 border border-border shadow-2xl relative overflow-hidden group">
                {/* Decorative background element for the card */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px]" />

                <div className="relative z-10 text-center space-y-10">
                  <div className="flex justify-center -space-x-4">
                    <div className="h-20 w-20 rounded-full border-4 border-white bg-blue-500 flex items-center justify-center text-white shadow-xl z-30">
                      <Smartphone className="h-10 w-10" />
                    </div>
                    <div className="h-20 w-20 rounded-full border-4 border-white bg-purple-500 flex items-center justify-center text-white shadow-xl z-20">
                      <Server className="h-10 w-10" />
                    </div>
                    <div className="h-20 w-20 rounded-full border-4 border-white bg-emerald-500 flex items-center justify-center text-white shadow-xl z-10">
                      <FileText className="h-10 w-10" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-slate-900 uppercase">Technologie QR Dynamique</h3>
                    <p className="text-slate-500 font-medium">
                      Chaque code est unique, rotatif et horodaté pour prévenir toute usurpation.
                    </p>
                  </div>

                  <div className="qr-container mx-auto transform group-hover:scale-105 transition-transform duration-500">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=SECUREACCESS_PLATFORM"
                      alt="Demo QR"
                      className="w-48 h-48 opacity-90"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-border text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                        <span className="text-sm font-bold">ACTIF</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-border text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sécurité</p>
                      <span className="text-sm font-bold">AES-256</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-white border-y border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">ILS NOUS FONT CONFIANCE</h2>
            <p className="text-lg text-slate-500 font-medium">Découvrez comment nous transformons la sécurité de nos clients.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="p-10 rounded-[40px] bg-slate-50 border border-border space-y-6 flex flex-col justify-between hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <p className="text-lg text-slate-700 italic font-medium leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{t.author}</h4>
                    <p className="text-sm text-slate-500 font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 bg-[#fcfcfd]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 uppercase">Nos Plans Tarifaires.</h2>
            <p className="text-lg text-slate-500 font-medium">Une solution adaptée à la taille de votre infrastructure.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`p-10 rounded-[48px] border-2 transition-all duration-500 flex flex-col ${plan.popular
                  ? 'border-primary bg-white shadow-2xl scale-105 z-10'
                  : 'border-border bg-slate-50/50 hover:border-slate-300'
                  }`}
              >
                {plan.popular && (
                  <span className="self-start px-4 py-1.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest mb-6">
                    Mieux noté
                  </span>
                )}
                <div className="mb-8">
                  <h4 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tighter">{plan.name}</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-slate-900">
                      {plan.price === "Sur devis" ? "" : "€"}
                      {plan.price}
                    </span>
                    {plan.price !== "Sur devis" && <span className="text-slate-400 font-bold">/mois</span>}
                  </div>
                  <p className="mt-4 text-slate-500 font-medium text-sm leading-relaxed">{plan.desc}</p>
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/auth">
                  <Button className={`w-full h-14 rounded-2xl font-bold text-base transition-all ${plan.popular
                    ? 'bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20'
                    : 'bg-white border-2 border-border text-slate-900 hover:bg-slate-900 hover:text-white'
                    }`}>
                    {plan.price === "Sur devis" ? "Contacter l'équipe" : "Démarrer Starter"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="bg-slate-900 rounded-[48px] p-12 md:p-24 text-center space-y-10 relative overflow-hidden shadow-2xl">
            {/* Background elements for CTA */}
            <div className="absolute top-0 left-0 w-full h-full bg-primary/10 opacity-50" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/10 rounded-full blur-[80px]" />

            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl md:text-7xl font-black tracking-tight text-white leading-tight">
                Reprenez le contrôle de <br />
                <span className="text-primary italic">votre périmètre.</span>
              </h2>
              <p className="text-xl text-white/50 max-w-xl mx-auto font-medium">
                Rejoignez les leaders du secteur qui utilisent déjà SecureAccess pour protéger leurs accès.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Link to="/auth">
                  <Button className="h-16 px-12 text-xl font-bold bg-white text-slate-900 hover:bg-slate-50 transition-all rounded-2xl">
                    Commencer maintenant
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="ghost" className="h-16 px-12 text-xl font-bold text-white hover:bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                    Contacter un expert
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-border relative z-10 text-slate-900">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20 text-center md:text-left">
            <div className="space-y-6">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tighter">SECUREACCESS</span>
              </div>
              <p className="text-slate-500 font-medium">
                La plateforme de référence pour la gestion des accès et de la sécurité physique multi-sites.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-slate-400 text-xs uppercase tracking-widest">Produit</h4>
              <ul className="space-y-4 font-bold">
                <li><Link to="/auth" className="text-slate-600 hover:text-primary transition-colors">Fonctionnalités</Link></li>
                <li><Link to="/auth" className="text-slate-600 hover:text-primary transition-colors">Intégrations</Link></li>
                <li><Link to="/auth" className="text-slate-600 hover:text-primary transition-colors">Tarification</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-slate-400 text-xs uppercase tracking-widest">Enterprise</h4>
              <ul className="space-y-4 font-bold">
                <li><Link to="/auth" className="text-slate-600 hover:text-primary transition-colors">Sécurité</Link></li>
                <li><Link to="/auth" className="text-slate-600 hover:text-primary transition-colors">Success Stories</Link></li>
                <li><Link to="/contact" className="text-slate-600 hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-slate-400 text-xs uppercase tracking-widest">Support</h4>
              <ul className="space-y-4 font-bold">
                <li><Link to="/auth" className="text-slate-600 hover:text-primary transition-colors">Centre d'aide</Link></li>
                <li><Link to="/auth" className="text-slate-600 hover:text-primary transition-colors">API Docs</Link></li>
                <li><Link to="/auth" className="text-slate-600 hover:text-primary transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-slate-100">
            <p className="text-sm font-bold text-slate-400">
              © 2026 SecureAccess Technology. Tous droits réservés.
            </p>
            <div className="flex gap-8 text-sm font-bold text-slate-400">
              <span className="hover:text-primary cursor-pointer transition-colors">Confidentialité</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Conditions</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
