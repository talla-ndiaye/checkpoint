import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserProfile } from "@/hooks/useUsers";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Mail, Phone, MoreVertical, Building2, Briefcase } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UsersTableProps {
  users: UserProfile[];
  onEdit: (user: UserProfile) => void;
  onDelete: (user: UserProfile) => void;
}

export function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  return (
    <div className="rounded-[2rem] border border-border bg-white overflow-hidden shadow-sm pr-1">
      <Table>
        <TableHeader className="bg-slate-50/80">
          <TableRow className="border-b border-border hover:bg-transparent">
            <TableHead className="font-black text-slate-900 h-16 pl-8 uppercase text-[10px] tracking-widest">Utilisateur</TableHead>
            <TableHead className="font-black text-slate-900 h-16 uppercase text-[10px] tracking-widest">Email & Contact</TableHead>
            <TableHead className="font-black text-slate-900 h-16 uppercase text-[10px] tracking-widest">Rôles</TableHead>
            <TableHead className="text-right font-black text-slate-900 h-16 pr-8 uppercase text-[10px] tracking-widest">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-64 text-center text-slate-400 font-medium italic">
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-8 w-8 opacity-20" />
                  Aucun utilisateur trouvé
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className="group border-b border-border/50 hover:bg-slate-50/50 transition-colors">
                <TableCell className="py-5 pl-8">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/20 shadow-sm">
                      {user.first_name[0]}{user.last_name[0]}
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-base">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                        ID: {user.id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-slate-600 text-sm">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 font-semibold text-slate-400 text-xs">
                        <Phone className="h-3 w-3" />
                        {user.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-5">
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((role) => (
                      <RoleBadge key={role} role={role} />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="py-5 text-right pr-6">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEdit(user)}
                      className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-200/50 transition-colors">
                          <MoreVertical className="h-5 w-5 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl border-2 p-2 w-56 font-bold shadow-xl">
                         <div className="px-3 py-2 text-[10px] text-slate-400 uppercase tracking-widest">Administration</div>
                        <DropdownMenuItem 
                          className="rounded-xl gap-3 py-3 cursor-pointer focus:bg-primary/5"
                          onClick={() => onEdit(user)}
                        >
                          <Edit className="h-4 w-4 text-primary" />
                          Modifier le profil
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="rounded-xl gap-3 py-3 text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer"
                          onClick={() => onDelete(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer le compte
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

import { Users } from "lucide-react";
