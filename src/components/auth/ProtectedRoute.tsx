import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, loading, userRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Redirect to auth if not logged in
                navigate('/auth', { state: { from: location } });
            } else if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
                // Redirect to dashboard if role not allowed
                navigate('/dashboard');
            }
        }
    }, [user, loading, userRole, navigate, location, allowedRoles]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground font-black uppercase tracking-widest animate-pulse">
                        Vérification des accès...
                    </p>
                </div>
            </div>
        );
    }

    if (!user || (allowedRoles && userRole && !allowedRoles.includes(userRole))) {
        return null; // Navigation is handled in useEffect
    }

    return <>{children}</>;
}
