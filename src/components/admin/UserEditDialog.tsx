import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserProfile } from "@/hooks/useUsers";
import { UserCircle, Shield, Key } from "lucide-react";

interface UserEditDialogProps {
    user: UserProfile | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (userId: string, data: any) => Promise<boolean>;
}

export function UserEditDialog({ user, open, onOpenChange, onSubmit }: UserEditDialogProps) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone || "",
                password: "",
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        const updateData: any = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
        };
        if (formData.password) {
            updateData.password = formData.password;
        }

        const success = await onSubmit(user.id, updateData);
        if (success) {
            onOpenChange(false);
        }
        setLoading(true); // Wait for feedback before resetting
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-2 shadow-2xl overflow-hidden p-0">
                <div className="bg-primary/5 p-8 border-b border-primary/10">
                    <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                        <UserCircle className="h-8 w-8 text-primary" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-slate-900 uppercase">Modifier Utilisateur</DialogTitle>
                        <p className="text-slate-500 font-medium">Mise à jour des informations pour {user?.email}</p>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700 ml-1">Prénom</Label>
                            <Input
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                                className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700 ml-1">Nom</Label>
                            <Input
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                required
                                className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-primary/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700 ml-1">Téléphone</Label>
                        <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-primary/50"
                            placeholder="+221 ..."
                        />
                    </div>

                    <div className="space-y-2 pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Key className="h-4 w-4 text-amber-500" />
                            <Label className="text-sm font-extrabold text-slate-900">Changer le mot de passe</Label>
                        </div>
                        <Input
                            type="password"
                            placeholder="Laissez vide pour ne pas changer"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-amber-500/50"
                        />
                        <p className="text-[10px] text-slate-400 font-medium">Min. 6 caractères pour le nouveau mot de passe.</p>
                    </div>

                    <DialogFooter className="pt-6">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-12 rounded-xl font-bold">
                            Annuler
                        </Button>
                        <Button type="submit" disabled={loading} className="h-12 bg-primary px-8 rounded-xl font-bold shadow-lg shadow-primary/20">
                            {loading ? "Enregistrement..." : "Mettre à jour"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
