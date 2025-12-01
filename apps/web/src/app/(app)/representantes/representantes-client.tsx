"use client";

import { Button, cn } from "@morina/ui";
import {
  Building2,
  CheckCircle2,
  Edit,
  Mail,
  MapPin,
  Percent,
  Phone,
  User,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DataGridMasterpiece, type Column } from "@/components/data-grid-masterpiece";
import { notificationCenter } from "@/components/notifications/notification-center";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";

type Representante = {
  representanteId: string;
  orgId: string;
  clienteId: string;
  nome: string;
  documento: string;
  email: string | null;
  telefone: string | null;
  celular: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  percentualComissao: number;
  status: "ativo" | "inativo" | "suspenso";
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
  cliente?: {
    nome: string;
    tipo: "fisica" | "juridica";
  };
};

type RepresentantesResponse = {
  itens: Representante[];
  proximoCursor?: string | null;
};

export function RepresentantesClient() {
  const router = useRouter();
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRepresentantes();
  }, []);

  async function loadRepresentantes() {
    setLoading(true);
    try {
      const response = await fetch(`/api/representantes`, {
        headers: {
          ...getAuthHeadersWithTenant(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: RepresentantesResponse = await response.json();
        setRepresentantes(data.itens || []);
      }
    } catch (error) {
      console.error("Erro ao carregar representantes:", error);
      notificationCenter.add({
        type: "error",
        title: "Erro ao carregar representantes",
        message: "Não foi possível carregar a lista de representantes",
      });
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<Representante>[] = [
    {
      key: "nome",
      header: "Representante",
      sortable: true,
      render: (rep) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--primary-color)_15%,transparent)]">
            <User className="h-5 w-5 text-[var(--primary-color)]" />
          </div>
          <div>
            <p className="font-medium text-[var(--fg)]">{rep.nome}</p>
            <p className="text-xs font-mono text-[var(--muted-soft)]">{rep.documento}</p>
          </div>
        </div>
      ),
    },
    {
      key: "cliente",
      header: "Cliente Vinculado",
      render: (rep) => (
        <div className="flex items-center gap-2">
          {rep.cliente?.tipo === "juridica" ? (
            <Building2 className="h-4 w-4 text-[var(--primary-color)]" />
          ) : (
            <User className="h-4 w-4 text-[var(--accent-color)]" />
          )}
          <span className="text-sm text-[var(--muted-strong)]">
            {rep.cliente?.nome || "Não informado"}
          </span>
        </div>
      ),
    },
    {
      key: "percentualComissao",
      header: "Comissão",
      width: "120px",
      align: "center",
      sortable: true,
      render: (rep) => (
        <div className="flex items-center justify-center gap-1.5 font-semibold text-[var(--primary-color)]">
          <Percent className="h-4 w-4" />
          <span>{rep.percentualComissao.toFixed(2)}%</span>
        </div>
      ),
    },
    {
      key: "contato",
      header: "Contato",
      render: (rep) => (
        <div className="space-y-1">
          {rep.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3.5 w-3.5 text-[var(--muted-soft)]" />
              <span className="text-[var(--muted-strong)]">{rep.email}</span>
            </div>
          )}
          {(rep.telefone || rep.celular) && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3.5 w-3.5 text-[var(--muted-soft)]" />
              <span className="text-[var(--muted-strong)]">
                {rep.celular || rep.telefone}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "localizacao",
      header: "Localização",
      render: (rep) => {
        if (!rep.cidade && !rep.estado) return <span className="text-[var(--muted-soft)]">-</span>;
        return (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-3.5 w-3.5 text-[var(--muted-soft)]" />
            <span className="text-[var(--muted-strong)]">
              {rep.cidade}
              {rep.cidade && rep.estado && ", "}
              {rep.estado}
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      width: "120px",
      align: "center",
      sortable: true,
      render: (rep) => (
        <div className="flex justify-center">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              rep.status === "ativo"
                ? "bg-[color-mix(in_oklab,var(--success-color)_15%,transparent)] text-[var(--success-color)] border border-[color-mix(in_oklab,var(--success-color)_30%,transparent)]"
                : rep.status === "inativo"
                  ? "bg-[color-mix(in_oklab,var(--muted-soft)_15%,transparent)] text-[var(--muted-soft)] border border-[color-mix(in_oklab,var(--muted-soft)_30%,transparent)]"
                  : "bg-[color-mix(in_oklab,var(--warning-color)_15%,transparent)] text-[var(--warning-color)] border border-[color-mix(in_oklab,var(--warning-color)_30%,transparent)]"
            )}
          >
            {rep.status === "ativo" ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            <span className="capitalize">{rep.status}</span>
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      width: "100px",
      align: "center",
      render: (rep) => (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/representantes/${rep.representanteId}/edit`);
            }}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {representantes.map((rep) => (
          <div
            key={rep.representanteId}
            className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-[var(--radius-sm)] p-4 transition-all duration-200 hover:shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.15)]"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-[var(--radius-sm)] bg-[hsl(var(--primary)/0.1)] flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-[hsl(var(--primary))]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base text-[hsl(var(--text-1))] truncate">{rep.nome}</h3>
                  <p className="text-sm text-[hsl(var(--text-3))] truncate">{rep.documento}</p>
                </div>
              </div>
              <span
                className={cn(
                  "px-2 py-1 text-xs font-medium rounded-[var(--radius-sm)] flex-shrink-0",
                  rep.status === "ativo"
                    ? "bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]"
                    : rep.status === "inativo"
                      ? "bg-[hsl(var(--text-3)/0.1)] text-[hsl(var(--text-3))]"
                      : "bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))]"
                )}
              >
                {rep.status === "ativo" ? "Ativo" : rep.status === "inativo" ? "Inativo" : "Suspenso"}
              </span>
            </div>

            {/* Client info */}
            {rep.cliente && (
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-[hsl(var(--text-3))] flex-shrink-0" />
                <span className="text-sm text-[hsl(var(--text-2))] truncate">{rep.cliente.nome}</span>
              </div>
            )}

            {/* Contact info */}
            {(rep.email || rep.telefone || rep.celular) && (
              <div className="space-y-1 mb-3">
                {rep.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[hsl(var(--text-3))] flex-shrink-0" />
                    <span className="text-sm text-[hsl(var(--text-2))] truncate">{rep.email}</span>
                  </div>
                )}
                {(rep.telefone || rep.celular) && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[hsl(var(--text-3))] flex-shrink-0" />
                    <span className="text-sm text-[hsl(var(--text-2))]">
                      {rep.celular || rep.telefone}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Commission */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[hsl(var(--border))]">
              <Percent className="w-4 h-4 text-[hsl(var(--text-3))] flex-shrink-0" />
              <span className="text-sm font-medium text-[hsl(var(--text-1))]">
                Comissão: {rep.percentualComissao}%
              </span>
            </div>

            {/* Actions - Touch-friendly */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                className="flex-1 h-11 tap-target no-select"
                onClick={() => router.push(`/representantes/${rep.representanteId}/edit`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-11 tap-target no-select"
                onClick={() => router.push(`/representantes/${rep.representanteId}`)}
              >
                Ver Detalhes
              </Button>
            </div>
          </div>
        ))}

        {representantes.length === 0 && !loading && (
          <div className="text-center py-12">
            <User className="w-12 h-12 mx-auto mb-3 text-[hsl(var(--text-3))]" />
            <p className="text-[hsl(var(--text-2))]">Nenhum representante cadastrado</p>
          </div>
        )}
      </div>

      {/* Desktop DataGrid */}
      <div className="hidden md:block">
        <DataGridMasterpiece
          data={representantes}
          columns={columns}
          title="Representantes"
          description="Gerencie os representantes de vendas e suas comissões"
          loading={loading}
          searchPlaceholder="Buscar por nome, documento, cliente..."
          onAdd={() => router.push("/representantes/novo")}
          onRowClick={(rep) => router.push(`/representantes/${rep.representanteId}`)}
        />
      </div>
    </div>
  );
}
