import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function PWAInstallPrompt() {
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setInstallPrompt(e);
            // Show the install button
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsVisible(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) return;

        // Show the install prompt
        installPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await installPrompt.userChoice;

        if (outcome === 'accepted') {
            toast.success("Installation commencée");
            setIsVisible(false);
        } else {
            toast.info("Installation annulée");
        }

        setInstallPrompt(null);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-slate-900 text-white rounded-[2rem] p-5 shadow-2xl border border-white/10 flex items-center gap-4 max-w-sm">
                <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group">
                    <Download className="h-6 w-6 animate-bounce" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-sm">Installer SecureAccess</p>
                    <p className="text-xs text-white/60">Utilisez l'application sur votre écran d'accueil.</p>
                </div>
                <div className="flex flex-col gap-2">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleInstallClick}
                        className="rounded-xl font-bold px-4 h-9"
                    >
                        Installer
                    </Button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-[10px] text-white/40 hover:text-white uppercase tracking-widest font-bold"
                    >
                        Plus tard
                    </button>
                </div>
            </div>
        </div>
    );
}
