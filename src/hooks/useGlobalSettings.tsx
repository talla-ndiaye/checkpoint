import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

export type GlobalSettings = Tables<'global_settings'>;

export function useGlobalSettings() {
    const [settings, setSettings] = useState<GlobalSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('global_settings')
                .select('*')
                .maybeSingle();

            if (error) throw error;
            setSettings(data as GlobalSettings);
        } catch (error: any) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newData: Partial<GlobalSettings>) => {
        try {
            const { data, error } = await supabase
                .from('global_settings')
                .update({
                    ...newData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', settings?.id)
                .select()
                .single();

            if (error) throw error;
            setSettings(data as GlobalSettings);
            toast({
                title: 'Succès',
                description: 'Paramètres mis à jour avec succès',
            });
            return { data: data as GlobalSettings, error: null };
        } catch (error: any) {
            toast({
                title: 'Erreur',
                description: error.message || 'Impossible de mettre à jour les paramètres',
                variant: 'destructive',
            });
            return { data: null, error };
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return {
        settings,
        loading,
        updateSettings,
        refresh: fetchSettings
    };
}
