"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
    Mail,
    Phone,
    MapPin,
    FileText,
    Eye,
    Edit,
    Plus,
    AlertCircle,
} from "lucide-react";
import { Button, Badge } from "@morina/ui";
import type { Supplier } from "@/lib/api/suppliers";
import { useRouter } from "next/navigation";

// Tipo para fornecedores que vêm de fichas-custo (apenas nome)
export type FornecedorFichaCusto = {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    document: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    status: "ativo";
    notes: string | null;
    createdBy: "sistema";
    updatedBy: "sistema";
    createdAt: string;
    updatedAt: string;
    orgId: string;
    origem: "ficha-custo"; // Identificador de origem
};

export type FornecedorCompleto = Supplier | FornecedorFichaCusto;

const getStatusBadgeStyle = (status: string) => {
    switch (status) {
        case "ativo":
            return "bg-green-500/10 text-green-400 border-green-500/20";
        case "inativo":
            return "bg-red-500/10 text-red-400 border-red-500/20";
        case "suspenso":
            return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
        default:
            return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
};

export function useFornecedoresColumns() {
    const router = useRouter();

    const columns: ColumnDef<FornecedorCompleto>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <input
                    type="checkbox"
                    checked={table.getIsAllPageRowsSelected()}
                    onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-white/30 bg-white/5 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))] focus:ring-offset-0 cursor-pointer"
                />
            ),
            cell: ({ row }) => {
                const isFromFichaCusto =
                    "origem" in row.original && row.original.origem === "ficha-custo";

                if (isFromFichaCusto) {
                    return null; // Não permite seleção de fornecedores de fichas-custo
                }

                return (
                    <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        onChange={(e) => row.toggleSelected(e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded-sm border-white/30 bg-white/5 text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))] focus:ring-offset-0 cursor-pointer"
                    />
                );
            },
            enableSorting: false,
            size: 50,
        },
        {
            accessorKey: "name",
            header: "Nome",
            cell: ({ row }) => {
                const isFromFichaCusto =
                    "origem" in row.original && row.original.origem === "ficha-custo";

                return (
                    <div className="flex items-center gap-3">
                        <span className="text-white font-medium">{row.original.name}</span>
                        {isFromFichaCusto && (
                            <span className="flex-shrink-0 inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20 uppercase tracking-wide">
                                Autodetectado
                            </span>
                        )}
                    </div>
                );
            },
            enableSorting: true,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                const variant = status === "ativo" ? "success" : status === "inativo" ? "danger" : status === "suspenso" ? "warning" : "info";
                return (
                    <Badge variant={variant} size="sm">
                        {status}
                    </Badge>
                );
            },
            enableSorting: true,
            size: 120,
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-white/70">
                    {row.original.email ? (
                        <>
                            <Mail className="h-3.5 w-3.5 text-white/40" />
                            <span className="truncate">{row.original.email}</span>
                        </>
                    ) : (
                        <span className="text-white/40">-</span>
                    )}
                </div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "phone",
            header: "Telefone",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-white/70">
                    {row.original.phone ? (
                        <>
                            <Phone className="h-3.5 w-3.5 text-white/40" />
                            <span className="truncate">{row.original.phone}</span>
                        </>
                    ) : (
                        <span className="text-white/40">-</span>
                    )}
                </div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "document",
            header: "Documento",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-white/70">
                    {row.original.document ? (
                        <>
                            <FileText className="h-3.5 w-3.5 text-white/40" />
                            <span className="truncate font-mono text-xs">
                                {row.original.document}
                            </span>
                        </>
                    ) : (
                        <span className="text-white/40">-</span>
                    )}
                </div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "city",
            header: "Localização",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 text-white/70">
                    {row.original.city || row.original.state ? (
                        <>
                            <MapPin className="h-3.5 w-3.5 text-white/40" />
                            <span className="truncate">
                                {[row.original.city, row.original.state]
                                    .filter(Boolean)
                                    .join(", ")}
                            </span>
                        </>
                    ) : (
                        <span className="text-white/40">-</span>
                    )}
                </div>
            ),
            enableSorting: false,
        },
        {
            id: "actions",
            header: "Ações",
            cell: ({ row }) => {
                const isFromFichaCusto =
                    "origem" in row.original && row.original.origem === "ficha-custo";

                if (isFromFichaCusto) {
                    return (
                        <Button
                            size="sm"
                            className="bg-[hsl(var(--primary))/20] hover:bg-[hsl(var(--primary))/30] text-[hsl(var(--primary))] border border-[hsl(var(--primary))/30] rounded-none h-8 text-xs whitespace-nowrap"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                    `/fornecedores/new?nome=${encodeURIComponent(
                                        row.original.name
                                    )}&documento=${encodeURIComponent(
                                        row.original.document || ""
                                    )}`
                                );
                            }}
                        >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Cadastrar
                        </Button>
                    );
                }

                return (
                    <div className="flex items-center gap-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-white/10 rounded-none text-white/70 hover:text-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/fornecedores/${row.original.id}`);
                            }}
                            title="Ver Detalhes"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-white/10 rounded-none text-white/70 hover:text-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/fornecedores/${row.original.id}/edit`);
                            }}
                            title="Editar"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
            enableSorting: false,
            size: 150,
        },
    ];

    return columns;
}
