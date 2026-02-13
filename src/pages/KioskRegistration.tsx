import { useState, useEffect } from 'react';
import { Shield, ArrowRight, ArrowLeft, Camera, CheckCircle2, User, QrCode, FileText, Globe, Info, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type KioskStep = 'WELCOME' | 'CONSENT' | 'SCAN' | 'DETAILS' | 'SUCCESS';

export default function KioskRegistration() {
    const { toast } = useToast();
    const [step, setStep] = useState<KioskStep>('WELCOME');
    const [isScanning, setIsScanning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [qrCodeData, setQrCodeData] = useState<string | null>(null);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [company, setCompany] = useState('');
    const [reason, setReason] = useState('');
    const [consent, setConsent] = useState(false);

    const handleNext = () => {
        if (step === 'WELCOME') setStep('CONSENT');
        else if (step === 'CONSENT') {
            if (!consent) {
                toast({ title: "Action requise", description: "Veuillez accepter les conditions de sécurité.", variant: "destructive" });
                return;
            }
            setStep('SCAN');
        }
    };

    const simulateScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            setFirstName('Jean');
            setLastName('Dupont');
            setStep('DETAILS');
            toast({ title: "Carte détectée", description: "Informations extraites avec succès." });
        }, 3000);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate DB entry for walk-in visitor
        setTimeout(() => {
            setIsSubmitting(false);
            setQrCodeData(`WALK-IN-${Date.now()}`);
            setStep('SUCCESS');
        }, 2000);
    };

    const KioskHeader = () => (
        <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
                    <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tighter text-white">SECURE<span className="text-primary italic">ACCESS</span></h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Borne d'Enregistrement Autonome</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex gap-1">
                    {['WELCOME', 'CONSENT', 'SCAN', 'DETAILS', 'SUCCESS'].map((s, i) => (
                        <div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step === s ? 'bg-primary w-12' : 'bg-white/10'}`} />
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050810] text-white selection:bg-primary/30 flex flex-col p-12 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />

            <KioskHeader />

            <main className="flex-1 flex items-center justify-center relative">
                <div className="w-full max-w-4xl">
                    {step === 'WELCOME' && (
                        <div className="text-center space-y-12 animate-fade-in">
                            <div className="space-y-6">
                                <h1 className="text-8xl font-black leading-none tracking-tighter">BIENVENUE <br /> <span className="gradient-text italic">SUR LE SITE.</span></h1>
                                <p className="text-2xl text-white/40 font-medium max-w-2xl mx-auto italic">
                                    Veuillez vous enregistrer pour accéder aux installations. Ce processus prend moins de 2 minutes.
                                </p>
                            </div>
                            <Button
                                onClick={handleNext}
                                className="h-28 px-20 rounded-[40px] text-3xl font-black uppercase tracking-widest bg-primary hover:scale-105 transition-all shadow-glow gap-6 group"
                            >
                                Commencer
                                <ArrowRight className="h-10 w-10 group-hover:translate-x-2 transition-transform" />
                            </Button>
                        </div>
                    )}

                    {step === 'CONSENT' && (
                        <div className="glass-card p-16 rounded-[48px] animate-slide-up space-y-12 border-white/10">
                            <div className="space-y-4">
                                <h3 className="text-4xl font-black uppercase tracking-tight">Règles de Sécurité & GDPR</h3>
                                <p className="text-white/40 text-lg">Veuillez lire et accepter les conditions suivantes avant de continuer.</p>
                            </div>

                            <div className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                                <div className="space-y-6 text-white/60 leading-relaxed font-medium">
                                    <section className="space-y-2">
                                        <h4 className="text-white font-black text-xl flex items-center gap-3">
                                            <Info className="h-5 w-5 text-primary" />
                                            Traitement des données
                                        </h4>
                                        <p>Vos données personnelles (Nom, Prénom, Société) sont collectées uniquement à des fins de sécurité et de gestion des accès physiques.</p>
                                    </section>
                                    <section className="space-y-2">
                                        <h4 className="text-white font-black text-xl flex items-center gap-3">
                                            <AlertCircle className="h-5 w-5 text-accent" />
                                            Obligations du visiteur
                                        </h4>
                                        <p>Le port du badge est obligatoire de manière visible. Vous vous engagez à respecter les consignes de sécurité du site et à signaler tout incident.</p>
                                    </section>
                                    <p>En cochant la case ci-dessous, vous attestez avoir pris connaissance de ces règles et consentez au traitement de vos informations.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 p-8 bg-primary/5 rounded-3xl border border-primary/20">
                                <Checkbox
                                    id="consent"
                                    checked={consent}
                                    onCheckedChange={(checked) => setConsent(checked as boolean)}
                                    className="h-10 w-10 border-2 rounded-xl data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <label htmlFor="consent" className="text-xl font-black cursor-pointer select-none">
                                    J'AI LU ET J'ACCEPTE LES CONDITIONS
                                </label>
                            </div>

                            <div className="flex gap-6">
                                <Button variant="ghost" onClick={() => setStep('WELCOME')} className="h-20 flex-1 text-xl font-black uppercase tracking-widest border border-white/10 rounded-3xl">
                                    Retour
                                </Button>
                                <Button onClick={handleNext} disabled={!consent} className="h-20 flex-[2] text-xl font-black uppercase tracking-widest bg-primary rounded-3xl shadow-glow">
                                    Suivant
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'SCAN' && (
                        <div className="text-center space-y-12 animate-fade-in">
                            <h3 className="text-5xl font-black uppercase tracking-tighter">PRÉSENTEZ VOTRE <span className="text-primary italic">PIÈCE D'IDENTITÉ.</span></h3>

                            <div className="relative mx-auto w-full max-w-2xl aspect-[1.6/1] glass-card rounded-[40px] border-white/10 flex flex-col items-center justify-center group overflow-hidden">
                                {isScanning ? (
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-[#050810]/80 backdrop-blur-md">
                                        <Loader2 className="h-24 w-24 animate-spin text-primary" />
                                        <p className="text-3xl font-black uppercase tracking-[0.3em] animate-pulse">Extraction...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-8">
                                        <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center animate-bounce">
                                            <Camera className="h-16 w-16 text-primary" />
                                        </div>
                                        <p className="text-2xl text-white/40 font-medium italic">Placez votre carte face à la caméra ou sur le lecteur</p>
                                    </div>
                                )}
                                {/* Decorative Scan Frame */}
                                <div className="absolute inset-12 border-2 border-dashed border-primary/20 rounded-3xl" />
                                <div className="absolute top-12 left-12 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                                <div className="absolute top-12 right-12 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                                <div className="absolute bottom-12 left-12 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                                <div className="absolute bottom-12 right-12 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />

                                {isScanning && <div className="absolute inset-x-0 top-0 h-2 bg-primary/50 blur-sm animate-scan-beam" />}
                            </div>

                            <div className="flex gap-6 justify-center">
                                <Button variant="ghost" onClick={() => setStep('CONSENT')} className="h-20 px-12 text-xl font-black uppercase tracking-widest border border-white/10 rounded-3xl">
                                    Retour
                                </Button>
                                <Button onClick={simulateScan} disabled={isScanning} className="h-20 px-16 text-xl font-black uppercase tracking-widest bg-primary rounded-3xl shadow-glow">
                                    Scanner maintenant
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'DETAILS' && (
                        <div className="glass-card p-16 rounded-[48px] animate-slide-up space-y-12 border-white/10">
                            <div className="space-y-4 text-center">
                                <h3 className="text-4xl font-black uppercase tracking-tight">VÉRIFICATION <span className="text-primary italic">FINALE.</span></h3>
                                <p className="text-white/40 text-lg">Confirmez vos informations et précisez le motif de votre visite.</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest ml-1 text-primary">Prénom</Label>
                                    <Input
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="h-16 rounded-2xl bg-white/5 border-white/10 text-xl font-bold px-6"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest ml-1 text-primary">Nom</Label>
                                    <Input
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="h-16 rounded-2xl bg-white/5 border-white/10 text-xl font-bold px-6"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest ml-1 text-primary">Entreprise</Label>
                                    <Input
                                        placeholder="Ex: Cogip Inc."
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        className="h-16 rounded-2xl bg-white/5 border-white/10 text-xl font-bold px-6"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest ml-1 text-primary">Motif de visite</Label>
                                    <Input
                                        placeholder="Ex: Rendez-vous technique"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="h-16 rounded-2xl bg-white/5 border-white/10 text-xl font-bold px-6"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <Button variant="ghost" onClick={() => setStep('SCAN')} className="h-20 flex-1 text-xl font-black uppercase tracking-widest border border-white/10 rounded-3xl">
                                    Retour
                                </Button>
                                <Button onClick={handleSubmit} disabled={isSubmitting || !firstName || !lastName || !company} className="h-20 flex-[2] text-xl font-black uppercase tracking-widest bg-primary rounded-3xl shadow-glow gap-3">
                                    {isSubmitting ? <Loader2 className="h-8 w-8 animate-spin" /> : "Valider mon arrivée"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'SUCCESS' && (
                        <div className="text-center space-y-12 animate-bounce-in">
                            <div className="space-y-6">
                                <div className="h-32 w-32 rounded-[40px] bg-success/20 flex items-center justify-center mx-auto mb-12 border border-success/30">
                                    <CheckCircle2 className="h-16 w-16 text-success" />
                                </div>
                                <h1 className="text-6xl font-black uppercase tracking-tighter">ENREGISTREMENT <br /> <span className="text-success italic">TERMINÉ.</span></h1>
                                <p className="text-2xl text-white/40 font-medium max-w-2xl mx-auto italic">
                                    Veuillez présenter ce badge QR au gardien à l'entrée.
                                </p>
                            </div>

                            <div className="glass-card max-w-md mx-auto p-12 rounded-[48px] border-white/10 space-y-8 group">
                                <div className="p-8 bg-white rounded-[32px] shadow-glow-sm group-hover:scale-105 transition-transform duration-700">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrCodeData}`}
                                        alt="Visitor QR"
                                        className="w-full h-full rounded-xl"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase tracking-[0.4em] text-white/30">Code Visiteur</p>
                                    <p className="text-4xl font-black font-mono text-primary uppercase">{qrCodeData?.split('-')[2]}</p>
                                </div>
                            </div>

                            <Button
                                onClick={() => {
                                    setStep('WELCOME');
                                    setFirstName('');
                                    setLastName('');
                                    setCompany('');
                                    setReason('');
                                    setConsent(false);
                                }}
                                variant="ghost"
                                className="h-20 px-12 text-xl font-black uppercase tracking-widest border border-white/5 rounded-3xl hover:bg-white/5"
                            >
                                Terminer
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            <footer className="text-center pt-12 pb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10">
                    © 2026 SECUREACCESS TECHNOLOGY • SYSTEM STATUS: ONLINE
                </p>
            </footer>
        </div>
    );
}
