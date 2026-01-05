import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CompanyAdmin } from '@/hooks/useCompanyAdmins';

interface DeleteCompanyAdminDialogProps {
  admin: CompanyAdmin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteCompanyAdminDialog({
  admin,
  open,
  onOpenChange,
  onConfirm,
}: DeleteCompanyAdminDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Retirer l'administrateur</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir retirer{' '}
            <strong>{admin?.profile?.first_name} {admin?.profile?.last_name}</strong>{' '}
            de l'administration de <strong>{admin?.company?.name}</strong> ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Retirer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
