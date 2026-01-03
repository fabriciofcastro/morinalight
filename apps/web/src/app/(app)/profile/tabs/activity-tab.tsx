"use client";

import { Button, GlassCard, Input, cn } from "@morina/ui";
import { Activity, Download, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";

export function ActivityTab() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "created" | "updated" | "deleted">("all");

  const [activities] = useState([
    {
      id: "1",
      type: "created",
      description: "Criou um novo produto",
      module: "Catálogo",
      timestamp: new Date(),
    },
    {
      id: "2",
      type: "updated",
      description: "Atualizou informações do cliente",
      module: "Clientes",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "3",
      type: "created",
      description: "Criou nova comissão",
      module: "Comissões",
      timestamp: new Date(Date.now() - 7200000),
    },
  ]);

  const filteredActivities = useMemo(() => {
    let result = activities;

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.description.toLowerCase().includes(query) ||
          a.module.toLowerCase().includes(query),
      );
    }

    if (filter !== "all") {
      result = result.filter((a) => a.type === filter);
    }

    return result;
  }, [activities, search, filter]);

  const handleExport = () => {
    // TODO: Implementar exportação
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar atividades..."
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="flex h-10 border border-white/10 bg-white/5 px-3 text-sm text-white focus:border-[hsl(var(--primary))] focus:outline-none"
          >
            <option value="all">Todas</option>
            <option value="created">Criadas</option>
            <option value="updated">Atualizadas</option>
            <option value="deleted">Excluídas</option>
          </select>

          <Button type="button" variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <GlassCard className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <Activity className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h2 className="text-xl font-semibold text-white">Timeline de Atividades</h2>
        </div>

        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <p className="py-12 text-center text-white/50">Nenhuma atividade encontrada</p>
          ) : (
            filteredActivities.map((activity, idx) => (
              <div key={activity.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded",
                      activity.type === "created" && "bg-green-500/20 text-green-400",
                      activity.type === "updated" && "bg-blue-500/20 text-blue-400",
                      activity.type === "deleted" && "bg-red-500/20 text-red-400",
                    )}
                  >
                    <Activity className="h-4 w-4" />
                  </div>
                  {idx < filteredActivities.length - 1 && (
                    <div className="mt-2 h-full w-px bg-white/10" />
                  )}
                </div>

                <div className="flex-1 pb-4">
                  <p className="font-semibold text-white">{activity.description}</p>
                  <p className="text-sm text-white/50">{activity.module}</p>
                  <p className="text-xs text-white/40">
                    {activity.timestamp.toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}




