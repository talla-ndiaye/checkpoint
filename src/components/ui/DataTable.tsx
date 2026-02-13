import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Column<T> {
    header: string;
    accessorKey: keyof T | string;
    cell?: (row: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    searchPlaceholder?: string;
    searchKey?: keyof T;
    isLoading?: boolean;
}

export function DataTable<T>({
    data,
    columns,
    searchPlaceholder = "Rechercher...",
    searchKey,
    isLoading
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filteredData = data.filter((item) => {
        if (!searchTerm || !searchKey) return true;
        const value = String(item[searchKey] || "").toLowerCase();
        return value.includes(searchTerm.toLowerCase());
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-border shadow-sm">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-11 rounded-2xl border-slate-200 focus:ring-primary/20 transition-all h-12"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Placeholder for more filters */}
                    <Button variant="outline" className="rounded-2xl gap-2 h-12 border-slate-200">
                        <Filter className="h-4 w-4" />
                        Filtres
                    </Button>
                </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/80">
                        <TableRow className="border-b border-border hover:bg-transparent">
                            {columns.map((col, idx) => (
                                <TableHead key={idx} className={`font-black text-slate-900 h-16 uppercase text-[10px] tracking-widest ${col.className}`}>
                                    {col.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-64 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                                        <span className="text-sm font-bold text-slate-400">Chargement...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : currentData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-64 text-center text-slate-400 font-medium italic">
                                    Aucune donnée trouvée
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentData.map((row, rowIdx) => (
                                <TableRow key={rowIdx} className="group border-b border-border/50 hover:bg-slate-50/50 transition-colors">
                                    {columns.map((col, colIdx) => (
                                        <TableCell key={colIdx} className={`py-5 ${col.className}`}>
                                            {col.cell ? col.cell(row) : (row[col.accessorKey as keyof T] as React.ReactNode)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2">
                    <p className="text-sm text-slate-500 font-medium">
                        Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredData.length)} sur {filteredData.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="rounded-xl"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className="h-9 w-9 rounded-xl font-bold"
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="rounded-xl"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
