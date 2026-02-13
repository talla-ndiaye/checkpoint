import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import { IDCardScanPanel } from '@/components/guardian/IDCardScanPanel';

export default function IDCardScanPage() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-2 animate-bounce-in">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Scanner CNI
          </h1>
          <p className="text-muted-foreground">
            Scannez ou importez une carte d'identité pour enregistrer un visiteur
          </p>
        </div>

        <div className="rounded-3xl p-1 shadow-2xl overflow-hidden animate-slide-up">
          <IDCardScanPanel />
        </div>
      </div>
    </DashboardLayout>
  );
}
