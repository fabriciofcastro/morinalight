import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Button,
} from "@morina/ui";
import {
    Edit,
    Eye,
    MoreVertical,
    Trash2,
    CheckCircle2,
    XCircle,
} from "lucide-react";

export function getStatusBadgeStyle(status: string) {
    switch (status) {
        case "ativo":
            return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        case "inativo":
            return "bg-slate-500/10 text-slate-400 border-slate-500/20";
        case "suspenso":
            return "bg-red-500/10 text-red-400 border-red-500/20";
        default:
            return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
}
