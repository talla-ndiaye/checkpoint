import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardMinimalProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    variant?: "default" | "success" | "accent";
    className?: string;
}

export function StatCardMinimal({
    title,
    value,
    icon: Icon,
    variant = "default",
    className,
}: StatCardMinimalProps) {
    const variants = {
        default: "bg-primary/5 text-primary border-primary/10 shadow-primary/5",
        success: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-500/5",
        accent: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-500/5",
    };

    const iconVariants = {
        default: "bg-primary/10 text-primary",
        success: "bg-emerald-100 text-emerald-600",
        accent: "bg-amber-100 text-amber-600",
    };

    return (
        <div className={cn(
            "p-6 rounded-[2.5rem] border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group",
            variants[variant],
            className
        )}>
            <div className="flex items-center gap-5">
                <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12",
                    iconVariants[variant]
                )}>
                    <Icon className="h-7 w-7" />
                </div>
                <div>
                    <p className="text-xs font-black uppercase tracking-widest opacity-60">
                        {title}
                    </p>
                    <p className="text-3xl font-black tracking-tight mt-0.5">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}
