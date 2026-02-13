import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Shield, Globe, Lock, Save, Loader2, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGlobalSettings, GlobalSettings } from '@/hooks/useGlobalSettings';

export default function AdminSettings() {
    const { toast } = useToast();
    const { settings, loading, updateSettings } = useGlobalSettings();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<GlobalSettings>>({});

    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    const handleSave = async () => {
        setIsSaving(true);
        const { error } = await updateSettings(formData);
        setIsSaving(false);
    };

    const handleChange = (field: keyof GlobalSettings, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground font-black animate-pulse uppercase tracking-widest">Chargement des paramètres...</p>
                </div>
            </DashboardLayout>
        );
    }

    const SectionHeader = ({ icon: Icon, title, description }: any) => (
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
                <h3 className="text-xl font-black uppercase tracking-tight">{title}</h3>
                <p className="text-sm text-muted-foreground italic">{description}</p>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in pb-12">
                {/* Unified Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner">
                            <Settings className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight gradient-text">Paramètres Système</h1>
                            <p className="text-muted-foreground mt-1 text-lg italic">
                                Configuration globale et règles de sécurité de la plateforme
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving} className="h-14 px-8 rounded-2xl gap-3 font-black text-lg shadow-glow hover:scale-[1.02] transition-all">
                        {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                        Enregistrer les modifications
                    </Button>
                </div>

                <Tabs defaultValue="general" className="space-y-8">
                    <TabsList className="bg-muted/20 p-1.5 rounded-2xl h-14 border border-white/5 backdrop-blur-sm w-full md:w-auto overflow-x-auto justify-start flex-nowrap shrink-0">
                        <TabsTrigger value="general" className="rounded-xl h-11 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-xs tracking-widest transition-all">
                            Général
                        </TabsTrigger>
                        <TabsTrigger value="security" className="rounded-xl h-11 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-xs tracking-widest transition-all">
                            Sécurité
                        </TabsTrigger>
                        <TabsTrigger value="branding" className="rounded-xl h-11 px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-xs tracking-widest transition-all">
                            Personnalisation
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-8 animate-slide-up">
                        <div className="glass-card rounded-[32px] p-10 border-white/10">
                            <SectionHeader
                                icon={Globe}
                                title="Configuration de base"
                                description="Réglages fondamentaux de l'instance SecureAccess."
                            />

                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <Label className="text-sm font-black uppercase tracking-widest text-primary ml-1">Nom de l'organisation</Label>
                                    <Input
                                        value={formData.org_name || ''}
                                        onChange={(e) => handleChange('org_name', e.target.value)}
                                        className="h-14 rounded-2xl bg-white/5 border-white/10 text-lg font-bold"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-sm font-black uppercase tracking-widest text-primary ml-1">URL de support</Label>
                                    <Input
                                        value={formData.support_url || ''}
                                        onChange={(e) => handleChange('support_url', e.target.value)}
                                        className="h-14 rounded-2xl bg-white/5 border-white/10 text-lg font-bold"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-sm font-black uppercase tracking-widest text-primary ml-1">Langue par défaut</Label>
                                    <Input
                                        value={formData.default_language || ''}
                                        onChange={(e) => handleChange('default_language', e.target.value)}
                                        className="h-14 rounded-2xl bg-white/5 border-white/10 text-lg font-bold"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-sm font-black uppercase tracking-widest text-primary ml-1">Fuseau horaire</Label>
                                    <Input
                                        value={formData.timezone || ''}
                                        onChange={(e) => handleChange('timezone', e.target.value)}
                                        className="h-14 rounded-2xl bg-white/5 border-white/10 text-lg font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-8 animate-slide-up">
                        <div className="glass-card rounded-[32px] p-10 border-white/10 space-y-10">
                            <SectionHeader
                                icon={Shield}
                                title="Politique de sécurité"
                                description="Contrôlez les règles d'accès et d'authentification."
                            />

                            <div className="space-y-8">
                                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
                                    <div className="space-y-1">
                                        <p className="font-black text-lg uppercase tracking-tight">Authentification à deux facteurs (2FA) obligatoire</p>
                                        <p className="text-sm text-muted-foreground">Exiger le 2FA pour tous les administrateurs et managers.</p>
                                    </div>
                                    <Switch
                                        checked={formData.mfa_required || false}
                                        onCheckedChange={(checked) => handleChange('mfa_required', checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
                                    <div className="space-y-1">
                                        <p className="font-black text-lg uppercase tracking-tight">Expiration automatique de session</p>
                                        <p className="text-sm text-muted-foreground">Déconnecter après X heures d'inactivité.</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="number"
                                            value={formData.session_timeout_hours || 0}
                                            onChange={(e) => handleChange('session_timeout_hours', parseInt(e.target.value))}
                                            className="w-20 text-center h-10 rounded-xl"
                                        />
                                        <Switch
                                            checked={!!formData.session_timeout_hours}
                                            onCheckedChange={(checked) => handleChange('session_timeout_hours', checked ? 2 : 0)}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
                                    <div className="space-y-1">
                                        <p className="font-black text-lg uppercase tracking-tight">Geofencing des accès</p>
                                        <p className="text-sm text-muted-foreground">Restreindre l'utilisation du badge QR à une zone de 50m autour du site.</p>
                                    </div>
                                    <Switch
                                        checked={formData.geofencing_enabled || false}
                                        onCheckedChange={(checked) => handleChange('geofencing_enabled', checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="glass-card rounded-[32px] p-10 border-white/10">
                            <SectionHeader
                                icon={Lock}
                                title="Intégrité des Données"
                                description="Maintenance et rétention des journaux d'accès."
                            />
                            <div className="space-y-4">
                                <Label className="text-sm font-black uppercase tracking-widest text-primary ml-1">Délai de rétention (mois)</Label>
                                <Input
                                    type="number"
                                    value={formData.retention_months || 0}
                                    onChange={(e) => handleChange('retention_months', parseInt(e.target.value))}
                                    className="h-14 w-32 rounded-2xl bg-white/5 border-white/10 text-lg font-bold"
                                />
                                <p className="text-xs text-muted-foreground italic">Les logs plus vieux que 12 mois seront archivés automatiquement.</p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="branding" className="space-y-8 animate-slide-up">
                        <div className="glass-card rounded-[32px] p-10 border-white/10">
                            <SectionHeader
                                icon={Palette}
                                title="Identité Visuelle"
                                description="Personnalisez l'apparence de la plateforme pour votre marque."
                            />

                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <Label className="text-sm font-black uppercase tracking-widest text-primary ml-1">Couleur primaire</Label>
                                    <div className="flex gap-4">
                                        <Input
                                            value={formData.primary_color || ''}
                                            onChange={(e) => handleChange('primary_color', e.target.value)}
                                            className="h-14 rounded-2xl bg-white/5 border-white/10 text-lg flex-1 font-bold"
                                        />
                                        <div className="h-14 w-14 rounded-2xl border border-white/20" style={{ backgroundColor: formData.primary_color }} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-sm font-black uppercase tracking-widest text-primary ml-1">Couleur d'accentuation</Label>
                                    <div className="flex gap-4">
                                        <Input
                                            value={formData.accent_color || ''}
                                            onChange={(e) => handleChange('accent_color', e.target.value)}
                                            className="h-14 rounded-2xl bg-white/5 border-white/10 text-lg flex-1 font-bold"
                                        />
                                        <div className="h-14 w-14 rounded-2xl border border-white/20" style={{ backgroundColor: formData.accent_color }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
