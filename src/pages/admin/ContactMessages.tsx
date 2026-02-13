import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
    Mail,
    MessageSquare,
    Clock,
    User,
    Trash2,
    CheckCircle2,
    Search,
    Loader2,
    Inbox,
    MoreVertical,
    Archive,
    RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContactMessage {
    id: string;
    full_name: string;
    email: string;
    subject: string;
    message: string;
    status: string;
    created_at: string;
}

export default function ContactMessages() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string | null>(null);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);
        } catch (error: any) {
            toast.error('Erreur lors du chargement des messages : ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const updateMessageStatus = async (id: string, status: string) => {
        try {
            const { error } = await supabase
                .from('contact_messages')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            setMessages(messages.map(m => m.id === id ? { ...m, status } : m));
            toast.success(`Message marqué comme ${status === 'read' ? 'lu' : 'archivé'}`);
        } catch (error: any) {
            toast.error('Erreur : ' + error.message);
        }
    };

    const deleteMessage = async (id: string) => {
        try {
            const { error } = await supabase
                .from('contact_messages')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setMessages(messages.filter(m => m.id !== id));
            toast.success('Message supprimé');
        } catch (error: any) {
            toast.error('Erreur : ' + error.message);
        }
    };

    const filteredMessages = messages.filter(m => {
        const matchesSearch =
            m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.subject.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = filterStatus ? m.status === filterStatus : true;

        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'unread':
                return <Badge className="bg-primary hover:bg-primary font-bold">Nouveau</Badge>;
            case 'read':
                return <Badge variant="outline" className="text-muted-foreground border-muted-foreground font-medium">Lu</Badge>;
            case 'archived':
                return <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/5 font-medium">Archivé</Badge>;
            default:
                return null;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="h-16 w-16 rounded-[2rem] bg-indigo-50 flex items-center justify-center shadow-inner group transition-all hover:scale-105">
                            <Inbox className="h-8 w-8 text-indigo-600 group-hover:rotate-12 transition-transform" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900">Boîte de réception</h1>
                            <p className="text-muted-foreground mt-1 text-lg">
                                Gérez les demandes de contact et prospects du site vitrine
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={fetchMessages}
                        variant="outline"
                        className="h-14 px-6 rounded-2xl gap-2 font-bold border-2 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                        Actualiser
                    </Button>
                </div>

                {/* Stats & Search Bar */}
                <div className="bg-card border border-border p-6 rounded-[2.5rem] flex flex-col md:flex-row gap-6 justify-between items-center shadow-sm">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
                        <Input
                            placeholder="Rechercher un expéditeur ou sujet..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200 focus:border-indigo-600/50 transition-all font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant={filterStatus === null ? 'default' : 'ghost'}
                            onClick={() => setFilterStatus(null)}
                            className="rounded-xl font-bold px-5"
                            size="sm"
                        >
                            Tous
                        </Button>
                        <Button
                            variant={filterStatus === 'unread' ? 'default' : 'ghost'}
                            onClick={() => setFilterStatus('unread')}
                            className="rounded-xl font-bold px-5"
                            size="sm"
                        >
                            Nouveaux
                        </Button>
                        <Button
                            variant={filterStatus === 'archived' ? 'default' : 'ghost'}
                            onClick={() => setFilterStatus('archived')}
                            className="rounded-xl font-bold px-5"
                            size="sm"
                        >
                            Archivés
                        </Button>
                    </div>
                </div>

                {/* Messages List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="bg-white border border-border rounded-[2.5rem] p-24 flex flex-col items-center justify-center gap-4 text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Chargement des messages...</p>
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="bg-white border border-border rounded-[2.5rem] p-24 flex flex-col items-center justify-center gap-4 text-center">
                            <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-2">
                                <MessageSquare className="h-10 w-10 text-slate-200" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">Aucun message trouvé</h3>
                            <p className="text-slate-500 max-w-xs mx-auto font-medium">
                                Les demandes via le formulaire de contact apparaîtront ici.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {filteredMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`group relative bg-white border-2 border-transparent hover:border-indigo-600/20 p-8 rounded-[2.5rem] transition-all duration-300 shadow-sm hover:shadow-xl ${msg.status === 'unread' ? 'ring-2 ring-indigo-600/10' : ''
                                        }`}
                                >
                                    <div className="flex flex-col md:flex-row gap-8 items-start">
                                        {/* Status & Icon */}
                                        <div className="flex flex-col items-center gap-3 shrink-0">
                                            <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${msg.status === 'unread' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                <User className="h-8 w-8" />
                                            </div>
                                            <div className="mt-1">{getStatusBadge(msg.status)}</div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <h3 className={`text-2xl font-black tracking-tight ${msg.status === 'unread' ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                        {msg.subject}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-4 mt-2">
                                                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
                                                            <User className="h-4 w-4 text-indigo-400" />
                                                            {msg.full_name}
                                                        </div>
                                                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
                                                            <Mail className="h-4 w-4 text-indigo-400" />
                                                            {msg.email}
                                                        </div>
                                                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                        <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
                                                            <Clock className="h-4 w-4 text-indigo-400" />
                                                            {format(new Date(msg.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions Dropdown */}
                                                <div className="flex items-center gap-2">
                                                    {msg.status === 'unread' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="rounded-xl h-10 font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                                            onClick={() => updateMessageStatus(msg.id, 'read')}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                                            Marquer lu
                                                        </Button>
                                                    )}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
                                                                <MoreVertical className="h-5 w-5 text-slate-400" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-xl border-2 p-2 w-48 font-bold">
                                                            <DropdownMenuItem
                                                                className="rounded-lg gap-3 py-2 text-amber-600 focus:text-amber-700 focus:bg-amber-50 cursor-pointer"
                                                                onClick={() => updateMessageStatus(msg.id, 'archived')}
                                                            >
                                                                <Archive className="h-4 w-4" />
                                                                Archiver
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="rounded-lg gap-3 py-2 text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer"
                                                                onClick={() => deleteMessage(msg.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Supprimer
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>

                                            <div className="relative">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-100 rounded-full" />
                                                <p className="pl-6 text-slate-600 font-medium leading-relaxed italic bg-slate-50/50 p-6 rounded-3xl whitespace-pre-wrap">
                                                    {msg.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
