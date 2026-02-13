import { useState } from 'react';
import { Shield, Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export default function Contact() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('contact_messages')
                .insert([formData]);

            if (error) throw error;

            setSubmitted(true);
            toast.success('Message envoyé avec succès !');
            setFormData({ full_name: '', email: '', subject: '', message: '' });
        } catch (error: any) {
            toast.error('Erreur lors de l\'envoi du message : ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fcfcfd] text-foreground">
            {/* Navigation - Simplified */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-4 group">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">SECURE<span className="text-primary italic">ACCESS</span></span>
                    </Link>
                    <Link to="/">
                        <Button variant="ghost" className="font-bold">Retour à l'accueil</Button>
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-16 items-start">

                            {/* Left Side: Info */}
                            <div className="space-y-12">
                                <div className="space-y-6">
                                    <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-tight">
                                        Parlons de votre <br />
                                        <span className="text-primary italic">Projet.</span>
                                    </h1>
                                    <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                        Vous avez des questions sur nos solutions multi-sites ou besoin d'une démo personnalisée ?
                                        Notre équipe d'experts est à votre écoute.
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex gap-6 p-6 rounded-3xl bg-white border border-border shadow-sm">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0">
                                            <Mail className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">Email</h4>
                                            <p className="text-slate-500 font-medium">contact@secureaccess.com</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6 p-6 rounded-3xl bg-white border border-border shadow-sm">
                                        <div className="h-12 w-12 rounded-2xl bg-accent/5 flex items-center justify-center shrink-0">
                                            <Phone className="h-6 w-6 text-accent" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">Téléphone</h4>
                                            <p className="text-slate-500 font-medium">+221 33 800 00 00</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6 p-6 rounded-3xl bg-white border border-border shadow-sm">
                                        <div className="h-12 w-12 rounded-2xl bg-amber-500/5 flex items-center justify-center shrink-0">
                                            <MapPin className="h-6 w-6 text-amber-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">Siège Social</h4>
                                            <p className="text-slate-500 font-medium">Avenue Cheikh Anta Diop, Dakar, Sénégal</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Form */}
                            <div className="bg-white p-8 md:p-12 rounded-[48px] border border-border shadow-2xl relative overflow-hidden">
                                {submitted ? (
                                    <div className="text-center space-y-6 py-12 animate-fade-in">
                                        <div className="h-24 w-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                            <CheckCircle2 className="h-12 w-12 text-success" />
                                        </div>
                                        <h2 className="text-3xl font-black text-slate-900 uppercase">Message Envoyé !</h2>
                                        <p className="text-slate-500 font-medium">
                                            Merci pour votre message. Un de nos conseillers vous répondra sous 24 heures.
                                        </p>
                                        <Button
                                            onClick={() => setSubmitted(false)}
                                            variant="outline"
                                            className="rounded-2xl h-14 px-8 font-bold border-2"
                                        >
                                            Envoyer un autre message
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                                        <div className="space-y-2 text-center mb-8">
                                            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <MessageSquare className="h-6 w-6 text-primary" />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Envoyez-nous un message</h3>
                                            <p className="text-sm text-slate-400 font-medium uppercase tracking-widest">Réponse rapide garantie</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="full_name" className="text-sm font-bold text-slate-700 ml-1">Nom complet</Label>
                                                <Input
                                                    id="full_name"
                                                    required
                                                    placeholder="Ex: Amadou Fall"
                                                    className="h-14 rounded-2xl bg-slate-50 border-border focus:border-primary/50"
                                                    value={formData.full_name}
                                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-sm font-bold text-slate-700 ml-1">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    placeholder="amadou@entreprise.com"
                                                    className="h-14 rounded-2xl bg-slate-50 border-border focus:border-primary/50"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="subject" className="text-sm font-bold text-slate-700 ml-1">Objet</Label>
                                            <Input
                                                id="subject"
                                                required
                                                placeholder="Ex: Demande de devis multi-sites"
                                                className="h-14 rounded-2xl bg-slate-50 border-border focus:border-primary/50"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="message" className="text-sm font-bold text-slate-700 ml-1">Message</Label>
                                            <Textarea
                                                id="message"
                                                required
                                                placeholder="Dites-nous en plus sur vos besoins..."
                                                className="min-h-[150px] rounded-[32px] bg-slate-50 border-border focus:border-primary/50 p-6"
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-16 rounded-[28px] text-lg font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {loading ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    Envoi en cours...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Send className="h-5 w-5" />
                                                    Envoyer mon message
                                                </div>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Basic Footer */}
            <footer className="py-12 border-t border-border mt-20">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-sm font-bold text-slate-400">
                        © 2026 SecureAccess Technology. Tous droits réservés.
                    </p>
                </div>
            </footer>
        </div>
    );
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}
