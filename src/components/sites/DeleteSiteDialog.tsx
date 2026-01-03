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
import { Site } from '@/hooks/useSites';

interface DeleteSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: Site | null;
  onConfirm: () => Promise<void>;
}

export function DeleteSiteDialog({ open, onOpenChange, site, onConfirm }: DeleteSiteDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le site</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer le site "{site?.name}" ? 
            Cette action est irréversible et supprimera également toutes les entreprises, 
            employés et gardiens associés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
