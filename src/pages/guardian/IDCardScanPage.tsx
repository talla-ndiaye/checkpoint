import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { IDCardScanPanel } from '@/components/guardian/IDCardScanPanel';

export default function IDCardScanPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <CreditCard className="h-7 w-7 text-primary" />
            Scanner CNI
          </h1>
          <p className="text-muted-foreground mt-1">
            Scannez ou importez une carte d'identité pour enregistrer un visiteur
          </p>
        </div>
        <IDCardScanPanel />
      </div>
    </DashboardLayout>
  );
}
